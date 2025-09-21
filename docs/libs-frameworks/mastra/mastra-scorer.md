Scorers overview
Scorers are evaluation tools that measure the quality, accuracy, or performance of AI-generated outputs. Scorers provide an automated way to assess whether your agents, workflows, or language models are producing the desired results by analyzing their responses against specific criteria.

Scores are numerical values (typically between 0 and 1) that quantify how well an output meets your evaluation criteria. These scores enable you to objectively track performance, compare different approaches, and identify areas for improvement in your AI systems.

Evaluation pipeline
Mastra scorers follow a flexible four-step pipeline that allows for simple to complex evaluation workflows:

preprocess (Optional): Prepare or transform input/output data for evaluation
analyze (Optional): Perform evaluation analysis and gather insights
generateScore (Required): Convert analysis into a numerical score
generateReason (Optional): Generate explanations or justifications for the score
This modular structure enables both simple single-step evaluations and complex multi-stage analysis workflows, allowing you to build evaluations that match your specific needs.

When to use each step
preprocess step - Use when your content is complex or needs preprocessing:

Extracting specific elements from complex data structures
Cleaning or normalizing text before analysis
Parsing multiple claims that need individual evaluation
Filtering content to focus evaluation on relevant sections
analyze step - Use when you need structured evaluation analysis:

Gathering insights that inform the scoring decision
Breaking down complex evaluation criteria into components
Performing detailed analysis that generateScore will use
Collecting evidence or reasoning data for transparency
generateScore step - Always required for converting analysis to scores:

Simple scenarios: Direct scoring of input/output pairs
Complex scenarios: Converting detailed analysis results into numerical scores
Applying business logic and weighting to analysis results
The only step that produces the final numerical score
generateReason step - Use when explanations are important:

Users need to understand why a score was assigned
Debugging and transparency are critical
Compliance or auditing requires explanations
Providing actionable feedback for improvement
To learn how to create your own Scorers, see Creating Custom Scorers.

Installation
To access Mastra’s scorers feature install the @mastra/evals package.


npm install @mastra/evals@latest
Live evaluations
Live evaluations allow you to automatically score AI outputs in real-time as your agents and workflows operate. Instead of running evaluations manually or in batches, scorers run asynchronously alongside your AI systems, providing continuous quality monitoring.

Adding scorers to agents
You can add built-in scorers to your agents to automatically evaluate their outputs. See the full list of built-in scorers for all available options.

src/mastra/agents/evaluated-agent.ts

import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { 
  createAnswerRelevancyScorer,
  createToxicityScorer 
} from "@mastra/evals/scorers/llm";
 
export const evaluatedAgent = new Agent({
  // ...
  scorers: {
    relevancy: {
      scorer: createAnswerRelevancyScorer({ model: openai("gpt-4o-mini") }),
      sampling: { type: "ratio", rate: 0.5 }
    },
    safety: {
      scorer: createToxicityScorer({ model: openai("gpt-4o-mini") }),
      sampling: { type: "ratio", rate: 1 }
    }
  }
});
Adding scorers to workflow steps
You can also add scorers to individual workflow steps to evaluate outputs at specific points in your process:

src/mastra/workflows/content-generation.ts

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { customStepScorer } from "../scorers/custom-step-scorer";
 
const contentStep = createStep({
  // ...
  scorers: {
    customStepScorer: {
      scorer: customStepScorer(),
      sampling: {
        type: "ratio",
        rate: 1, // Score every step execution
      }
    }
  },
});
 
export const contentWorkflow = createWorkflow({ ... })
  .then(contentStep)
  .commit();
How live evaluations work
Asynchronous execution: Live evaluations run in the background without blocking your agent responses or workflow execution. This ensures your AI systems maintain their performance while still being monitored.

Sampling control: The sampling.rate parameter (0-1) controls what percentage of outputs get scored:

1.0: Score every single response (100%)
0.5: Score half of all responses (50%)
0.1: Score 10% of responses
0.0: Disable scoring
Automatic storage: All scoring results are automatically stored in the mastra_scorers table in your configured database, allowing you to analyze performance trends over time.

