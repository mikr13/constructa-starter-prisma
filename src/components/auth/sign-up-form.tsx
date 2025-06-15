'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { BetterFetchOption } from 'better-auth/react';
import { Loader2 } from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Link } from '@tanstack/react-router';

import { useCaptcha } from '@daveyplate/better-auth-ui';
import { useIsHydrated } from '@daveyplate/better-auth-ui';
import { useOnSuccessTransition } from '@daveyplate/better-auth-ui';
import { AuthUIContext } from '@daveyplate/better-auth-ui';
import { getLocalizedError, getPasswordSchema, getSearchParam } from '@daveyplate/better-auth-ui';
import { cn } from '~/lib/utils';
import type { AuthLocalization } from '@daveyplate/better-auth-ui';
import type { PasswordValidation } from '@daveyplate/better-auth-ui';
import { Captcha } from '@daveyplate/better-auth-ui';
import { PasswordInput } from '@daveyplate/better-auth-ui';
import { GoogleIcon, GitHubIcon } from '@daveyplate/better-auth-ui';
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

export interface SignUpFormProps {
  className?: string;
  callbackURL?: string;
  isSubmitting?: boolean;
  localization?: Partial<AuthLocalization>;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
  passwordValidation?: PasswordValidation;
}

export function SignUpForm({
  className,
  callbackURL,
  isSubmitting,
  localization = {},
  redirectTo,
  setIsSubmitting,
  passwordValidation,
}: SignUpFormProps) {
  const isHydrated = useIsHydrated();
  const { captchaRef, getCaptchaHeaders } = useCaptcha({ localization });
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);

  const {
    additionalFields,
    authClient,
    basePath,
    baseURL,
    credentials,
    emailVerification,
    localization: contextLocalization,
    nameRequired,
    persistClient,
    redirectTo: contextRedirectTo,
    signUp: signUpOptions,
    viewPaths,
    navigate,
    toast,
  } = useContext(AuthUIContext);

  const confirmPasswordEnabled = credentials?.confirmPassword;
  const usernameEnabled = credentials?.username;
  const contextPasswordValidation = credentials?.passwordValidation;
  const signUpFields = signUpOptions?.fields;

  const mergedLocalization = { ...contextLocalization, ...localization };
  const mergedPasswordValidation = { ...contextPasswordValidation, ...passwordValidation };

  const getRedirectTo = useCallback(
    () => redirectTo || getSearchParam('redirectTo') || contextRedirectTo,
    [redirectTo, contextRedirectTo]
  );

  const getCallbackURL = useCallback(
    () =>
      `${baseURL}${
        callbackURL ||
        (persistClient
          ? `${basePath}/${viewPaths.CALLBACK}?redirectTo=${getRedirectTo()}`
          : getRedirectTo())
      }`,
    [callbackURL, persistClient, basePath, viewPaths, baseURL, getRedirectTo]
  );

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  // Create the base schema for standard fields
  const schemaFields: Record<string, z.ZodTypeAny> = {
    email: z
      .string()
      .min(1, {
        message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_REQUIRED}`,
      })
      .email({
        message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_INVALID}`,
      }),
    password: getPasswordSchema(mergedPasswordValidation, mergedLocalization),
  };

  // Add confirmPassword field if enabled
  if (confirmPasswordEnabled) {
    schemaFields.confirmPassword = getPasswordSchema(mergedPasswordValidation, {
      PASSWORD_REQUIRED: mergedLocalization.CONFIRM_PASSWORD_REQUIRED,
      PASSWORD_TOO_SHORT: mergedLocalization.PASSWORD_TOO_SHORT,
      PASSWORD_TOO_LONG: mergedLocalization.PASSWORD_TOO_LONG,
      INVALID_PASSWORD: mergedLocalization.INVALID_PASSWORD,
    });
  }

  // Add name field if required or included in signUpFields
  if (signUpFields?.includes('name')) {
    schemaFields.name = nameRequired
      ? z.string().min(1, {
          message: `${mergedLocalization.NAME} ${mergedLocalization.IS_REQUIRED}`,
        })
      : z.string().optional();
  }

  // Add username field if enabled
  if (usernameEnabled) {
    schemaFields.username = z.string().min(1, {
      message: `${mergedLocalization.USERNAME} ${mergedLocalization.IS_REQUIRED}`,
    });
  }

  // Add additional fields from signUpFields
  if (signUpFields) {
    for (const field of signUpFields) {
      if (field === 'name' || field === 'image') continue; // Skip already handled fields

      const additionalField = additionalFields?.[field];
      if (!additionalField) continue;

      let fieldSchema: z.ZodTypeAny;

      // Create the appropriate schema based on field type
      if (additionalField.type === 'number') {
        fieldSchema = additionalField.required
          ? z.preprocess(
              (val) => (!val ? undefined : Number(val)),
              z.number({
                required_error: `${additionalField.label} ${mergedLocalization.IS_REQUIRED}`,
                invalid_type_error: `${additionalField.label} ${mergedLocalization.IS_INVALID}`,
              })
            )
          : z.coerce
              .number({
                invalid_type_error: `${additionalField.label} ${mergedLocalization.IS_INVALID}`,
              })
              .optional();
      } else if (additionalField.type === 'boolean') {
        fieldSchema = additionalField.required
          ? z.coerce
              .boolean({
                required_error: `${additionalField.label} ${mergedLocalization.IS_REQUIRED}`,
                invalid_type_error: `${additionalField.label} ${mergedLocalization.IS_INVALID}`,
              })
              .refine((val) => val === true, {
                message: `${additionalField.label} ${mergedLocalization.IS_REQUIRED}`,
              })
          : z.coerce
              .boolean({
                invalid_type_error: `${additionalField.label} ${mergedLocalization.IS_INVALID}`,
              })
              .optional();
      } else {
        fieldSchema = additionalField.required
          ? z.string().min(1, `${additionalField.label} ${mergedLocalization.IS_REQUIRED}`)
          : z.string().optional();
      }

      schemaFields[field] = fieldSchema;
    }
  }

  const formSchema = z.object(schemaFields).refine(
    (data) => {
      // Skip validation if confirmPassword is not enabled
      if (!confirmPasswordEnabled) return true;
      return data.password === data.confirmPassword;
    },
    {
      message: mergedLocalization.PASSWORDS_DO_NOT_MATCH!,
      path: ['confirmPassword'],
    }
  );

  // Create default values for the form
  const defaultValues: Record<string, unknown> = {
    email: '',
    password: '',
    ...(confirmPasswordEnabled && { confirmPassword: '' }),
    ...(signUpFields?.includes('name') ? { name: '' } : {}),
    ...(usernameEnabled ? { username: '' } : {}),
  };

  // Add default values for additional fields
  if (signUpFields) {
    for (const field of signUpFields) {
      if (field === 'name' || field === 'image') continue;
      const additionalField = additionalFields?.[field];
      if (!additionalField) continue;

      defaultValues[field] = additionalField.type === 'boolean' ? false : '';
    }
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const isLoading =
    isSubmitting || form.formState.isSubmitting || transitionPending || isLoadingSocial;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending || isLoadingSocial);
  }, [form.formState.isSubmitting, transitionPending, isLoadingSocial, setIsSubmitting]);

  async function signUp({
    email,
    password,
    name,
    username,
    confirmPassword,
    ...additionalFieldValues
  }: z.infer<typeof formSchema>) {
    try {
      // Validate additional fields with custom validators if provided
      for (const [field, value] of Object.entries(additionalFieldValues)) {
        const additionalField = additionalFields?.[field];
        if (!additionalField?.validate) continue;

        if (typeof value === 'string' && !(await additionalField.validate(value))) {
          form.setError(field, {
            message: `${additionalField.label} ${mergedLocalization.IS_INVALID}`,
          });
          return;
        }
      }

      const fetchOptions: BetterFetchOption = {
        throw: true,
        headers: await getCaptchaHeaders('/sign-up/email'),
      };

      const data = await authClient.signUp.email({
        email,
        password,
        name: name || '',
        ...(username !== undefined && { username }),
        ...additionalFieldValues,
        ...(emailVerification && persistClient && { callbackURL: getCallbackURL() }),
        fetchOptions,
      });

      if ('token' in data && data.token) {
        await onSuccess();
      } else {
        navigate(`${basePath}/${viewPaths.SIGN_IN}${window.location.search}`);
        toast({
          variant: 'success',
          message: mergedLocalization.SIGN_UP_EMAIL!,
        });
      }
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization: mergedLocalization }),
      });

      form.resetField('password');
      if (confirmPasswordEnabled) {
        form.resetField('confirmPassword');
      }
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
        message: getLocalizedError({ error, localization: mergedLocalization }),
      });
      setIsLoadingSocial(false);
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Social auth - Google & GitHub */}
      <div className="flex gap-4 justify-center">
        <button
          type="button"
          onClick={() => handleSocialSignIn('google')}
          disabled={isLoading}
          className={cn(
            formClassNames.providerButton,
            'flex-col gap-1 px-6 py-4 min-w-[100px] flex-1 max-w-[150px]',
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

        <button
          type="button"
          onClick={() => handleSocialSignIn('github')}
          disabled={isLoading}
          className={cn(
            formClassNames.providerButton,
            'flex-col gap-1 px-6 py-4 min-w-[100px] flex-1 max-w-[150px]',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoadingSocial ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <GitHubIcon className="w-6 h-6" />
          )}
          <span className="text-sm">GitHub</span>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <hr className="flex-1 border" />
        <span className="text-sm text-muted-foreground">or</span>
        <hr className="flex-1 border" />
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(signUp)}
          noValidate={isHydrated}
          className={cn(formClassNames.base, className)}
        >
          {signUpFields?.includes('name') && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formClassNames.label}>{mergedLocalization.NAME}</FormLabel>

                  <FormControl>
                    <Input
                      className={formClassNames.input}
                      placeholder={mergedLocalization.NAME_PLACEHOLDER}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className={formClassNames.error} />
                </FormItem>
              )}
            />
          )}

          {usernameEnabled && (
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formClassNames.label}>
                    {mergedLocalization.USERNAME}
                  </FormLabel>

                  <FormControl>
                    <Input
                      className={formClassNames.input}
                      placeholder={mergedLocalization.USERNAME_PLACEHOLDER}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className={formClassNames.error} />
                </FormItem>
              )}
            />
          )}

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={formClassNames.label}>
                  {mergedLocalization.PASSWORD}
                </FormLabel>

                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    className={formClassNames.input}
                    placeholder={mergedLocalization.PASSWORD_PLACEHOLDER}
                    disabled={isLoading}
                    enableToggle
                    {...field}
                  />
                </FormControl>

                <FormMessage className={formClassNames.error} />
              </FormItem>
            )}
          />

          {confirmPasswordEnabled && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formClassNames.label}>
                    {mergedLocalization.CONFIRM_PASSWORD}
                  </FormLabel>

                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      className={formClassNames.input}
                      placeholder={mergedLocalization.CONFIRM_PASSWORD_PLACEHOLDER}
                      disabled={isLoading}
                      enableToggle
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className={formClassNames.error} />
                </FormItem>
              )}
            />
          )}

          {signUpFields
            ?.filter((field) => field !== 'name' && field !== 'image')
            .map((field) => {
              const additionalField = additionalFields?.[field];
              if (!additionalField) {
                console.error(`Additional field ${field} not found`);
                return null;
              }

              return additionalField.type === 'boolean' ? (
                <FormField
                  key={field}
                  control={form.control}
                  name={field}
                  render={({ field: formField }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          className={formClassNames.checkbox}
                          checked={formField.value as boolean}
                          onCheckedChange={formField.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>

                      <FormLabel className="text-sm font-normal cursor-pointer">
                        {additionalField.label}
                      </FormLabel>

                      <FormMessage className={formClassNames.error} />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  key={field}
                  control={form.control}
                  name={field}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel className={formClassNames.label}>
                        {additionalField.label}
                      </FormLabel>

                      <FormControl>
                        <Input
                          className={formClassNames.input}
                          type={additionalField.type === 'number' ? 'number' : 'text'}
                          placeholder={
                            additionalField.placeholder ||
                            (typeof additionalField.label === 'string' ? additionalField.label : '')
                          }
                          disabled={isLoading}
                          {...formField}
                        />
                      </FormControl>

                      <FormMessage className={formClassNames.error} />
                    </FormItem>
                  )}
                />
              );
            })}

          <Captcha ref={captchaRef} localization={mergedLocalization} action="/sign-up/email" />

          <Button
            type="submit"
            disabled={isLoading}
            className={cn(formClassNames.button, formClassNames.primaryButton)}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : mergedLocalization.SIGN_UP_ACTION}
          </Button>
        </form>
      </Form>

      {/* Sign in link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          to={
            `${basePath}/${viewPaths.SIGN_IN}${typeof window !== 'undefined' ? window.location.search : ''}` as any
          }
          className={formClassNames.outlineButton}
        >
          {mergedLocalization.SIGN_IN_LINK || 'Sign in'}
        </Link>
      </p>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground">
        By signing up, you agree to our{' '}
        <Link to="/terms" as any className={formClassNames.outlineButton}>
          Terms of Service
        </Link>{' '}
        &amp;{' '}
        <Link to="/privacy" as any className={formClassNames.outlineButton}>
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
