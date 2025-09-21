## ClientOnly Component

Renders components only on client to prevent SSR hydration errors. Uses `fallback` prop for loading states.

### Props
- `fallback`: Component to render while JS loads
- `children`: Component to render after JS loads

### Example
```tsx
<ClientOnly fallback={<FallbackCharts />}>
  <Charts />
</ClientOnly>
```

## Environment Functions

Utilities for environment-specific execution control.

### Isomorphic Functions

Use `createIsomorphicFn()` for functions that adapt to client/server environments.

```tsx
import { createIsomorphicFn } from '@tanstack/react-start'

const getEnv = createIsomorphicFn()
  .server(() => 'server')
  .client(() => 'client')

const env = getEnv() // Returns 'server' on server, 'client' on client
```

### envOnly Functions

`serverOnly` and `clientOnly` enforce strict environment execution.

```tsx
import { serverOnly, clientOnly } from '@tanstack/react-start'

const serverFn = serverOnly(() => 'bar') // Only runs on server
const clientFn = clientOnly(() => 'bar') // Only runs on client
```

### Tree Shaking

Environment functions are tree-shaken per bundle. Client code excluded from server bundle, and vice versa.

## TanStack Start Basics

### Dependencies
- TanStack Router: Web application routing
- Vite: Build tool and bundling

### Router Configuration
```tsx
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
  })
  return router
}
```

### Route Generation
`routeTree.gen.ts` generated automatically on first run of dev server.

### Server Entry Point (Optional)
```tsx
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import { createRouter } from './router'

export default createStartHandler({ createRouter })(defaultStreamHandler)
```

### Client Entry Point (Optional)
```tsx
import { StartClient } from '@tanstack/react-start'
import { createRouter } from './router'

const router = createRouter()
hydrateRoot(document, <StartClient router={router} />)
```

### Root Route
```tsx
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TanStack Start Starter' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}
```

### Routes
Routes use `createFileRoute` with automatic code-splitting and lazy-loading.

```tsx
export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await getCount(),
})
```

### Navigation
```tsx
import { Link, useNavigate, useRouter } from '@tanstack/react-router'

// Declarative navigation
<Link to="/about">About</Link>

// Imperative navigation
const navigate = useNavigate()
navigate({ to: '/about' })

// Router instance access
const router = useRouter()
```

## Server Functions (RPCs)

Create server-side functions callable from both server and client.

```tsx
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const getUserById = createServerFn({ method: 'GET' })
  .validator(z.string())
  .handler(async ({ data }) => {
    return db.query.users.findFirst({ where: eq(users.id, data) })
  })

// Usage
const user = await getUserById({ data: '1' })
```

### Mutations
```tsx
const updateUser = createServerFn({ method: 'POST' })
  .validator(UserSchema)
  .handler(({ data }) => dbUpdateUser(data))

// Invalidate data after mutations
await updateUser({ data: user })
router.invalidate()
queryClient.invalidateQueries({ queryKey: ['users', user.id] })
```

## Data Loading

Routes support `loader` functions for SSR and preloading.

```tsx
export const Route = createFileRoute('/')({
  loader: async () => await getCount(), // Runs on server and client
})
```

## Links & Navigation
- Use typed `<Link>` from `@tanstack/react-router`
- Example:
```tsx
<Link to="/posts/$postId" params={{ postId: post.id }}
      activeProps={{ className: 'text-black' }} className="block">
  {post.title}
</Link>
```
