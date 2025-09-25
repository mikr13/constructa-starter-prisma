import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink } from 'better-auth/plugins';
import { reactStartCookies } from 'better-auth/react-start';
import { db } from '~/db/client';
import { sendEmail } from './email';

const isEmailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION === 'true';

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  plugins: [
    reactStartCookies(),
    magicLink({
      async sendMagicLink({ email, url }) {
        await sendEmail({
          to: email,
          subject: 'Sign in to Constructa',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Sign in to Constructa</h2>
              <p>Click the button below to sign in. This link will expire in 5 minutes.</p>
              <a href="${url}" style="display:inline-block;padding:12px 24px;background-color:#4F46E5;color:white;text-decoration:none;border-radius:6px;">Sign In</a>
              <p style="margin-top:20px;color:#666;">If the button above does not work, copy and paste the following link into your browser:</p>
              <p style="word-break:break-all;color:#666;">${url}</p>
              <p style="margin-top:30px;color:#999;font-size:14px;">If you did not request this email, you can safely ignore it.</p>
            </div>
          `,
        });
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: isEmailVerificationEnabled,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Reset your password',
          html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
							<h2>Reset Your Password</h2>
							<p>You requested to reset your password. Click the button below to continue:</p>
							<a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
							<p style="margin-top: 20px; color: #666;">Or copy and paste this link into your browser:</p>
							<p style="word-break: break-all; color: #666;">${url}</p>
							<p style="margin-top: 30px; color: #999; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
						</div>
					`,
        });
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw error; // We want password reset failures to propagate
      }
    },
  },
  emailVerification: {
    // Only send verification emails if verification is enabled
    sendOnSignUp: isEmailVerificationEnabled,
    autoSignInAfterVerification: true,
    sendVerificationEmail: isEmailVerificationEnabled
      ? async ({ user, url }) => {
          try {
            await sendEmail({
              to: user.email as string,
              subject: 'Verify your email address',
              html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
							<h2>Verify your email address</h2>
							<p>Please click the button below to verify your email address:</p>
							<a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a>
							<p style="margin-top: 20px; color: #666;">Or copy and paste this link into your browser:</p>
							<p style="word-break: break-all; color: #666;">${url}</p>
							<p style="margin-top: 30px; color: #999; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
						</div>
					`,
            });
          } catch (error) {
            console.error('Failed to send verification email:', error);
            // Don't throw here to prevent sign-up from failing
          }
        }
      : undefined,
  },
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
  // 2️⃣  Enable in-memory rate limiting for integration tests and local dev
  rateLimit: {
    enabled: true,
    window: 60, // seconds
    max: 10, // allow 10 requests per window (tests expect 429 on the 11th)
  },
});

export default auth;
