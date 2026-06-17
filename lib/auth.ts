import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DEMO_CREDENTIALS } from "./demo-credentials";

export type UserRole =
  | "MD"
  | "AVP"
  | "Business Manager"
  | "Sales Executive"
  | "CRES"
  | "Production"
  | "Accounts"
  | "HR"
  | "IT Admin";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branch: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "ZAG SIGNS ERP",
      credentials: {
        email:    { label: "Email",    type: "email",    placeholder: "you@zagsigns.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const normalizedEmail = credentials.email.trim().toLowerCase();
        const found = DEMO_CREDENTIALS.find(
          u => u.email === normalizedEmail && u.password === credentials.password
        );
        if (!found) return null;
        const user = { id: String(DEMO_CREDENTIALS.indexOf(found) + 1), ...found };
        return {
          id:     user.id,
          name:   user.name,
          email:  user.email,
          role:   user.role as UserRole,
          branch: user.branch,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role   = (user as DemoUser).role;
        token.branch = (user as DemoUser).branch;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role   = token.role as string;
        session.user.branch = token.branch as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  session: {
    strategy: "jwt",
    maxAge:   8 * 60 * 60, // 8-hour work session
  },
};
