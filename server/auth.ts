import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { reactStartCookies } from "better-auth/react-start"
import { db } from "./db"

// Email verification is disabled by default for development
const enableEmailVerification = process.env.ENABLE_EMAIL_VERIFICATION === 'true'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: enableEmailVerification,
  },
  ...(enableEmailVerification && {
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendEmail: async ({ user, url, token }: { user: any, url: any, token: any }) => {
        console.log(`Email verification for ${user.email}:`);
        console.log(`Verification URL: ${url}`);
        console.log(`Token: ${token}`);
        // In production, replace this with actual email sending
        // You can use services like Resend, SendGrid, etc.
      },
    },
  }),
  plugins: [reactStartCookies()],
  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID && {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    }),
  },
})