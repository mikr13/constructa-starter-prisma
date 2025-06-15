'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { BetterFetchOption } from '@better-fetch/fetch';
import { Loader2 } from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Link } from '@tanstack/react-router';

import {
  AuthUIContext,
  PasswordInput,
  type AuthLocalization,
  GoogleIcon,
} from '@daveyplate/better-auth-ui';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';

export interface SignInFormProps {
  className?: string;
  isSubmitting?: boolean;
  localization?: Partial<AuthLocalization>;
  redirectTo?: string;
  setIsSubmitting?: (isSubmitting: boolean) => void;
}

// Import styling from custom-auth-card
const formClassNames = {
  base: 'space-y-4',
  description: 'hidden',
  label: 'block text-sm font-medium text-gray-700 mb-1.5',
  input:
    'w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-400 transition-all hover:border-gray-300',
  error: 'text-sm text-red-500 mt-1',
  primaryButton:
    'w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] shadow-md',
  secondaryButton:
    'w-full py-2.5 px-4 border border-orange-200 text-orange-700 rounded-lg font-medium hover:bg-orange-50 hover:border-orange-300 transition-colors',
  outlineButton:
    'text-orange-600 font-medium hover:text-orange-700 underline decoration-orange-200 underline-offset-2',
  forgotPasswordLink:
    'text-orange-600 font-medium hover:text-orange-700 underline decoration-orange-200 underline-offset-2',
  providerButton:
    'w-full py-2.5 px-4 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm',
  icon: 'w-5 h-5',
  checkbox: 'rounded border-gray-300 text-orange-500 focus:ring-orange-400',
  button: 'inline-flex items-center justify-center',
};

