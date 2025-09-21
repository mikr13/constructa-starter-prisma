The AI SDK provides a robust, built-in mechanism for request-level timeout control using the `abortSignal` option, which cleanly integrates with your workflow but doesn't directly solve budget splits or multi-branch sequencing on its own.[1][4]

### AI SDK Timeout Setting: Direct Usage

- To limit how long a model request can run, provide an `abortSignal` with a specific timeout (in milliseconds):
```typescript
const result = await generateText({
  model: 'openai/gpt-4o',
  prompt: 'Invent a new holiday.',
  abortSignal: AbortSignal.timeout(5000) // 5 seconds
});
```
- This cancels the request once the elapsed time passes, returning an error or partial result.[4][1]

### How This Relates to Your Mastra Workflow

- **Pros:**  
  - Guarantees tool calls (such as a model request or code search) don't block forever.
  - Can quickly apply a global timeout at step or request granularity when invoking AI SDK functions.
  - Easy to use for each individual operation, especially if your calls are mostly to providers supporting `abortSignal`.

- **Cons:**  
  - Does not handle **sequential budget splits** (e.g., primary/secondary branch with different time splits).
  - Does not support **threshold-based secondary launching** out-of-the-box (such as only running a fallback if the primary returns few results).
  - It is focused on provider timeouts—**it won't orchestrate multi-tool budget/time splits** for primary/secondary logic as described in your Mastra retrieve step.

### Best Fit Practice

- Use `abortSignal: AbortSignal.timeout(timeoutMs)` when calling AI SDK functions from Mastra steps, to enforce hard limits.
- To implement **branching, threshold checks, and secondary launch** logic (as in your early budget trim + global timeout design), continue to orchestrate that in your workflow code using Promise.race and deadline calculation, as illustrated in the previous response:  
  - AI SDK timeouts will ensure no hanging calls.
  - Your step logic (in Mastra or any workflow engine) will use split deadlines, check thresholds, and launch secondary as designed.[1][4]

### Conclusion

**AI SDK's timeout setting is highly complementary for enforcing step-level or per-request limits**—use it inside tool calls in your Mastra step implementations.  
**Your early budget trim, branch routing, and threshold logic must still be managed in your workflow orchestration layer** (Mastra steps/functions), not in AI SDK configuration alone.[4][1]

***