Testing scorers locally
Mastra provides a CLI command mastra dev to test your scorers. The playground includes a scorers section where you can run individual scorers against test inputs and view detailed results.

For more details, see the Local Dev Playground docs.




Mastra provides a comprehensive set of built-in scorers for evaluating AI outputs. These scorers are optimized for common evaluation scenarios and are ready to use in your agents and workflows.

Available Scorers
Accuracy and Reliability
These scorers evaluate how correct, truthful, and complete your agent’s answers are:

answer-relevancy
: Evaluates how well responses address the input query (0-1, higher is better)
answer-similarity
: Compares agent outputs against ground truth answers for CI/CD testing using semantic analysis (0-1, higher is better)
faithfulness
: Measures how accurately responses represent provided context (0-1, higher is better)
hallucination
: Detects factual contradictions and unsupported claims (0-1, lower is better)
completeness
: Checks if responses include all necessary information (0-1, higher is better)
content-similarity
: Measures textual similarity using character-level matching (0-1, higher is better)
textual-difference
: Measures textual differences between strings (0-1, higher means more similar)
tool-call-accuracy
: Evaluates whether the LLM selects the correct tool from available options (0-1, higher is better)
prompt-alignment
: Measures how well agent responses align with user prompt intent, requirements, completeness, and format (0-1, higher is better)
Context Quality
These scorers evaluate the quality and relevance of context used in generating responses:

context-precision
: Evaluates context relevance and ranking using Mean Average Precision, rewarding early placement of relevant context (0-1, higher is better)
context-relevance
: Measures context utility with nuanced relevance levels, usage tracking, and missing context detection (0-1, higher is better)
tip Context Scorer Selection

Use Context Precision when context ordering matters and you need standard IR metrics (ideal for RAG ranking evaluation)
Use Context Relevance when you need detailed relevance assessment and want to track context usage and identify gaps
Both context scorers support:

Static context: Pre-defined context arrays
Dynamic context extraction: Extract context from runs using custom functions (ideal for RAG systems, vector databases, etc.)
Output Quality
These scorers evaluate adherence to format, style, and safety requirements:

tone-consistency
: Measures consistency in formality, complexity, and style (0-1, higher is better)
toxicity
: Detects harmful or inappropriate content (0-1, lower is better)
bias
: Detects potential biases in the output (0-1, lower is better)
keyword-coverage
: Assesses technical terminology usage (0-1, higher is better)

Creating scorers
Mastra provides a unified createScorer factory that allows you to build custom evaluation logic using either JavaScript functions or LLM-based prompt objects for each step. This flexibility lets you choose the best approach for each part of your evaluation pipeline.

The Four-Step Pipeline
All scorers in Mastra follow a consistent four-step evaluation pipeline:

preprocess (optional): Prepare or transform input/output data
analyze (optional): Perform evaluation analysis and gather insights
generateScore (required): Convert analysis into a numerical score
generateReason (optional): Generate human-readable explanations
Each step can use either functions or prompt objects (LLM-based evaluation), giving you the flexibility to combine deterministic algorithms with AI judgment as needed.

Functions vs Prompt Objects
Functions use JavaScript for deterministic logic. They’re ideal for:

Algorithmic evaluations with clear criteria
Performance-critical scenarios
Integration with existing libraries
Consistent, reproducible results
Prompt Objects use LLMs as judges for evaluation. They’re perfect for:

Subjective evaluations requiring human-like judgment
Complex criteria difficult to code algorithmically
Natural language understanding tasks
Nuanced context evaluation
You can mix and match approaches within a single scorer - for example, use a function for preprocessing data and an LLM for analyzing quality.

Initializing a Scorer
Every scorer starts with the createScorer factory function, which requires a name and description, and optionally accepts a judge configuration for LLM-based steps.

import { createScorer } from '@mastra/core/scores';
import { openai } from '@ai-sdk/openai';
 
const glutenCheckerScorer = createScorer({
  name: 'Gluten Checker',
  description: 'Check if recipes contain gluten ingredients',
  judge: {                    // Optional: for prompt object steps
    model: openai('gpt-4o'),
    instructions: 'You are a Chef that identifies if recipes contain gluten.'
  }
})
// Chain step methods here
.preprocess(...)
.analyze(...)
.generateScore(...)
.generateReason(...)
The judge configuration is only needed if you plan to use prompt objects in any step. Individual steps can override this default configuration with their own judge settings.

