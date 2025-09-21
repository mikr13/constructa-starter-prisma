React integration: With TanStack Start, you might call your /api/ai/chat route using useAction() or a custom hook on the front-end (similar to how one would use React Query or SWR to call an API). This means you should design the route for easy consumption by front-end code. The smart-medical-records app likely has a React hook (use-agent.ts) to call their AI agent – you can do the same by wrapping a fetch to your TanStack route. Because your route returns streaming SSE, the front-end hook would listen to the SSE and update state as tokens arrive. TanStack v1 has improved support for server actions and streaming, so take advantage of those.

Typed schemas and validation: You can use Zod (as shown in other routes like the email API
GitHub
) to validate input. This is optional but a good practice so that your /api/ai route checks required fields (query, model, etc.) and returns clear errors if missing, rather than passing through to a failure deeper in Mastra.

Server-side streaming support: If your Mastra integration streams tokens (as it likely does for AI answers), TanStack Start can handle that. In the chat route code, after calling invokeCodeAssistant, they pipe the response stream into an SSE (server-sent events) stream to the client
GitHub
GitHub
. Ensure your route returns a ReadableStream or uses return new Response(stream, {...}) appropriately. TanStack’s server functions can return Response objects, so you have full control to stream data.

Cleaner state management: Removing the manual header toggles and using a single “workflow mode” flag will also simplify your state management on the client side. Instead of setting many header values from various UI checkboxes, you could simply have one “Use agentic mode” toggle in UI, which sets agentic=true in the request. This aligns with how TanStack apps typically manage feature toggles (via context or a global store feeding into the request logic, rather than attaching many headers).


6) Replacing your x-* header flags with the Start pattern

Your current pattern:

x-fc-tools, x-wf-ensure-graph, x-wf-graph-hints, x-wf-retrieve, ...


Problems

They bypass types/validation and are hard to discover.

Headers aren’t ergonomic to toggle from components & tend to leak across boundaries.

They’re not easily cached/remembered per user/session in a principled way.

The “TanStack way”

Put all run‑time options in a typed payload to a Server Function (validator(zod)); only use headers for cross‑cutting metadata that truly belongs there (e.g., correlation IDs, auth cookies). 
TanStack

If you want persistent debug toggles, store them in a cookie (readable in server middleware/handlers) or in KV keyed by user/session; Start’s server layer lets you read/set headers/cookies in‑route. 
TanStack

Use route‑level middleware to inject common context (e.g., xray: true for a group of routes) rather than pushing flags from the client on every call. 
TanStack

Concrete drop‑in: migrate those flags into RunSchema (above) and pass { debug } as part of the RPC body or as ?debug=... search param for the SSE route.

5) Streaming (SSE) with a Server Route (no Hono)

Define a GET Server Route that streams Mastra output as SSE. This keeps the endpoint EventSource‑friendly, works in Workers, and avoids a second framework. 
TanStack

// src/routes/api/agent.stream.ts
import { createServerFileRoute } from '@tanstack/react-start/server'
import { mainAgent } from '~/mastra'

export const ServerRoute = createServerFileRoute('/api/agent/stream').methods({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const input = url.searchParams.get('q') ?? ''

    const { stream } = await mainAgent.stream({ input })
    const encoder = new TextEncoder()

    const sse = new ReadableStream({
      async start(controller) {
        const send = (obj: unknown) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))

        send({ type: 'ready' })
        for await (const chunk of stream.textStream) {
          send({ type: 'delta', text: chunk })
        }
        send({ type: 'done' })
        controller.close()
      },
    })

    return new Response(sse, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  },
})


Client hook (similar to the use-agent.ts idea in SMEDREC, but Start‑native):

// src/hooks/useMastraStream.ts
import { useEffect, useRef, useState } from 'react'

