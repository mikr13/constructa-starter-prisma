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
import { formClassNames } from './auth-styles';

export interface MagicLinkFormProps {
  className?: string;
  callbackURL?: string;
  isSubmitting?: boolean;
  localization?: Partial<AuthLocalization>;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
}

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