Step-by-Step Breakdown
preprocess Step (Optional)
Prepares input/output data when you need to extract specific elements, filter content, or transform complex data structures.

Functions: ({ run, results }) => any

const glutenCheckerScorer = createScorer(...)
.preprocess(({ run }) => {
  // Extract and clean recipe text
  const recipeText = run.output.text.toLowerCase();
  const wordCount = recipeText.split(' ').length;
  
  return {
    recipeText,
    wordCount,
    hasCommonGlutenWords: /flour|wheat|bread|pasta/.test(recipeText)
  };
})
Prompt Objects: Use description, outputSchema, and createPrompt to structure LLM-based preprocessing.

const glutenCheckerScorer = createScorer(...)
.preprocess({
  description: 'Extract ingredients from the recipe',
  outputSchema: z.object({
    ingredients: z.array(z.string()),
    cookingMethods: z.array(z.string())
  }),
  createPrompt: ({ run }) => `
    Extract all ingredients and cooking methods from this recipe:
    ${run.output.text}
    
    Return JSON with ingredients and cookingMethods arrays.
  `
})
Data Flow: Results are available to subsequent steps as results.preprocessStepResult

analyze Step (Optional)
Performs core evaluation analysis, gathering insights that will inform the scoring decision.

Functions: ({ run, results }) => any

const glutenCheckerScorer = createScorer({...})
.preprocess(...)
.analyze(({ run, results }) => {
  const { recipeText, hasCommonGlutenWords } = results.preprocessStepResult;
  
  // Simple gluten detection algorithm
  const glutenKeywords = ['wheat', 'flour', 'barley', 'rye', 'bread'];
  const foundGlutenWords = glutenKeywords.filter(word => 
    recipeText.includes(word)
  );
  
  return {
    isGlutenFree: foundGlutenWords.length === 0,
    detectedGlutenSources: foundGlutenWords,
    confidence: hasCommonGlutenWords ? 0.9 : 0.7
  };
})
Prompt Objects: Use description, outputSchema, and createPrompt for LLM-based analysis.

const glutenCheckerScorer = createScorer({...})
.preprocess(...)
.analyze({
  description: 'Analyze recipe for gluten content',
  outputSchema: z.object({
    isGlutenFree: z.boolean(),
    glutenSources: z.array(z.string()),
    confidence: z.number().min(0).max(1)
  }),
  createPrompt: ({ run, results }) => `
    Analyze this recipe for gluten content:
    "${results.preprocessStepResult.recipeText}"
    
    Look for wheat, barley, rye, and hidden sources like soy sauce.
    Return JSON with isGlutenFree, glutenSources array, and confidence (0-1).
  `
})
Data Flow: Results are available to subsequent steps as results.analyzeStepResult

generateScore Step (Required)
Converts analysis results into a numerical score. This is the only required step in the pipeline.

Functions: ({ run, results }) => number

const glutenCheckerScorer = createScorer({...})
.preprocess(...)
.analyze(...)
.generateScore(({ results }) => {
  const { isGlutenFree, confidence } = results.analyzeStepResult;
  
  // Return 1 for gluten-free, 0 for contains gluten
  // Weight by confidence level
  return isGlutenFree ? confidence : 0;
})
Prompt Objects: See the 
createScorer
 API reference for details on using prompt objects with generateScore, including required calculateScore function.

Data Flow: The score is available to generateReason as the score parameter

generateReason Step (Optional)
Generates human-readable explanations for the score, useful for debugging, transparency, or user feedback.

Functions: ({ run, results, score }) => string

const glutenCheckerScorer = createScorer({...})
.preprocess(...)
.analyze(...)
.generateScore(...)
.generateReason(({ results, score }) => {
  const { isGlutenFree, glutenSources } = results.analyzeStepResult;
  
  if (isGlutenFree) {
    return `Score: ${score}. This recipe is gluten-free with no harmful ingredients detected.`;
  } else {
    return `Score: ${score}. Contains gluten from: ${glutenSources.join(', ')}`;
  }
})
Prompt Objects: Use description and createPrompt for LLM-generated explanations.

