# Better Auth UI v3 – Project API Guidance

## Provider Integration
- Use `AuthUIProviderTanstack` from `@daveyplate/better-auth-ui/tanstack` at the root route. It already wires `QueryClient` context and TanStack Router navigation (`navigate`, `replace`, `Link`).
- Provide our `authClient`, `redirectTo`, and TanStack `router.navigate` delegates. Optional settings such as `persistClient`, `basePath`, `viewPaths`, `localization`, and feature flags (`magicLink`, `credentials`, `captcha`, etc.) are passed here.
- `AuthQueryProvider` from `@daveyplate/better-auth-tanstack` must continue to wrap the tree so session queries remain hydrated.

## Core Surface Area
- **`AuthView`** (from `@daveyplate/better-auth-ui`) renders the full auth experience – sign-in, sign-up, magic link, password reset, two-factor, etc. Drive it via `pathname`, `redirectTo`, and optional `callbackURL` rather than composing individual forms.
- **`AuthForm`** and the individual form components still exist, but prefer the canned `AuthView` unless a flow truly needs bespoke behavior.
- **Hooks** exposed from the package (e.g. `useIsHydrated`, `useCaptcha`, `useAuthData`) come from the root export; legacy imports such as `/utils` or `/captcha` paths are removed in v3.
- **Utilities** (`cn`, `getLocalizedError`, `getPasswordSchema`, `getSearchParam`) now ship from the main entry point. Avoid historic `/utils` submodule imports.

## Localization & Styling
- Merge project copy into Better Auth UI’s localization object. We maintain overrides in `auth-styles.ts` (`authLocalizationOverrides`).
- `AuthView` accepts `classNames: AuthViewClassNames` – we compose these in `auth-styles.ts`, including nested `AuthFormClassNames` (`formClassNames`).
- Avoid referencing `AuthCard` – it is superseded by `AuthView` in our stack.

## View Routing
- `AuthViewPaths` enum values are uppercase (`SIGN_IN`, `FORGOT_PASSWORD`, etc.). When you need raw paths, read them off `AuthUIContext.viewPaths`.
- Route modules should pass the current `pathname` (e.g. `'sign-in'`) to `AuthView` and let the library select the correct view via `getViewByPath`.

## Feature Flags & Plugins
- Credentials, magic link, passkey, email OTP, and organization cards are toggled via `AuthUIProviderTanstack` props. Before customizing UI, confirm the desired feature is enabled (check `AuthUIContext` flags).
- Captcha support is automatic when `captcha` config is passed; use `useCaptcha` to access headers if writing custom fetches.

## Best Practices
1. **Prefer composition via `AuthView`.** Implement custom forms only as a last resort.
2. **Stick to root exports.** Hooks, components, and utilities now resolve from `@daveyplate/better-auth-ui` directly.
3. **Respect TanStack navigation.** Use the provided `navigate`/`replace` helpers instead of mutating `window.location` manually.
4. **Keep localization centralised.** Update `authLocalizationOverrides` instead of duplicating message strings across routes.
5. **Consult `AuthUIContext`.** Context exposes runtime configuration (enabled providers, redirect targets, base paths) for conditional UI.