**References:**  
- [AI SDK Core: Settings (example timeout)](https://ai-sdk.dev/docs/ai-sdk-core/settings#example-timeout)  
- [AI SDK Core Documentation][1][4]

[1](https://ai-sdk.dev/docs/ai-sdk-core/settings)
[2](https://github.com/RooCodeInc/Roo-Code/discussions/4702)
[3](https://stackoverflow.com/questions/78142050/how-to-set-a-timeout-on-google-gemini-generate-content-request-with-the-vertex-a)
[4](https://ai-sdk.dev/docs/ai-sdk-core/settings)
[5](https://lunary.ai/blog/azure-openai-timeout)
[6](https://ai-sdk.dev/docs/troubleshooting/timeout-on-vercel)
[7](https://community.openai.com/t/configuring-timeout-for-chatcompletion-python/107226)
[8](https://drdroid.io/integration-diagnosis-knowledge/together-ai-model-timeout-error)
[9](https://apidog.com/blog/vercel-ai-sdk/)
[10](https://sap.github.io/ai-sdk/docs/js/langchain/orchestration)
[11](https://github.com/vercel/ai/discussions/3870)


## Early Budget Trim + Global Timeout with Mastra

Based on your requirements for implementing early budget trim and global timeout in your retrieve step, here's how to best solve this with Mastra workflows:

### Core Strategy: Sequential Preference with Promise.race

Since Mastra doesn't provide native step-level timeout controls, you'll need to implement the timeout mechanism within your step execution logic using JavaScript's `Promise.race()`. Here's how to implement your early budget trim strategy:[1][2][3][4]

### 1. Implement withTimeout Utility

First, create a utility function for wrapping tool calls with timeouts:

```typescript
const withTimeout = <T>(promise: Promise<T>, deadline: number): Promise<T> => {
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    return Promise.reject(new Error('Deadline already exceeded'));
  }
  
  let timer: NodeJS.Timeout;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('Operation timed out')), 
        remaining
      );
    })
  ]).finally(() => clearTimeout(timer));
};
```

### 2. Enhanced Retrieve Step with Sequential Preference

Modify your retrieve step to implement the sequential preference pattern:

```typescript
const retrieve = createStep({
  id: 'retrieve',
  inputSchema: RetrieveInputSchema,
  outputSchema: z.object({ 
    snippets: z.array(z.object({ path: z.string(), text: z.string() })),
    metadata: z.object({
      primaryHits: z.number(),
      secondaryHits: z.number(),
      usedSecondary: z.boolean(),
      timeoutReached: z.boolean()
    })
  }),
  execute: async ({ inputData }) => {
    // Configuration constants
    const WORKFLOW_RACE_TIMEOUT_MS = 1200;
    const PRIMARY_TIME_SPLIT = 0.7; // 70% for primary
    const HIT_THRESHOLD = 8; // minimum hits to skip secondary
    const SECONDARY_CRUMB_TIME = 150; // fallback time for secondary
    
    const startTime = Date.now();
    const globalDeadline = startTime + WORKFLOW_RACE_TIMEOUT_MS;
    
    const { astGrepTool } = await import('~/mastra/tools/astGrepTool');
    const { ripGrepTool } = await import('~/mastra/tools/ripGrepTool');
    
    const routed = routeSearchQuery(inputData.query);
    const budget = inputData.budgetBytes ?? DEFAULT_TOTAL_BUDGET;
    const candidates: string[] = inputData.candidates || [];
    
    // Determine primary and secondary tools
    const isPrimaryAST = routed.mode === 'ast';
    const primaryTool = isPrimaryAST ? astGrepTool : ripGrepTool;
    const secondaryTool = isPrimaryAST ? ripGrepTool : astGrepTool;
    
    // Budget allocation
    const half = Math.max(1024, Math.floor(budget / 2));
    const primaryBudget = candidates.length > 0 ? Math.floor(half * 1.15) : half;
    const secondaryBudget = Math.max(1024, budget - primaryBudget);
    
    // Time allocation
    const primaryTimeMs = Math.floor(WORKFLOW_RACE_TIMEOUT_MS * PRIMARY_TIME_SPLIT);
    const primaryDeadline = startTime + primaryTimeMs;
    
    logger.debug('[Retrieve] Starting sequential preference', {
      primary: isPrimaryAST ? 'AST' : 'RIP',
      primaryTimeMs,
      primaryBudget,
      secondaryBudget,
      candidates: candidates.length
    });
    
    // Execute primary tool with timeout
    let primaryHits: Array<{ path: string; text: string }> = [];
    let timeoutReached = false;
    
    try {
      const primaryResult = await withTimeout(
        primaryTool.execute({
          input: {
            baseUrl: inputData.baseUrl,
            repoId: inputData.repoId,
            query: inputData.query,
            budgetBytes: primaryBudget,
            mode: isPrimaryAST ? 'ast' : undefined,
            candidates
          } as any
        }),
        primaryDeadline
      );
      
      primaryHits = Array.isArray(primaryResult?.snippets) 
        ? primaryResult.snippets 
        : [];
        
    } catch (error) {
      if (error.message.includes('timeout')) {
        timeoutReached = true;
        logger.debug('[Retrieve] Primary tool timed out');
      } else {
        logger.warn('[Retrieve] Primary tool failed:', error);
      }
    }
    
    // Check threshold for early exit
    const shouldRunSecondary = primaryHits.length < Math.min(HIT_THRESHOLD, MAX_MERGED_SNIPPETS / 2);
    const remainingTime = globalDeadline - Date.now();
    const hasTimeForSecondary = remainingTime > SECONDARY_CRUMB_TIME;
    
    let secondaryHits: Array<{ path: string; text: string }> = [];
    let usedSecondary = false;
    
    if (shouldRunSecondary && hasTimeForSecondary && !timeoutReached) {
      logger.debug('[Retrieve] Running secondary tool', {
        primaryHits: primaryHits.length,
        remainingTime
      });
      
      try {
        const secondaryResult = await withTimeout(
          secondaryTool.execute({
            input: {
              baseUrl: inputData.baseUrl,
              repoId: inputData.repoId,
              query: inputData.query,
              budgetBytes: secondaryBudget,
              mode: !isPrimaryAST ? 'ast' : undefined,
              candidates
            } as any
          }),
          globalDeadline
        );
        
        secondaryHits = Array.isArray(secondaryResult?.snippets) 
          ? secondaryResult.snippets 
          : [];
        usedSecondary = true;
        
      } catch (error) {
        logger.debug('[Retrieve] Secondary tool failed/timed out:', error);
      }
    } else {
      logger.debug('[Retrieve] Skipping secondary', {
        shouldRun: shouldRunSecondary,
        hasTime: hasTimeForSecondary,
        timedOut: timeoutReached
      });
    }
    
    // Merge results with deduplication
    const seen = new Set<string>();
    const merged: Array<{ path: string; text: string }> = [];
    
    for (const hit of [...primaryHits, ...secondaryHits]) {
      if (!hit?.path || seen.has(hit.path)) continue;
      seen.add(hit.path);
      merged.push(hit);
      if (merged.length >= MAX_MERGED_SNIPPETS) break;
    }
    
    return {
      snippets: merged,
      metadata: {
        primaryHits: primaryHits.length,
        secondaryHits: secondaryHits.length,
        usedSecondary,
        timeoutReached
      }
    };
  }
});
```

### 3. Alternative: Parallel with Race Condition

If you prefer a more parallel approach while still respecting timeouts, you can use Promise.race with both tools:

```typescript
// Alternative implementation using parallel execution with race
const executeWithRace = async (inputData: any) => {
  const WORKFLOW_RACE_TIMEOUT_MS = 1200;
  const deadline = Date.now() + WORKFLOW_RACE_TIMEOUT_MS;
  
  const primaryPromise = withTimeout(
    primaryTool.execute({ input: primaryConfig }),
    deadline
  );
  
  const secondaryPromise = withTimeout(
    secondaryTool.execute({ input: secondaryConfig }),
    deadline
  );
  
  // Race both tools, but prioritize results from primary
  const results = await Promise.allSettled([primaryPromise, secondaryPromise]);
  
  // Process results with preference for primary
  const primaryResult = results[0].status === 'fulfilled' ? results[0].value : null;
  const secondaryResult = results[1].status === 'fulfilled' ? results[1].value : null;
  
  // Merge with primary preference
  return mergeWithPreference(primaryResult, secondaryResult);
};
```

### 4. Integration with Existing Workflow

Your existing workflow structure can remain largely unchanged. The timeout logic is contained within the retrieve step:

```typescript
export const codeDiscoveryWorkflow = createWorkflow({
  id: 'code-discovery',
  inputSchema: InputSchema,
  // Add global timeout at workflow level if needed
  retryConfig: {
    attempts: 1, // Disable retries to respect timeouts
    delay: 0
  }
})
.then(ensureGraph)
.then(prefilterCandidates)
.map(async ({ inputData, getInitData }) => {
  const init = getInitData();
  return { ...init, candidates: inputData.candidates };
})
.then(retrieve) // Now includes timeout logic
.map(/* ... */)
.then(xrayRefine)
// ... rest of pipeline
```

### Key Benefits of This Approach

1. **Deterministic**: Sequential preference is simpler and more predictable than true parallel racing[5]
2. **Budget Aware**: Respects both time and byte budgets
3. **Threshold-Based**: Intelligently skips secondary when primary provides sufficient results
4. **Graceful Degradation**: Returns partial results rather than failing completely
5. **Observable**: Provides metadata about execution for debugging and tuning

### Configuration Constants

Make these tunable for different scenarios:

```typescript
export const RETRIEVE_CONFIG = {
  WORKFLOW_RACE_TIMEOUT_MS: 1200,
  PRIMARY_TIME_SPLIT: 0.7,
  HIT_THRESHOLD: 8,
  SECONDARY_CRUMB_TIME: 150,
  MAX_MERGED_SNIPPETS: 20
} as const;
```

This approach gives you the early budget trim behavior you want while working within Mastra's workflow paradigm and leveraging JavaScript's native Promise.race capabilities for timeout control.

[1](https://advancedweb.hu/how-to-add-timeout-to-a-promise-in-javascript/)
[2](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
[3](https://dev.to/saranshk/apply-timeout-to-javascript-promises-21pi)
[4](https://mastra.ai/docs/workflows/error-handling)
[5](https://mastra.ai/examples/workflows/parallel-steps)
[6](https://community.temporal.io/t/execute-business-logic-on-workflow-execution-timeout/8475)
[7](https://docs.medusajs.com/learn/fundamentals/workflows/workflow-timeout)
[8](https://mastra.ai/docs/workflows/pausing-execution)
[9](https://argo-workflows.readthedocs.io/en/latest/walk-through/timeouts/)
[10](https://stackoverflow.com/questions/58663076/does-aws-step-functions-have-a-timeout-feature)
[11](https://community.temporal.io/t/workflow-execution-timeout-vs-run-timeout/13713)
[12](https://mastra.ai/reference/workflows/resumeWithEvent)
[13](https://www.youtube.com/watch?v=wzneIfcgXvM)
[14](https://stack.convex.dev/reimplementing-mastra-regrets)
[15](https://mastra.ai/docs/workflows-legacy/error-handling)
[16](https://bytes.vadelabs.com/agentic-workflows-with-mastra/)
[17](https://www.youtube.com/watch?v=aORuNG8Tq_k)
[18](https://khaledgarbaya.net/blog/mastering-mastra-ai-workflows)
[19](https://github.com/assistant-ui/assistant-ui/issues/2098)
[20](https://dev.to/couchbase/building-multi-agent-workflows-using-mastra-ai-and-couchbase-198n)
[21](https://github.com/vercel/ai/discussions/4008)
[22](https://experienceleaguecommunities.adobe.com/t5/adobe-experience-manager/how-do-i-enable-workflow-step-timeouts/m-p/232518)
[23](https://discourse.openiap.io/t/workflow-timeout-when-invoking-the-workflow-through-command-line/2045)
[24](https://trailhead.salesforce.com/trailblazer-community/feed/0D5KX00000KhkL20AJ)
[25](https://mastra.ai/examples/workflows_legacy/sequential-steps)
[26](https://mastra.ai/docs/workflows/control-flow)
[27](https://mastra.ai/examples/workflows/sequential-steps)
[28](https://github.com/nodejs/node/issues/37683)
[29](https://www.youtube.com/watch?v=GQJxve5Hki4)
[30](https://community.temporal.io/t/sequential-workflow-executions/12610)
[31](https://docs.testkube.io/articles/test-workflows-parallel)
[32](https://github.com/mastra-ai/mastra/issues/6171)
[33](https://github.com/mastra-ai/mastra/issues/2701)
[34](https://github.com/mastra-ai/mastra/issues/5987)
[35](https://stackoverflow.com/questions/57260910/promise-race-function-to-compare-the-timeout)
[36](https://blog.stackademic.com/mastra-ai-review-exploring-multi-agent-systems-with-house-m-d-example-4dcce446030c)
[37](https://raw.githubusercontent.com/apappascs/mcp-servers-hub/main/README.md)
[38](https://www.elastic.co/search-labs/blog/agentic-rag)
[39](https://github.com/mastra-ai/mastra/issues/5170)
[40](https://andrew.red/posts/javascript-how-to-use-promise-with-timeout)
[41](https://www.youtube.com/watch?v=GE0V75Ixy1Q)
[42](https://notes.kodekloud.com/docs/GitHub-Actions-Certification/GitHub-Actions-Core-Concepts/Timeout-for-Jobs-and-Steps)
[43](https://docs.mem0.ai/integrations/mastra)
[44](https://blog.jatin510.dev/implementing-custom-api-timeout-using-the-promiserace-method)
[45](https://kestra.io/docs/workflow-components/timeout)
[46](https://stackoverflow.com/questions/63491310/how-to-set-timeout-in-promise-race)
[47](https://langfuse.com/integrations/frameworks/mastra)
[48](https://mastra.ai/reference/legacyWorkflows/resumeWithEvent)
[49](https://docs.mcp.run/integrating/tutorials/mcpx-mastra-ts/)
[50](https://langfuse.com/faq/all/error-handling-and-timeouts)
[51](https://www.youtube.com/shorts/ukG9eb6C67E)
[52](https://openrouter.ai/docs/community/mastra)