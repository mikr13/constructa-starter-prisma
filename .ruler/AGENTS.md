- Always get recommendation and best practice considering latest NOW date
- Always use pnpm as the package manager.
- All route files must be written in **TypeScript React** (`.tsx`).
- Use alias imports: `~` resolves to root `./src`.
- Never update .env file, update the .env.example instead
- Never start the dev server with "pnpm run dev" or "npm run dev"

## TanStack Start Best Practices

### Static Server Functions
* Build-time run & cached as static JSON via key `(fnId + params hash)` when `createServerFn({ type: 'static' })`.
* Prerender: data embedded in HTML → hydrated on mount → later client calls fetch the JSON.
* Custom cache: `createServerFnStaticCache({ setItem, getItem, fetchItem })` + `setServerFnStaticCache(...)`.

### Server Functions
**What**: RPC-style functions callable anywhere; run only on server; no stable public URL. Access request context, env, cookies; return primitives/JSON/Response; can throw redirects/notFounds/errors.

**How**: Server bundle keeps code; client bundle replaces calls with `fetch` proxy.

**Define**:
```ts
createServerFn(opts?).handler(async (ctx)=>{/*...*/})
```

**Options**:
* `method?: 'GET'|'POST'` (default GET)
* `response?: 'data'|'full'|'raw'` (`raw` enables streaming/custom headers)

**Where**: Callable from server/client/other server fns.

**Params**: Single param: primitives, arrays/objects, FormData, ReadableStream, Promise.

**Validation & Types**: `.validator(input=>validated)` enforces runtime checks & drives types (works with Zod). Non-validated typing: identity validator.

**Examples**:
* JSON input → typed greet.
* FormData → parse fields, return string.
* Zod `.transform` shows inferred output types.

**Context (via `@tanstack/react-start/server`)**: `getWebRequest`, `getHeaders`/`getHeader`, set cookies/headers/status, sessions, multipart, etc.

**Returns**:
* Primitives/JSON (default)
* With headers: `setHeader(...)`
* With status: `setResponseStatus(...)`
* Raw/streaming: set `response:'raw'` and return `Response`/SSE.

**Errors & Control Flow**:
* Throw any error → serialized JSON + 500.
* `redirect({...|href,status,headers})` from `@tanstack/react-router`.
* `notFound()` for router-aware 404s.
* Cancellation: supports `AbortSignal` (client abort notifies server).

**Usage**:
* In route lifecycles (`loader/beforeLoad`) → redirects/notFounds auto-handled.
* In components: use `useServerFn(fn)`; integrate with React Query.
* Elsewhere: handle redirects/notFounds manually.

**No-JS support**:
* Use HTML `<form action={serverFn.url} method="POST">` (standard `action` string).
* Pass args via form inputs (`encType="multipart/form-data"` as needed).
* Return value unavailable to client JS; use HTTP redirects (e.g., 301 with `Location`) to trigger loader refresh.

**Static variant**: See top: prerender + cache; also linkable from main "Static Server Functions" page.

**Compilation pipeline**:
* Detect `createServerFn`; ensure `use server` directive.
* Extract server logic from client bundle; client gets proxy; server runs code as-is.
* Dead-code elimination per bundle.

### Selective SSR
• Default: ssr true. Change global default via createRouter({ defaultSsr: false }).
• SPA mode: disables all server beforeLoad/loader + component SSR app-wide.
• Per-route ssr:
  – true: server runs beforeLoad + loader, server renders component, sends HTML + data.
  – false: no server beforeLoad/loader, no server render; all runs on client.
  – 'data-only': server runs beforeLoad + loader (data sent), component renders only on client.
• Functional ssr(props): run on server only (initial request), stripped from client; can return true | false | 'data-only' based on validated params/search.
• Validation shapes: params/search are discriminated unions with status success | error; success carries validated value.
• Inheritance: child inherits parent ssr; can only become more restrictive (true → 'data-only' or false; 'data-only' → false).
• Fallback: first route with ssr false or 'data-only' renders pendingComponent; else defaultPendingComponent; shown at least minPendingMs (or defaultPendingMinMs).
• Root: you can disable SSR of root route's component with ssr false, but shellComponent (html/head/body + Scripts/HeadContent) is always SSRed.

### No useEffect for Data Fetching or State Derivation
Don't fetch or derive app state in useEffect.

1. Fetch on navigation via TanStack Router loaders (SSR + streaming). Optionally seed TanStack Query in the loader with queryClient.ensureQueryData. [1]
2. Do server work on the server via TanStack Start Server Functions; after mutations call router.invalidate() and/or queryClient.invalidateQueries(). [2]
3. Keep page/UI state in the URL with typed search params (validateSearch, Route.useSearch, navigate). [3]
4. Reserve useEffect for real external side-effects only (DOM, subscriptions, analytics). [4][6]

**If your useEffect was doing X → Use Y**:
- Fetching on mount/params change → route loader (+ ensureQueryData). [1]
- Submitting/mutating → Server Function → invalidate router/queries. [2]
- Syncing UI to querystring → typed search params + navigate. [3]
- Derived state → compute during render (useMemo only if expensive). [4]
- Subscribing to external stores → useSyncExternalStore. [5]
- DOM/non-React widgets/listeners → small useEffect/useLayoutEffect. [6]

**Idiomatic patterns (names only, no boilerplate)**:
- Loader: queryClient.ensureQueryData(queryOptions({ queryKey, queryFn })) → useSuspenseQuery reads hydrated cache. [1]
- Mutation: createServerFn(...).handler(...) → onSuccess: qc.invalidateQueries, router.invalidate. Supports <form action={serverFn.url}> for progressive enhancement. [2]
- Search params as state: validateSearch → Route.useSearch → navigate({ search }). [3]
- External store read: useSyncExternalStore(subscribe, getSnapshot). [5]

**Decision checklist**:
- Data needed at render → loader (defer/stream as needed). [1]
- User changed data → Server Function → invalidate. [2]
- Belongs in URL → typed search params. [3]
- Purely derived → compute in render. [4]
- External system only → useEffect/useLayoutEffect. [6]
- SSR/SEO → loader-based fetching; configure streaming/deferred. [7]

**React 19 helpers**:
- useActionState for form pending/error/result (pairs with Server Functions or TanStack Form). [8]
- use to suspend on promises (client or server). [9]

**Zustand in TanStack Start (where it fits)**:
- Use for client/UI/session and push-based domain state (theme, modals, wizards, optimistic UI, WebSocket buffers). Keep server data in loaders/Query.
- Per request store instance to avoid SSR leaks. Inject via Router context; provide with Wrap; dehydrate/hydrate via router.dehydrate/router.hydrate so snapshots stream with the page. After navigation resolution, clear transient UI (router.subscribe('onResolved', ...)).
- Mutations: do work in Server Function → optionally update store optimistically → router.invalidate to reconcile with loader data.
- Add persist middleware only for client/session state; avoid touching storage during SSR.
- Use atomic selectors (useStore(s => slice)) and equality helpers to limit re-renders.

**Docs map**: [1] Router data loading, [2] Server Functions, [3] Search Params, [4] You Might Not Need an Effect, [5] useSyncExternalStore, [6] Synchronizing with Effects, [7] SSR, [8] useActionState, [9] use.