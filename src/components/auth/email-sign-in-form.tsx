'use client';

import type { BetterFetchOption } from '@better-fetch/fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Link } from '@tanstack/react-router';

// Import hooks and context from better-auth-ui main export
import {
  AuthUIContext,
  useOnSuccessTransition,
  useIsHydrated,
  useCaptcha,
} from '@daveyplate/better-auth-ui';
import type { AuthLocalization } from '@daveyplate/better-auth-ui';

// Import utilities from the utils subpath
import {
  cn,
  getLocalizedError,
  getPasswordSchema,
  isValidEmail,
} from '@daveyplate/better-auth-ui/utils';

// Define PasswordValidation type locally since it's not exported
type PasswordValidation = {
  maxLength?: number;
  minLength?: number;
  regex?: RegExp;
};

// Import captcha from the captcha subpath
import { Captcha } from '@daveyplate/better-auth-ui/captcha';

// Import auth-specific UI components from better-auth-ui
import { PasswordInput } from '@daveyplate/better-auth-ui';

// Import generic UI components from local ui folder
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
  passwordValidation?: PasswordValidation;
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
  passwordValidation,
}: SignInFormProps) {
  const isHydrated = useIsHydrated();
  const { captchaRef, getCaptchaHeaders } = useCaptcha({ localization });

  const {
    authClient,
    basePath,
    credentials,
    localization: contextLocalization,
    viewPaths,
    navigate,
    toast,
  } = useContext(AuthUIContext);

  const rememberMeEnabled = credentials?.rememberMe;
  const usernameEnabled = credentials?.username;
  const contextPasswordValidation = credentials?.passwordValidation;

  const mergedLocalization = { ...contextLocalization, ...localization };
  const mergedPasswordValidation = { ...contextPasswordValidation, ...passwordValidation };

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  const formSchema = z.object({
    email: usernameEnabled
      ? z.string().min(1, {
          message: `${mergedLocalization.USERNAME} ${mergedLocalization.IS_REQUIRED}`,
        })
      : z
          .string()
          .min(1, {
            message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_REQUIRED}`,
          })
          .email({
            message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_INVALID}`,
          }),
    password: getPasswordSchema(mergedPasswordValidation, mergedLocalization),
    rememberMe: z.boolean().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: !rememberMeEnabled,
    },
  });

  const isLoading = isSubmitting || form.formState.isSubmitting || transitionPending;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending);
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting]);

  async function signIn({ email, password, rememberMe }: z.infer<typeof formSchema>) {
    try {
      let response: Record<string, unknown> = {};

      if (usernameEnabled && !isValidEmail(email)) {
        const fetchOptions: BetterFetchOption = {
          throw: true,
          headers: await getCaptchaHeaders('/sign-in/username'),
        };

        response = await authClient.signIn.username({
          username: email,
          password,
          rememberMe,
          fetchOptions,
        });
      } else {
        const fetchOptions: BetterFetchOption = {
          throw: true,
          headers: await getCaptchaHeaders('/sign-in/email'),
        };

        response = await authClient.signIn.email({
          email,
          password,
          rememberMe,
          fetchOptions,
        });
      }

      if (response.twoFactorRedirect) {
        navigate(`${basePath}/${viewPaths.TWO_FACTOR}${window.location.search}`);
      } else {
        await onSuccess();
      }
    } catch (error) {
      form.resetField('password');

      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization: mergedLocalization }),
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(signIn)}
        noValidate={isHydrated}
        className={cn(formClassNames.base, className)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={formClassNames.label}>
                {usernameEnabled ? mergedLocalization.USERNAME : mergedLocalization.EMAIL}
              </FormLabel>

              <FormControl>
                <Input
                  className={formClassNames.input}
                  type={usernameEnabled ? 'text' : 'email'}
                  placeholder={
                    usernameEnabled
                      ? mergedLocalization.SIGN_IN_USERNAME_PLACEHOLDER
                      : mergedLocalization.EMAIL_PLACEHOLDER
                  }
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>

              <FormMessage className={formClassNames.error} />
            </FormItem>
          )}
        />

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
                    to={`${basePath}/${viewPaths.FORGOT_PASSWORD}${isHydrated ? window.location.search : ''}`}
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

        <Captcha ref={captchaRef} localization={mergedLocalization} action="/sign-in/email" />

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(formClassNames.button, formClassNames.primaryButton)}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : mergedLocalization.SIGN_IN_ACTION}
        </Button>
      </form>
    </Form>
  );
}