export function SignInForm({
  className,
  isSubmitting,
  localization = {},
  redirectTo,
  setIsSubmitting,
}: SignInFormProps) {
  const [authMode, setAuthMode] = useState<'magic-link' | 'password'>('magic-link');
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);

  const {
    authClient,
    basePath,
    baseURL,
    persistClient,
    credentials,
    localization: contextLocalization,
    viewPaths,
    navigate,
    toast,
  } = useContext(AuthUIContext);

  const rememberMeEnabled = credentials?.rememberMe;
  const mergedLocalization = { ...contextLocalization, ...localization };

  const getRedirectTo = useCallback(
    () =>
      redirectTo ||
      (typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirectTo')
        : null) ||
      '/',
    [redirectTo]
  );

  const getCallbackURL = useCallback(
    () =>
      `${baseURL}${
        persistClient
          ? `${basePath}/${viewPaths.CALLBACK}?redirectTo=${getRedirectTo()}`
          : getRedirectTo()
      }`,
    [persistClient, basePath, viewPaths, baseURL, getRedirectTo]
  );

  // Form schema for magic link mode
  const magicLinkSchema = z.object({
    email: z
      .string()
      .min(1, {
        message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_REQUIRED}`,
      })
      .email({
        message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_INVALID}`,
      }),
  });

  // Form schema for password mode
  const passwordSchema = z.object({
    email: z
      .string()
      .min(1, {
        message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_REQUIRED}`,
      })
      .email({
        message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_INVALID}`,
      }),
    password: z.string().min(1, {
      message: `${mergedLocalization.PASSWORD} ${mergedLocalization.IS_REQUIRED}`,
    }),
    rememberMe: z.boolean().optional(),
  });

  const formSchema = authMode === 'magic-link' ? magicLinkSchema : passwordSchema;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      ...(authMode === 'password' && {
        password: '',
        rememberMe: !rememberMeEnabled,
      }),
    },
  });

  const isLoading = isSubmitting || form.formState.isSubmitting || isLoadingSocial;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || isLoadingSocial);
  }, [form.formState.isSubmitting, isLoadingSocial, setIsSubmitting]);

  useEffect(() => {
    // Reset form when switching modes
    form.reset({
      email: form.getValues('email'),
      ...(authMode === 'password' && {
        password: '',
        rememberMe: !rememberMeEnabled,
      }),
    });
  }, [authMode, form, rememberMeEnabled]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    if (authMode === 'magic-link') {
      await sendMagicLink(values as z.infer<typeof magicLinkSchema>);
    } else {
      await signInWithPassword(values as z.infer<typeof passwordSchema>);
    }
  }

  async function sendMagicLink({ email }: z.infer<typeof magicLinkSchema>) {
    try {
      const fetchOptions: BetterFetchOption = {
        throw: true,
      };

      await authClient.signIn.magicLink({
        email,
        callbackURL: getCallbackURL(),
        fetchOptions,
      });

      toast({
        variant: 'success',
        message: mergedLocalization.MAGIC_LINK_EMAIL,
      });

      form.reset();
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError(error, mergedLocalization),
      });
    }
  }

  async function signInWithPassword({
    email,
    password,
    rememberMe,
  }: z.infer<typeof passwordSchema>) {
    try {
      const fetchOptions: BetterFetchOption = {
        throw: true,
      };

      const response = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        fetchOptions,
      });

      if (response.twoFactorRedirect) {
        navigate(`${basePath}/${viewPaths.TWO_FACTOR}${window.location.search}`);
      } else {
        navigate(getRedirectTo());
      }
    } catch (error) {
      form.resetField('password');

      toast({
        variant: 'error',
        message: getLocalizedError(error, mergedLocalization),
      });
    }
  }

  async function handleSocialSignIn(provider: string) {
    try {
      setIsLoadingSocial(true);
      await authClient.signIn.social({
        provider,
        callbackURL: getCallbackURL(),
      });
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError(error, mergedLocalization),
      });
      setIsLoadingSocial(false);
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Social auth - Google */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => handleSocialSignIn('google')}
          disabled={isLoading}
          className={cn(
            formClassNames.providerButton,
            'flex-col gap-1 px-6 py-4 min-w-[100px]',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoadingSocial ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <GoogleIcon className="w-6 h-6" />
          )}
          <span className="text-sm">Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-gray-200" />
        <span className="text-sm text-gray-400">or</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className={formClassNames.base}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={formClassNames.label}>{mergedLocalization.EMAIL}</FormLabel>
                <FormControl>
                  <Input
                    className={formClassNames.input}
                    type="email"
                    placeholder={mergedLocalization.EMAIL_PLACEHOLDER}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className={formClassNames.error} />
              </FormItem>
            )}
          />

          {authMode === 'password' && (
            <>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className={formClassNames.label}>
                        {mergedLocalization.PASSWORD}
                      </FormLabel>
                      {credentials?.forgotPassword && (
                        <Link
                          className={formClassNames.forgotPasswordLink}
                          to={`${basePath}/${viewPaths.FORGOT_PASSWORD}${typeof window !== 'undefined' ? window.location.search : ''}`}
                        >
                          {mergedLocalization.FORGOT_PASSWORD_LINK}
                        </Link>
                      )}
                    </div>
                    <FormControl>
                      <PasswordInput
                        autoComplete="current-password"
                        className={formClassNames.input}
                        placeholder={mergedLocalization.PASSWORD_PLACEHOLDER}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={formClassNames.error} />
                  </FormItem>
                )}
              />

              {rememberMeEnabled && (
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          className={formClassNames.checkbox}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        {mergedLocalization.REMEMBER_ME}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              )}
            </>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className={cn(formClassNames.button, formClassNames.primaryButton)}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : authMode === 'magic-link' ? (
              mergedLocalization.MAGIC_LINK_ACTION || 'Continue'
            ) : (
              mergedLocalization.SIGN_IN_ACTION
            )}
          </Button>
        </form>
      </Form>

      {/* Auth mode toggle */}
      <p className="text-center text-sm text-gray-600">
        {authMode === 'magic-link' ? (
          <>
            We'll email you a link for a password-free sign in. Or{' '}
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className={formClassNames.outlineButton}
            >
              sign in with a password
            </button>
            .
          </>
        ) : (
          <>
            Want to sign in without a password?{' '}
            <button
              type="button"
              onClick={() => setAuthMode('magic-link')}
              className={formClassNames.outlineButton}
            >
              Use a magic link
            </button>
            .
          </>
        )}
      </p>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link
          to={`${basePath}/${viewPaths.SIGN_UP}${typeof window !== 'undefined' ? window.location.search : ''}`}
          className={formClassNames.outlineButton}
        >
          {mergedLocalization.SIGN_UP_LINK}
        </Link>
      </p>

      {/* Terms */}
      <p className="text-center text-xs text-gray-400">
        By signing in, you agree to our{' '}
        <Link to="/terms" className={formClassNames.outlineButton}>
          Terms of Service
        </Link>{' '}
        &amp;{' '}
        <Link to="/privacy" className={formClassNames.outlineButton}>
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

// Helper function to get localized error messages
function getLocalizedError(error: unknown, localization: Partial<AuthLocalization>): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return localization.ERROR_DEFAULT || 'An error occurred';
}
