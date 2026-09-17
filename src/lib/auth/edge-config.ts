import type { NextAuthConfig } from "next-auth";
import type { UserRole, UserStatus } from "@/generated/prisma/enums";

/**
 * Edge-safe Auth.js config: no Prisma Client or bcrypt imports, so this can
 * be bundled into middleware (which runs on the Edge runtime). The full
 * config with the Credentials provider lives in src/auth.ts and is only
 * imported by Node-runtime route handlers, server components, and actions.
 */
declare module "next-auth" {
  interface User {
    role: UserRole;
    status: UserStatus;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      status: UserStatus;
    };
  }
}

type AppJWT = {
  id: string;
  role: UserRole;
  status: UserStatus;
};

export const authEdgeConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as typeof token & Partial<AppJWT>;
      if (user) {
        appToken.id = user.id as string;
        appToken.role = user.role;
        appToken.status = user.status;
      }
      return appToken;
    },
    async session({ session, token }) {
      const appToken = token as typeof token & AppJWT;
      session.user.id = appToken.id;
      session.user.role = appToken.role;
      session.user.status = appToken.status;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
