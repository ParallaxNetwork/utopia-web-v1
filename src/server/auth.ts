import { PrismaAdapter } from "@auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  type DefaultSession,
  type DefaultUser,
  getServerSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { loginSchema } from "~/validation/authValidation";

import bcrypt from "bcrypt";
import { type DefaultJWT } from "@auth/core/jwt";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
    };
  }

  interface JWT extends DefaultJWT {
    user: {
      id: string;
      name?: string;
      email?: string;
      role?: string;
    };
  }

  export interface User extends DefaultUser {
    /** Define any user-specific variables here to make them available to other code inferences */
    role: string;
    // Any other attributes you need from either your User table columns or additional fields during a session callback
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    session: async ({ session, token }) => {
      console.log(session);
      if (session?.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      console.log(user);
      if (user) {
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      async authorize(credentials) {
        const parseCredentials = await loginSchema.parseAsync(credentials);
        const user = await db.user.findFirst({
          where: {
            email: parseCredentials.email,
          },
        });
        if (!user) {
          throw new Error("Invalid email");
        }
        // const passwordMatch = await bcrypt.compare(parseCredentials.password, user.password);
        // if (!passwordMatch) {
        //   throw new Error("Invalid password");
        // }
        console.log(user);
        return user;
      },
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
