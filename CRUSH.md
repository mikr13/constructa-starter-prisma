# CRUSH.md - Constructa Starter Development Guide

## Build/Lint/Test Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Testing
pnpm test                   # Run all tests
pnpm test:auth              # Run auth integration tests
pnpm test:auth:watch        # Run auth tests in watch mode

# Linting
pnpm lint                   # Run oxlint
pnpm lint:fix               # Fix linting issues

# Database
pnpm db:migrate             # Run database migrations
pnpm db:studio              # Open Prisma Studio
pnpm db:generate            # Generate migration files
```

## Code Style Guidelines

### TypeScript/React

- Use `.tsx` for all route files
- Strict TypeScript enabled - no implicit any
- Use `~` alias for imports from `./src`
- No default exports in route files
- React 19 with new JSX transform

### Formatting (Prettier)

- Single quotes, semicolons, trailing commas (ES5)
- 100 character line width, 2-space tabs
- Always use arrow parentheses

### Naming Conventions

- Components: PascalCase (`UserButton`, `AuthCard`)
- Routes: kebab-case with parentheses for groups (`(marketing)`, `dashboard/chat`)
- Server functions: camelCase (`createServerFn`, `getUserById`)
- Database schemas: `<name>.schema.ts`

### Authentication

- Use `@daveyplate/better-auth-ui` components
- Wrap app with `AuthUIProvider` at root
- Use `useAuthenticate()` hook for protected routes
- Server routes: export as `ServerRoute` (not `APIRoute`)

### Environment Variables

- Browser code: `import.meta.env`
- Server-only code: `process.env`
- Never commit `.env`, update `.env.example` instead

### Error Handling

- Use Zod for validation in server functions
- Throw errors for 500 responses
- Use `redirect()` and `notFound()` from TanStack Router
- Console only allowed for errors in production

### Testing

- Tests require dev server running on localhost:3000
- Database must be migrated before testing
- Mock external dependencies (email, APIs)
- Use unique test data to avoid conflicts
