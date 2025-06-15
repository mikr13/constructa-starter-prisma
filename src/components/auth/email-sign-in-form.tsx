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
import { formClassNames } from './auth-styles';

export interface SignInFormProps {
  className?: string;
  isSubmitting?: boolean;
  localization?: Partial<AuthLocalization>;
  redirectTo?: string;
  setIsSubmitting?: (isSubmitting: boolean) => void;
  passwordValidation?: PasswordValidation;
}

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
