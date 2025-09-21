Server Routes — TanStack Start

• Purpose: Define server-side endpoints for raw HTTP, forms, auth, etc., handled by Start's server.
• Location: ./src/routes alongside app routes. Any file exporting ServerRoute becomes an API route.
• Quick example:
routes/hello.ts → ServerRoute = createServerFileRoute().methods({ GET: async ({request}) => new Response('Hello') })
• Same file for server + app:
routes/hello.tsx → export ServerRoute (eg POST) and export Route/component; client can fetch('/hello').
• File routing conventions (mirror TanStack Router):

* routes/users.ts → /users
* routes/users.index.ts → /users (errors if duplicate methods)
* routes/users/$id.ts → /users/$id
* routes/users/$id/posts.ts or routes/users.$id.posts.ts → /users/$id/posts
* routes/api/file/$.ts → /api/file/$
* routes/my-script[.]js.ts → /my-script.js

• Unique path: Only one handler file per resolved path; duplicates (users.ts, users.index.ts, users/index.ts) error.
• Escaped matching: e.g., users[.]json.ts → /users.json
• Middleware scoping:

* Pathless layout routes: add middleware to groups.
* Break-out routes: bypass parent middleware.

• Organization: Mix nested dirs and filenames freely.
• Server handler:

* server.ts: export default createStartHandler({ createRouter })(defaultStreamHandler)
* Custom wrapper allowed; call Start handler inside.

• Defining handlers:

* Direct: methods({ GET: async ctx => new Response(...) })
* Builder with middleware: methods(api => ({ GET: api.middleware([mw]).handler(async ctx => ...) }))

• Handler ctx: { request, params, context }. Return Response/Promise<Response>; helpers from @tanstack/react-start allowed.

• Dynamic params:

* /users/$id → params.id
* /users/$id/posts/$postId → params.id, params.postId

• Wildcard (splat):

* /file/$ (routes/file/$.ts) → params._splat

• Request bodies: Use request.json(), request.text(), or request.formData() in POST/PUT/PATCH/DELETE. Await the promise.

• JSON responses:

* Manual: new Response(JSON.stringify(obj), { headers: { 'Content-Type': 'application/json' } })
* Helper: return json(obj)

• Status codes:

* new Response(body, { status })
* setResponseStatus(code) then return Response/json

• Set headers:

* new Response(body, { headers })
* setHeaders({...}) before returning Response/json
