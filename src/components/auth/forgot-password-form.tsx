'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { AuthUIContext } from '@daveyplate/better-auth-ui';
import { cn } from '~/lib/utils';
import { formClassNames } from './auth-styles';
import type { AuthLocalization } from '@daveyplate/better-auth-ui';
import { useRouter } from '@tanstack/react-router';
import { authClient } from '~/lib/auth-client';

export interface ForgotPasswordFormProps {
  className?: string;
  isSubmitting?: boolean;
  localization?: Partial<AuthLocalization>;
  setIsSubmitting?: (value: boolean) => void;
}

export function ForgotPasswordForm({
  className,
  isSubmitting,
  localization = {},
  setIsSubmitting,
}: ForgotPasswordFormProps) {
  const router = useRouter();
  const baseURL = typeof window !== 'undefined' ? window.location.origin : '';

  const formSchema = z.object({
    email: z
      .string()
      .min(1, {
        message: `${localization.EMAIL} ${localization.IS_REQUIRED}`,
      })
      .email({
        message: `${localization.EMAIL} ${localization.IS_INVALID}`,
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

  async function forgotPassword({ email }: z.infer<typeof formSchema>) {
    try {
      await authClient.forgetPassword({
        email,
        redirectTo: `${baseURL}/auth/reset-password`,
      });

      // Show success message and redirect to sign in
      router.navigate({
        to: '/auth/sign-in',
        search: { message: 'password-reset-sent' },
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Error handling is done by the UI through form state
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(forgotPassword)}
        className={cn('grid w-full gap-6', className, formClassNames.base)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={formClassNames.label}>{localization.EMAIL}</FormLabel>

              <FormControl>
                <Input
                  className={formClassNames.input}
                  type="email"
                  placeholder={localization.EMAIL_PLACEHOLDER}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>

              <FormMessage className={formClassNames.error} />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className={cn('w-full', formClassNames.button, formClassNames.primaryButton)}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : localization.FORGOT_PASSWORD_ACTION}
        </Button>
      </form>
    </Form>
  );
}
