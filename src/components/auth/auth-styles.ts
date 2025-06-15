import type { AuthCardProps, AuthLocalization } from '@daveyplate/better-auth-ui';

export const authCardClassNames: AuthCardProps['classNames'] = {
  base: 'w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-orange-100',
  header: 'text-center pb-2',
  title:
    'text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent',
  description: 'text-sm text-gray-600 mt-2',
  content: 'px-8 pb-8',
  footer: 'text-center space-y-3',
  footerLink:
    'text-orange-600 font-medium hover:text-orange-700 underline decoration-orange-200 underline-offset-2',
  separator: 'relative text-center my-6 text-gray-400',
  form: {
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
    otpInputContainer: 'flex gap-2 justify-center',
    otpInput:
      'w-12 h-12 text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent hover:border-gray-300 transition-all',
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
