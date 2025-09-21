Here’s a practical recipe for writing **strong system prompts** when you’re using **Mastra agents** and **workflows**—plus a copy-paste template and a tiny code sketch to wire it up.

# 1) Split responsibilities cleanly

* **Agent `instructions` = long-lived identity & guardrails.** They define role, tone, dos/don’ts, and how to use tools/workflows in general. ([mastra.ai][1])
* **Per-call `system` prompt = situational steering.** Use it to nudge style/behavior just for *this* request without changing the base instructions. ([mastra.ai][1])

# 2) Tell the model about your workflows (explicitly)

In the **instructions**, list each workflow, what it does, its **input/output schema**, and *when to use it*. In the Mastra example they attach a `soccerWorkflow` via the `workflows` param and instruct the agent to pass a date (YYYY-MM-DD) and return only specific fields. That pairing of instructions + workflow is the pattern you want. ([mastra.ai][2])

# 3) Give decision rules the model can follow

Spell out **when to call a workflow vs. when to answer directly**, and what to do if inputs are missing (ask for them; don’t guess). Keep those rules short and checkable.

# 4) Be pedantic about parameters

If an input needs a format, say it (e.g., “date must be `YYYY-MM-DD`”). If a workflow expects an enum or a unit, list the allowed values/units.

# 5) Lock the output shape

Ask for **structured output** (JSON or a typed block). This keeps the agent→workflow→agent loop predictable and easy to parse.

# 6) Guardrails & scope

Include constraints (no PII, don’t fabricate, cite sources if applicable, latency budgets, max tokens, etc.). Add fallback behavior when the workflow returns nothing.

# 7) Keep style directions separate

Put tone/voice defaults in `instructions`. Use the **runtime `system` prompt** for one-off styling or a temporary persona shift (exactly how the docs demo swapping character voices). ([mastra.ai][1])

---

## Copy-paste system prompt template (for agents with workflows)

```
You are {ROLE}, helping with {DOMAIN} tasks.

Capabilities:
- You can call these workflows when rules below are satisfied:
  1) {workflowName}: {one-line purpose}
     input: {field}: {type/format} ; {field}: {type/format}
     output: {summary of fields}
     use when: {clear trigger conditions}

Decision rules:
- If the user asks {X}, call {workflowName} with {mapped inputs}.
- If required inputs are missing, ask concise questions to obtain them.
- If the workflow returns no data, explain that clearly and suggest next steps.

Output format:
- Return {JSON schema or bullet spec}. Do not include code fences unless asked.
- Keep responses under {N} words unless the user asks for more.

Quality & safety:
- Be factual; if unsure, say so.
- Never invent fields the workflow didn’t return.
- Respect formatting: {dates in YYYY-MM-DD, currency in EUR, 24h times}.

Examples:
- User: “{example}”
- You: {tiny example of the final format}

```

### Runtime `system` prompt (per request)

Use this when calling `.generate(...)` to steer the same agent temporarily:

```
For this request: focus on {specific objective}. Prefer {workflowName} if it matches.
Be {tone: concise/formal/friendly}. Output only {format}.
```

(That mirrors how Mastra shows swapping the agent’s voice at runtime without touching base instructions.) ([mastra.ai][1])

---

## Minimal Mastra wiring (pattern)

```ts
import { Agent } from "@mastra/core/agent";
import { createWorkflow, createStep } from "@mastra/core/workflows";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// 1) Define a workflow with clear schemas
const getData = createStep({
  id: "get-data",
  description: "Fetch structured info for ...",
  inputSchema: z.object({ date: z.string() }),           // e.g. "YYYY-MM-DD"
  outputSchema: z.object({ items: z.array(z.any()) }),
  execute: async ({ inputData }) => {
    // fetch/compute; return { items: ... }
    return { items: [] };
  }
});

export const myWorkflow = createWorkflow({
  id: "my-workflow",
  inputSchema: z.object({ date: z.string() }),
  outputSchema: z.object({ items: z.array(z.any()) })
}).then(getData).commit(); // pattern from the docs
// (Mastra shows the same chaining/commit approach.) :contentReference[oaicite:5]{index=5}

// 2) Create an agent: give durable instructions + attach workflows
export const myAgent = new Agent({
  name: "planner-agent",
  description: "Plans things using a workflow when helpful.",
  instructions: `
You are a planning assistant.

Use my-workflow to fetch structured data when the user asks about dates.
- Compute or confirm a date; pass it as YYYY-MM-DD.
- Return only the fields requested in Output format below.

Output: JSON with { "date": "...", "items": [...] }.
If inputs are missing, ask a single concise question.
If the workflow returns nothing, say so and suggest one next step.`,
  model: openai("gpt-4o"),
  workflows: { myWorkflow }
});
// (Attaching workflows via the 'workflows' param and guiding usage in instructions
// is the pattern shown in the soccer example.) :contentReference[oaicite:6]{index=6}

// 3) Per-call system steering
const res = await myAgent.generate([
  { role: "system", content: "Be succinct. If relevant, call my-workflow." },
  { role: "user", content: "What’s scheduled on 2025-09-20?" }
]);
```

---

## Quick prompt audit checklist

* Does the agent’s **instructions** name each workflow, inputs, outputs, and **when to use** it? (Y/N) ([mastra.ai][2])
* Are parameter formats unambiguous (e.g., `YYYY-MM-DD`)? (Y/N) ([mastra.ai][2])
* Is the **runtime `system` prompt** used for one-off tweaks only? (Y/N) ([mastra.ai][1])
* Is the output shape locked (JSON/spec)? (Y/N)
* Are there fallback and “missing input” rules? (Y/N)

If you share your domain (e.g., booking, support triage, data QA), I can draft the exact instructions + workflow usage rules tailored to your schemas.

[1]: https://mastra.ai/en/examples/agents/system-prompt "Example: Agents with a System Prompt | Agents | Mastra Docs"
[2]: https://mastra.ai/en/examples/agents/using-a-workflow "Example: Adding Workflows to Agents | Agents | Mastra Docs"
