// Auth configuration that can be accessed on the client side
export const authConfig = {
  // Email verification is disabled by default for development
  emailVerificationEnabled: import.meta.env.ENABLE_EMAIL_VERIFICATION === 'true'
}