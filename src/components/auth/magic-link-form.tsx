'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { BetterFetchOption } from 'better-auth/react';
import { Loader2 } from 'lucide-react';
import { useCallback, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useCaptcha } from '@daveyplate/better-auth-ui';
import { useIsHydrated } from '@daveyplate/better-auth-ui';
import { AuthUIContext } from '@daveyplate/better-auth-ui';
import { cn, getLocalizedError, getSearchParam } from '@daveyplate/better-auth-ui';
import type { AuthLocalization } from '@daveyplate/better-auth-ui';
import { Captcha } from '@daveyplate/better-auth-ui';
import { Button } from '@daveyplate/better-auth-ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@daveyplate/better-auth-ui';
import { Input } from '@daveyplate/better-auth-ui';

export interface MagicLinkFormProps {
  className?: string;
  callbackURL?: string;
  isSubmitting?: boolean;
  localization?: Partial<AuthLocalization>;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
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

export function MagicLinkForm({
  className,
  callbackURL: callbackURLProp,
  isSubmitting,
  localization = {},
  redirectTo: redirectToProp,
  setIsSubmitting,
}: MagicLinkFormProps) {
  const isHydrated = useIsHydrated();
  const { captchaRef, getCaptchaHeaders } = useCaptcha({ localization });

  const {
    authClient,
    basePath,
    baseURL,
    persistClient,
    localization: contextLocalization,
    redirectTo: contextRedirectTo,
    viewPaths,
    toast,
  } = useContext(AuthUIContext);

  const mergedLocalization = { ...contextLocalization, ...localization };

  const getRedirectTo = useCallback(
    () => redirectToProp || getSearchParam('redirectTo') || contextRedirectTo,
    [redirectToProp, contextRedirectTo]
  );

  const getCallbackURL = useCallback(
    () =>
      `${baseURL}${
        callbackURLProp ||
        (persistClient
          ? `${basePath}/${viewPaths.CALLBACK}?redirectTo=${getRedirectTo()}`
          : getRedirectTo())
      }`,
    [callbackURLProp, persistClient, basePath, viewPaths, baseURL, getRedirectTo]
  );

  const formSchema = z.object({
    email: z
      .string()
      .min(1, {
        message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_REQUIRED}`,
      })
      .email({
        message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_INVALID}`,
      }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const isLoading = isSubmitting || form.formState.isSubmitting;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting);
  }, [form.formState.isSubmitting, setIsSubmitting]);

  async function sendMagicLink({ email }: z.infer<typeof formSchema>) {
    try {
      const fetchOptions: BetterFetchOption = {
        throw: true,
        headers: await getCaptchaHeaders('/sign-in/magic-link'),
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
        message: getLocalizedError({ error, localization: mergedLocalization }),
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(sendMagicLink)}
        noValidate={isHydrated}
        className={cn(formClassNames.base, className)}
      >
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

        <Captcha ref={captchaRef} localization={mergedLocalization} action="/sign-in/magic-link" />

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(formClassNames.button, formClassNames.primaryButton)}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : mergedLocalization.MAGIC_LINK_ACTION}
        </Button>
      </form>
    </Form>
  );
}
