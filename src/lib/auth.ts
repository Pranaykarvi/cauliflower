import { db } from "@/db/drizzle";
import { sendEmail } from "@/helpers/sendEmail";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI } from "better-auth/plugins";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [openAPI(), admin()],
  user: {
    additionalFields: {
      user_role: {
        type: "string",
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      await sendEmail(
        user.email,
        user.name,
        token,
        "Cauliflower College Reset Password Link",
        "reset"
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      await sendEmail(
        user.email,
        user.name,
        token,
        "Cauliflower College Verification Code",
        "verify"
      );
    },
  },
  advanced: {
    cookiePrefix: "cauliflower",
    useSecureCookies: true,
  },
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
export const ctx = await auth.$context;
