Control Flow
When you build a workflow, you typically break down operations into smaller tasks that can be linked and reused. Steps provide a structured way to manage these tasks by defining inputs, outputs, and execution logic.

If the schemas match, the outputSchema from each step is automatically passed to the inputSchema of the next step.
If the schemas don’t match, use Input data mapping to transform the outputSchema into the expected inputSchema.
Chaining steps with .then()
Chain steps to execute sequentially using .then():

Chaining steps with .then()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const step2 = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .then(step2)
  .commit();
This does what you’d expect: it executes step1, then it executes step2.

Simultaneous steps with .parallel()
Execute steps simultaneously using .parallel():

Concurrent steps with .parallel()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const step2 = createStep({...});
const step3 = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .parallel([step1, step2])
  .then(step3)
  .commit();
This executes step1 and step2 concurrently, then continues to step3 after both complete.

See Parallel Execution with Steps for more information.

📹 Watch: How to run steps in parallel and optimize your Mastra workflow → YouTube (3 minutes) 

Conditional logic with .branch()
Execute steps conditionally using .branch():

Conditional branching with .branch()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const lessThanStep = createStep({...});
const greaterThanStep = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .branch([
    [async ({ inputData: { value } }) => value <= 10, lessThanStep],
    [async ({ inputData: { value } }) => value > 10, greaterThanStep]
  ])
  .commit();
Branch conditions are evaluated sequentially, but steps with matching conditions are executed in parallel.

See Workflow with Conditional Branching for more information.

Looping steps
Workflows support two types of loops. When looping a step, or any step-compatible construct like a nested workflow, the initial inputData is sourced from the output of the previous step.

To ensure compatibility, the loop’s initial input must either match the shape of the previous step’s output, or be explicitly transformed using the map function.

Match the shape of the previous step’s output, or
Be explicitly transformed using the map function.
Repeating with .dowhile()
Executes step repeatedly while a condition is true.

Repeating with .dowhile()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const counterStep = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .dowhile(counterStep, async ({ inputData: { number } }) => number < 10)
  .commit();
Repeating with .dountil()
Executes step repeatedly until a condition becomes true.

Repeating with .dountil()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const counterStep = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .dountil(counterStep, async ({ inputData: { number } }) => number > 10)
  .commit();
Repeating with .foreach()
Sequentially executes the same step for each item from the inputSchema.

Repeating with .foreach()

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const mapStep = createStep({...});
 
export const testWorkflow = createWorkflow({...})
  .foreach(mapStep)
  .commit();
Setting concurrency limits
Use concurrency to execute steps in parallel with a limit on the number of concurrent executions.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
const mapStep = createStep({...})
 
export const testWorkflow = createWorkflow({...})
  .foreach(mapStep, { concurrency: 2 })
  .commit();
Using a nested workflow
Use a nested workflow as a step by passing it to .then(). This runs each of its steps in sequence as part of the parent workflow.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
 
export const nestedWorkflow = createWorkflow({...})
 
export const testWorkflow = createWorkflow({...})
  .then(nestedWorkflow)
  .commit();
Cloning a workflow
Use cloneWorkflow to duplicate an existing workflow. This lets you reuse its structure while overriding parameters like id.

src/mastra/workflows/test-workflow.ts

import { createWorkflow, createStep, cloneWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
 
const step1 = createStep({...});
const parentWorkflow = createWorkflow({...})
const clonedWorkflow = cloneWorkflow(parentWorkflow, { id: "cloned-workflow" });
 
export const testWorkflow = createWorkflow({...})
  .then(step1)
  .then(clonedWorkflow)
  .commit();
Example Run Instance
The following example demonstrates how to start a run with multiple inputs. Each input will pass through the mapStep sequentially.

src/test-workflow.ts

import { mastra } from "./mastra";
 
const run = await mastra.getWorkflow("testWorkflow").createRunAsync();
 
const result = await run.start({
  inputData: [{ number: 10 }, { number: 100 }, { number: 200 }]
});
To execute this run from your terminal:


npx tsx src/test-workflow.ts