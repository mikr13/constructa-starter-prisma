# Better Auth UI Components – Project Conventions

## Root Composition
- Wrap the app tree with `AuthQueryProvider` (from `@daveyplate/better-auth-tanstack`) and `AuthUIProviderTanstack`. The latter lives in `src/routes/__root.tsx` and wires navigation from TanStack Router.
- Pass project-specific overrides via `authLocalizationOverrides` and `authViewClassNames` (see `src/components/auth/auth-styles.ts`).

## Auth Screens
- Route modules should render `<AuthView />` from `@daveyplate/better-auth-ui` rather than hand-rolling sign-in/up forms. Provide:
  - `pathname` – current `params.pathname` (`sign-in`, `sign-up`, `forgot-password`, etc.)
  - `redirectTo` – destination query value or default dashboard
  - `localization` – merged copy (base localization + overrides + route-specific tweaks)
  - Optional `callbackURL`, `cardHeader`, `socialLayout`, `otpSeparators`
- `AuthView` automatically selects which underlying form to show and includes social providers, passkeys, captcha, OTP, and footer links when enabled via provider props.

## Styling Hooks
- Prefer editing `auth-styles.ts` to control styling. It exports:
  - `formClassNames` (`AuthFormClassNames`) used across built-in forms
  - `authViewClassNames` (`AuthViewClassNames`) for `AuthView` sections
- Avoid inline Tailwind overrides inside route files; update the shared config so styles remain consistent across flows.

## Conditional UI
- Use `<SignedIn>` / `<SignedOut>` from `@daveyplate/better-auth-ui` inside layout components (e.g., `Header.tsx`).
- For protected content, you can also use `<RedirectToSignIn />`, `<RedirectToSignUp />`, or `useAuthenticate()` from the package.

## Custom Extensions
- If a flow truly needs bespoke UI, import specific forms (`SignInForm`, `ForgotPasswordForm`, etc.) from `@daveyplate/better-auth-ui` and reuse `formClassNames` to stay on-brand. Avoid copying legacy components from `src/components/auth` (they were removed in the v3 migration).
- Use hooks like `useCaptcha`, `useOnSuccessTransition`, and `useIsHydrated` directly from the root package when extending behaviour.

## Server & Emails
- For email templates or server-rendered pieces, import from `@daveyplate/better-auth-ui/server` and follow the package docs (no local wrappers required).

## Checklist for New Auth Work
1. Confirm the required feature (credentials, magic link, passkey, etc.) is enabled via `AuthUIProviderTanstack` props.
2. Add/adjust localization keys in `authLocalizationOverrides` when new copy is needed.
3. Reuse `authViewClassNames` or extend them before adding route-specific CSS.
4. Keep navigation within TanStack Router helpers – never call `window.location` directly unless absolutely necessary.
5. Run `pnpm exec tsc --noEmit` and UI smoke tests after changes.
