# Better Auth UI v3.x Migration Plan

## Overview
This document outlines the migration from `@daveyplate/better-auth-ui` v2.x to v3.x, which introduced major breaking changes in the API structure, component exports, and import patterns.

## Breaking Changes Summary
- Many hooks moved or removed: `useOnSuccessTransition`, `useIsHydrated`, `useCaptcha`
- Utils moved from submodules to main exports: `getLocalizedError`, `getPasswordSchema`, `isValidEmail`
- Component structure changed: `AuthCard` replaced with `AuthView`
- Import structure reorganized: removed `/utils` and `/captcha` submodules
- Localization properties changed: some keys renamed or removed
- Form component exports changed

## Migration Tasks

### Phase 1: Update Dependencies and Core Structure
- [ ] **Update package versions**: Ensure we're on latest compatible versions
- [ ] **Update AuthUIProvider import**: Change from main export to `/tanstack` submodule 
- [ ] **Update root provider setup**: Verify AuthUIProviderTanstack is correctly configured
- [ ] **Update auth client setup**: Ensure better-auth client is compatible with v3.x

### Phase 2: Fix Import Statements
- [ ] **Remove deprecated hook imports**: Remove `useOnSuccessTransition`, `useIsHydrated`, `useCaptcha` from main imports
- [ ] **Remove deprecated submodule imports**: Remove imports from `/utils` and `/captcha` submodules
- [ ] **Update utils imports**: Import `getLocalizedError`, `getPasswordSchema`, `isValidEmail` from main module
- [ ] **Update component imports**: Replace `AuthCard` with `AuthView` and update related imports
- [ ] **Fix missing type imports**: Add missing types like `PasswordValidation` and `AuthCardProps`

### Phase 3: Migrate Custom Auth Components
- [ ] **Update email-sign-in-form.tsx**: Replace deprecated hooks with v3.x equivalents
  - Replace `useOnSuccessTransition` with built-in form handling
  - Replace `useIsHydrated` with v3.x equivalent
  - Replace `useCaptcha` with v3.x captcha handling
  - Update utils imports to main module
- [ ] **Update sign-in-form.tsx**: Migrate to v3.x structure
  - Update imports and hook usage
  - Fix localization property references
  - Update error handling patterns
- [ ] **Update sign-up-form.tsx**: Migrate form implementation
  - Update hook imports and usage
  - Fix additional field handling
  - Update validation patterns
- [ ] **Update forgot-password-form.tsx**: Migrate form structure
- [ ] **Update reset-password-form.tsx**: Update to v3.x patterns
- [ ] **Update magic-link-form.tsx**: Migrate component structure

### Phase 4: Fix Component References
- [ ] **Update auth-styles.ts**: Fix `AuthCardProps` reference and classNames structure
- [ ] **Update custom-auth-card.tsx**: Replace `AuthCard` with `AuthView` or remove if redundant
- [ ] **Update auth route handler**: Replace custom forms with v3.x `AuthView` component if appropriate
- [ ] **Fix Header.tsx**: Ensure `SignedIn`/`SignedOut` components work with v3.x

### Phase 5: Update Localization
- [ ] **Fix missing localization keys**: Add missing keys or map to new v3.x equivalents
  - `SIGN_IN_LINK` → `SIGN_IN` or custom handling
  - `ERROR_DEFAULT` → `REQUEST_FAILED` or custom handling
  - `FORGOT_PASSWORD_TITLE` → `FORGOT_PASSWORD`
  - `RESET_PASSWORD_TITLE` → `RESET_PASSWORD`
- [ ] **Update auth-styles.ts localization**: Remove or replace deprecated keys
- [ ] **Verify all localization usage**: Ensure all used keys exist in v3.x

### Phase 6: Update Route Handling
- [ ] **Fix route type issues**: Update TanStack Router type definitions for auth routes
- [ ] **Update auth/$pathname.tsx**: Ensure compatibility with v3.x AuthView
- [ ] **Fix navigation patterns**: Update redirect handling for v3.x structure
- [ ] **Update search parameter handling**: Ensure compatibility with new API

### Phase 7: Handle Form State and Validation
- [ ] **Fix form field types**: Resolve TypeScript errors in form components
- [ ] **Update validation schemas**: Ensure Zod schemas work with v3.x
- [ ] **Fix checkbox state handling**: Resolve CheckedState type issues
- [ ] **Update form submission patterns**: Align with v3.x expectations

### Phase 8: Testing and Validation
- [ ] **Run TypeScript compiler**: Fix all TypeScript errors
- [ ] **Test sign-in flow**: Verify email/password and magic link sign-in
- [ ] **Test sign-up flow**: Verify registration with all field types
- [ ] **Test OAuth flows**: Verify GitHub and Google OAuth
- [ ] **Test password reset**: Verify forgot/reset password flow
- [ ] **Test session management**: Verify sign-out and session handling
- [ ] **Test responsive design**: Ensure UI works on mobile and desktop
- [ ] **Run integration tests**: Verify auth integration tests pass

### Phase 9: Cleanup and Optimization
- [ ] **Remove unused imports**: Clean up any remaining unused imports
- [ ] **Remove deprecated files**: Delete any files that are no longer needed
- [ ] **Update documentation**: Update any internal docs referencing old API
- [ ] **Optimize bundle size**: Ensure tree-shaking works correctly with new imports
- [ ] **Update Cursor rules**: Update any Cursor rules that reference old API patterns

## Key API Changes Reference

### Hook Replacements
```typescript
// OLD v2.x
import { useOnSuccessTransition, useIsHydrated, useCaptcha } from '@daveyplate/better-auth-ui'

// NEW v3.x - These hooks are now internal or replaced
// useOnSuccessTransition → Use built-in form success handling
// useIsHydrated → Use from '@daveyplate/better-auth-ui' (exported in v3.x)
// useCaptcha → Use from '@daveyplate/better-auth-ui' (exported in v3.x)
```

### Utils Migration
```typescript
// OLD v2.x
import { getLocalizedError, getPasswordSchema } from '@daveyplate/better-auth-ui/utils'

// NEW v3.x
import { getLocalizedError, getPasswordSchema } from '@daveyplate/better-auth-ui'
```

### Component Migration
```typescript
// OLD v2.x
import { AuthCard } from '@daveyplate/better-auth-ui'

// NEW v3.x
import { AuthView } from '@daveyplate/better-auth-ui'
```

### Provider Migration
```typescript
// OLD v2.x
import { AuthUIProvider } from '@daveyplate/better-auth-ui'

// NEW v3.x (for TanStack)
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack'
```

## Success Criteria
- [ ] All TypeScript errors resolved
- [ ] All authentication flows working (sign-in, sign-up, OAuth, password reset)
- [ ] No console errors in browser
- [ ] All tests passing
- [ ] UI/UX unchanged from user perspective
- [ ] Bundle size not significantly increased

## Rollback Plan
If migration fails or causes issues:
1. Revert to `@daveyplate/better-auth-ui@2.1.11`
2. Restore original import patterns
3. Test that everything works as before
4. Plan alternative approach or wait for v3.x stabilization

## Notes
- The constructa-starter project has custom auth forms that may need significant refactoring
- Some previously exported utilities may now be internal to v3.x
- The new v3.x structure is more modular but requires careful import management
- TanStack Start integration should work seamlessly with v3.x AuthUIProviderTanstack