const glutenCheckerScorer = createScorer({...})
.preprocess(...)
.analyze(...)
.generateScore(...)
.generateReason({
  description: 'Explain the gluten assessment',
  createPrompt: ({ results, score }) => `
    Explain why this recipe received a score of ${score}.
    Analysis: ${JSON.stringify(results.analyzeStepResult)}
    
    Provide a clear explanation for someone with dietary restrictions.
  `

  Custom Judge Scorer
This example shows how to create a custom scorer using createScorer with prompt objects. We’ll build a “Gluten Checker” that evaluates whether a recipe contains gluten, using a language model as the judge.

Installation

npm install @mastra/core
For complete API documentation and configuration options, see 
createScorer
.

Create a custom scorer
A custom scorer in Mastra uses createScorer with four core components:

Judge Configuration
Analysis Step
Score Generation
Reason Generation
Together, these components allow you to define custom evaluation logic using LLMs as judges.

See createScorer for the full API and configuration options.

src/mastra/scorers/gluten-checker.ts

import { openai } from '@ai-sdk/openai';
import { createScorer } from '@mastra/core/scores';
import { z } from 'zod';
 
export const GLUTEN_INSTRUCTIONS = `You are a Chef that identifies if recipes contain gluten.`;
 
export const generateGlutenPrompt = ({ output }: { output: string }) => `Check if this recipe is gluten-free.
 
Check for:
- Wheat
- Barley
- Rye
- Common sources like flour, pasta, bread
 
Example with gluten:
"Mix flour and water to make dough"
Response: {
  "isGlutenFree": false,
  "glutenSources": ["flour"]
}
 
Example gluten-free:
"Mix rice, beans, and vegetables"
Response: {
  "isGlutenFree": true,
  "glutenSources": []
}
 
Recipe to analyze:
${output}
 
Return your response in this format:
{
  "isGlutenFree": boolean,
  "glutenSources": ["list ingredients containing gluten"]
}`;
 
export const generateReasonPrompt = ({
  isGlutenFree,
  glutenSources,
}: {
  isGlutenFree: boolean;
  glutenSources: string[];
}) => `Explain why this recipe is${isGlutenFree ? '' : ' not'} gluten-free.
 
${glutenSources.length > 0 ? `Sources of gluten: ${glutenSources.join(', ')}` : 'No gluten-containing ingredients found'}
 
Return your response in this format:
"This recipe is [gluten-free/contains gluten] because [explanation]"`;
 
export const glutenCheckerScorer = createScorer({
  name: 'Gluten Checker',
  description: 'Check if the output contains any gluten',
  judge: {
    model: openai('gpt-4o'),
    instructions: GLUTEN_INSTRUCTIONS,
  },
})
  .analyze({
    description: 'Analyze the output for gluten',
    outputSchema: z.object({
      isGlutenFree: z.boolean(),
      glutenSources: z.array(z.string()),
    }),
    createPrompt: ({ run }) => {
      const { output } = run;
      return generateGlutenPrompt({ output: output.text });
    },
  })
  .generateScore(({ results }) => {
    return results.analyzeStepResult.isGlutenFree ? 1 : 0;
  })
  .generateReason({
    description: 'Generate a reason for the score',
    createPrompt: ({ results }) => {
      return generateReasonPrompt({
        glutenSources: results.analyzeStepResult.glutenSources,
        isGlutenFree: results.analyzeStepResult.isGlutenFree,
      });
    },
  });
Judge Configuration
Sets up the LLM model and defines its role as a domain expert.

judge: {
  model: openai('gpt-4o'),
  instructions: GLUTEN_INSTRUCTIONS,
}
Analysis Step
Defines how the LLM should analyze the input and what structured output to return.

.analyze({
  description: 'Analyze the output for gluten',
  outputSchema: z.object({
    isGlutenFree: z.boolean(),
    glutenSources: z.array(z.string()),
  }),
  createPrompt: ({ run }) => {
    const { output } = run;
    return generateGlutenPrompt({ output: output.text });
  },
})
The analysis step uses a prompt object to:

Provide a clear description of the analysis task
Define expected output structure with Zod schema (both boolean result and list of gluten sources)
Generate dynamic prompts based on the input content
Score Generation
Converts the LLM’s structured analysis into a numerical score.

.generateScore(({ results }) => {
  return results.analyzeStepResult.isGlutenFree ? 1 : 0;
})
The score generation function takes the analysis results and applies business logic to produce a score. In this case, the LLM directly determines if the recipe is gluten-free, so we use that boolean result: 1 for gluten-free, 0 for contains gluten.

Reason Generation
Provides human-readable explanations for the score using another LLM call.

.generateReason({
  description: 'Generate a reason for the score',
  createPrompt: ({ results }) => {
    return generateReasonPrompt({
      glutenSources: results.analyzeStepResult.glutenSources,
      isGlutenFree: results.analyzeStepResult.isGlutenFree,
    });
  },
})
The reason generation step creates explanations that help users understand why a particular score was assigned, using both the boolean result and the specific gluten sources identified by the analysis step.

## High gluten-free example
```typescript filename="src/example-high-gluten-free.ts" showLineNumbers copy
const result = await glutenCheckerScorer.run({
  input: [{ role: 'user', content: 'Mix rice, beans, and vegetables' }],
  output: { text: 'Mix rice, beans, and vegetables' },
});
console.log('Score:', result.score);
console.log('Gluten sources:', result.analyzeStepResult.glutenSources);
console.log('Reason:', result.reason);
High gluten-free output
{
  score: 1,
  analyzeStepResult: { 
    isGlutenFree: true,
    glutenSources: [] 
  },
  reason: 'This recipe is gluten-free because rice, beans, and vegetables are naturally gluten-free ingredients that are safe for people with celiac disease.'
}
Partial gluten example
src/example-partial-gluten.ts

const result = await glutenCheckerScorer.run({
  input: [{ role: 'user', content: 'Mix flour and water to make dough' }],
  output: { text: 'Mix flour and water to make dough' },
});
 
console.log('Score:', result.score);
console.log('Gluten sources:', result.analyzeStepResult.glutenSources);
console.log('Reason:', result.reason);
Partial gluten output
{
  score: 0,
  analyzeStepResult: { 
    isGlutenFree: false,
    glutenSources: ['flour'] 
  },
  reason: 'This recipe is not gluten-free because it contains flour. Regular flour is made from wheat and contains gluten, making it unsafe for people with celiac disease or gluten sensitivity.'
}
Low gluten-free example
src/example-low-gluten-free.ts

const result = await glutenCheckerScorer.run({
  input: [{ role: 'user', content: 'Add soy sauce and noodles' }],
  output: { text: 'Add soy sauce and noodles' },
});
 
console.log('Score:', result.score);
console.log('Gluten sources:', result.analyzeStepResult.glutenSources);
console.log('Reason:', result.reason);
Low gluten-free output
{
  score: 0,
  analyzeStepResult: { 
    isGlutenFree: false,
    glutenSources: ['soy sauce', 'noodles'] 
  },
  reason: 'This recipe is not gluten-free because it contains soy sauce, noodles. Regular soy sauce contains wheat and most noodles are made from wheat flour, both of which contain gluten and are unsafe for people with gluten sensitivity.'
}
Understanding the results
.run() returns a result in the following shape:

{
  runId: string,
  analyzeStepResult: {
    isGlutenFree: boolean,
    glutenSources: string[]
  },
  score: number,
  reason: string,
  analyzePrompt?: string,
  generateReasonPrompt?: string
}
score
A score of 1 means the recipe is gluten-free. A score of 0 means gluten was detected.

runId
The unique identifier for this scorer run.

analyzeStepResult
Object with gluten analysis:

isGlutenFree: Boolean indicating if the recipe is safe for gluten-free diets
glutenSources: Array of gluten-containing ingredients found in the recipe.
reason
Explanation of why the recipe is or is not gluten-free, generated by the LLM.

Prompt Fields
analyzePrompt: The actual prompt sent to the LLM for analysis
generateReasonPrompt: The actual prompt sent to the LLM for reasoning