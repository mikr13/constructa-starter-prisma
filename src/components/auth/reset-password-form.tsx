'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
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
import { PasswordInput } from '@daveyplate/better-auth-ui';
import { cn } from '~/lib/utils';
import { formClassNames } from './auth-styles';
import type { AuthLocalization } from '@daveyplate/better-auth-ui';
import { useRouter, useSearch } from '@tanstack/react-router';
import { authClient } from '~/lib/auth-client';
import { toast } from 'sonner';

export interface ResetPasswordFormProps {
  className?: string;
  localization?: Partial<AuthLocalization>;
}

export function ResetPasswordForm({ className, localization = {} }: ResetPasswordFormProps) {
  const router = useRouter();
  const search = useSearch({ from: '/auth/$pathname' });
  const tokenChecked = useRef(false);

  const formSchema = z
    .object({
      newPassword: z
        .string()
        .min(8, {
          message: localization.PASSWORD_TOO_SHORT || 'Password must be at least 8 characters',
        })
        .max(100, {
          message: localization.PASSWORD_TOO_LONG || 'Password is too long',
        }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: localization.PASSWORDS_DO_NOT_MATCH || 'Passwords do not match',
      path: ['confirmPassword'],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (tokenChecked.current) return;
    tokenChecked.current = true;

    const token = (search as any)?.token;
    if (!token) {
      router.navigate({
        to: '/auth/sign-in',
      });
      toast.error('Invalid Link', {
        description: 'The password reset link is invalid or expired.',
      });
    }
  }, [search, router]);

  async function resetPassword({ newPassword }: z.infer<typeof formSchema>) {
    try {
      const token = (search as any)?.token;
      if (!token) return;

      await authClient.resetPassword({
        newPassword,
        token,
      });

      toast.success('Password Reset', {
        description: 'Your password has been successfully reset.',
      });

      router.navigate({
        to: '/auth/sign-in',
      });
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to reset password. The link may be expired.',
      });
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(resetPassword)}
        className={cn('grid w-full gap-6', className, formClassNames.base)}
      >
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={formClassNames.label}>
                {localization.NEW_PASSWORD || 'New Password'}
              </FormLabel>

              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  className={formClassNames.input}
                  placeholder={localization.NEW_PASSWORD_PLACEHOLDER || 'Enter your new password'}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage className={formClassNames.error} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={formClassNames.label}>
                {localization.CONFIRM_PASSWORD || 'Confirm Password'}
              </FormLabel>

              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  className={formClassNames.input}
                  placeholder={
                    localization.CONFIRM_PASSWORD_PLACEHOLDER || 'Re-enter your new password'
                  }
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage className={formClassNames.error} />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn('w-full', formClassNames.button, formClassNames.primaryButton)}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            localization.RESET_PASSWORD_ACTION || 'Reset Password'
          )}
        </Button>
      </form>
    </Form>
  );
}
