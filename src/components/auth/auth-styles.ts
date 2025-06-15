import type { AuthCardProps, AuthLocalization } from '@daveyplate/better-auth-ui';

export const authCardClassNames: AuthCardProps['classNames'] = {
  base: 'w-full max-w-md mx-auto bg-background rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/20 border',
  header: 'text-center pb-2',
  title: 'text-2xl font-bold text-foreground',
  description: 'text-sm text-muted-foreground mt-2',
  content: 'px-8 pb-8',
  footer: 'text-center space-y-3',
  footerLink:
    'text-primary font-medium hover:text-primary/80 underline decoration-primary/30 underline-offset-2',
  separator: 'relative text-center my-6 text-muted-foreground',
  form: {
    base: 'space-y-4',
    description: 'hidden',
    label: 'block text-sm font-medium text-foreground mb-1.5',
    input:
      'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background placeholder-muted-foreground transition-all hover:border-muted-foreground/50 bg-background text-foreground',
    error: 'text-sm text-destructive mt-1',
    primaryButton:
      'w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all transform hover:scale-[1.02] shadow-md dark:shadow-lg dark:shadow-black/20',
    secondaryButton:
      'w-full py-2.5 px-4 border bg-background text-foreground rounded-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
    outlineButton:
      'text-primary font-medium hover:text-primary/80 underline decoration-primary/30 underline-offset-2',
    forgotPasswordLink:
      'text-primary font-medium hover:text-primary/80 underline decoration-primary/30 underline-offset-2',
    providerButton:
      'w-full py-2.5 px-4 border rounded-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center gap-2 shadow-sm dark:shadow-md dark:shadow-black/10 bg-background',
    icon: 'w-5 h-5',
    checkbox: 'rounded border-input text-primary focus:ring-ring',
    otpInputContainer: 'flex gap-2 justify-center',
    otpInput:
      'w-12 h-12 text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background hover:border-muted-foreground/50 transition-all bg-background text-foreground',
    qrCode: 'mx-auto',
    button: 'inline-flex items-center justify-center',
  },
};

export const authCardLocalization: Partial<AuthLocalization> = {
  SIGN_IN: 'Welcome back',
  SIGN_UP: 'Create your account',
  SIGN_IN_DESCRIPTION: 'Enter your credentials to access your account',
  SIGN_UP_DESCRIPTION: 'Get started with a new account',
  SIGN_IN_LINK: 'Sign in',
  SIGN_UP_LINK: 'Sign up',
  EMAIL_LABEL: 'Email',
  EMAIL_PLACEHOLDER: 'Work email',
  PASSWORD_LABEL: 'Password',
  PASSWORD_PLACEHOLDER: 'Enter your password',
  PASSWORD_CONFIRMATION_LABEL: 'Confirm password',
  PASSWORD_CONFIRMATION_PLACEHOLDER: 'Re-enter your password',
  FORGOT_PASSWORD: 'Forgot password?',
  FORGOT_PASSWORD_TITLE: 'Reset your password',
  FORGOT_PASSWORD_DESCRIPTION: "Enter your email and we'll send you a reset link",
  RESET_PASSWORD: 'Reset password',
  RESET_PASSWORD_TITLE: 'Create new password',
  RESET_PASSWORD_DESCRIPTION: 'Enter your new password below',
  DONT_HAVE_ACCOUNT: "Don't have an account?",
  ALREADY_HAVE_ACCOUNT: 'Already have an account?',
  CONTINUE_WITH: 'Continue with',
  OR: 'or',
  SUBMIT_SIGN_IN: 'Sign in',
  SUBMIT_SIGN_UP: 'Continue',
  SUBMIT_FORGOT_PASSWORD: 'Send reset link',
  SUBMIT_RESET_PASSWORD: 'Reset password',
  MAGIC_LINK: 'Sign in with magic link',
  MAGIC_LINK_TITLE: 'Check your email',
  MAGIC_LINK_DESCRIPTION:
    "We've sent you a sign-in link. Check your inbox and click the link to continue.",
  MAGIC_LINK_INFO: '✨ Password-free sign up',
  SEND_MAGIC_LINK: 'Send magic link',
  RESEND_MAGIC_LINK: 'Resend link',
  SIGN_IN_WITH_PASSWORD: 'sign in with a password',
  SIGN_UP_WITH_PASSWORD: 'sign up with a password',
  EMAIL_VERIFICATION_TITLE: 'Verify your email',
  EMAIL_VERIFICATION_DESCRIPTION: 'Please check your email for a verification link',
  EMAIL_VERIFICATION_SUCCESS: 'Email verified successfully',
  TERMS_OF_SERVICE: 'Terms of Service',
  PRIVACY_POLICY: 'Privacy Policy',
  BY_SIGNING_UP: 'By signing up, you agree to our',
  AND: '&',
  ERROR_DEFAULT: 'An error occurred. Please try again.',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
};

// Extract just the form classes for easy use in custom forms
export const formClassNames = authCardClassNames.form!;

// Container styling for auth pages
export const authContainerClassName = authCardClassNames.base;
export const authHeaderClassName = authCardClassNames.header;
export const authTitleClassName = authCardClassNames.title;
export const authDescriptionClassName = authCardClassNames.description;