export function useMastraStream(q: string | null) {
  const [text, setText] = useState('')
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!q) return
    const url = `/api/agent/stream?q=${encodeURIComponent(q)}`
    const es = new EventSource(url)
    esRef.current = es
    es.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'delta') setText((t) => t + msg.text)
      if (msg.type === 'done') es.close()
    }
    return () => es.close()
  }, [q])

  return text
}


Mastra streams → SSE → UI. That’s it. (Mastra’s streaming API is documented; SSE is a standard browser primitive.) 
Mastra
+1

If you prefer fetch‑streaming instead of EventSource, return a raw ReadableStream and parse NDJSON on the client; but SSE is simpler for incremental text.

4) Server Function for typed RPC (the TanStack way)

Replace custom headers with typed input, validated in a Server Function. This gives type safety, schema enforcement, and native access to request headers/cookies if you do need them — plus you can return a raw Response for special cases. 
TanStack

// src/server/runAgent.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { mainAgent } from '~/mastra'
import { getBindings } from '~/utils/bindings'

const RunSchema = z.object({
  input: z.string().min(1),
  debug: z.object({
    ensureGraph: z.boolean().optional(),
    graphHints: z.boolean().optional(),
    retrieve: z.boolean().optional(),
    xray: z.boolean().optional(),
    rank: z.boolean().optional(),
    assemble: z.boolean().optional(),
    sub: z.object({
      xrayFind: z.boolean().optional(),
      xrayImpact: z.boolean().optional(),
      xraySnippets: z.boolean().optional(),
    }).optional(),
  }).optional(),
})

export const runAgent = createServerFn({ method: 'POST' })
  .validator((d: unknown) => RunSchema.parse(d))
  .handler(async ({ data }) => {
    const env = getBindings()
    // env.OPENAI_API_KEY, env.XAI_API_KEY, etc.

    const res = await mainAgent.run({ input: data.input })
    return { text: await res.text }
  })


On the client:

import { useServerFn } from '@tanstack/react-start'
import { runAgent } from '~/server/runAgent'

export function Ask() {
  const rpc = useServerFn(runAgent)
  // client code: await rpc({ input, debug })
}


Server Functions support response: 'raw' if you need to stream or write custom headers — but for SSE specifically, prefer a Server Route with GET. 
TanStack

3) Mastra initialization (providers: OpenAI + Grok; optional Groq)

Mastra rides on ai-sdk providers. Keep your direct OpenAI and xAI (Grok); you can also add Groq with no churn, then choose per task. 
Mastra
+2
ai-sdk.dev
+2

// src/mastra/index.ts
import { Agent } from '@mastra/core/agent'
import { Workflow } from '@mastra/core/workflow'
// Providers
import { openai } from '@ai-sdk/openai'
import { xai } from '@ai-sdk/xai'        // Grok provider
// import { groq } from '@ai-sdk/groq'    // Optional: add Groq

// You can dynamically pick models later, but set sensible defaults:
export const models = {
  quality: openai('gpt-4.1-mini'),       // or 'gpt-4o' if needed
  reasoning: xai('grok-4'),              // xAI, OpenAI-compatible API
  // speed: groq('llama-3.1-70b-versatile'), // example Groq model
}

// A simple agent; swap in your tools/workflows
export const mainAgent = new Agent({
  name: 'MainAgent',
  instructions: 'You are a helpful assistant.',
  model: models.quality,
})

// Example: a Mastra workflow (compose tools/agents/steps)
export const myWorkflow = new Workflow({
  name: 'MyWorkflow',
  steps: [
    // createStep(mainAgent), createStep(myTool), etc.
  ],
})


xAI’s API is OpenAI/Anthropic‑compatible (so you don’t need a different client approach). 
xAI

Mastra supports streaming from agents and workflows (we’ll hook it to SSE next). 
Mastra

FYI: Mastra also ships optional Cloudflare deploy/storage integrations if you want KV/D1 for memory or traces, but you don’t have to adopt them on day one. 
Mastra
+