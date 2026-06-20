import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DEMO_CREDENTIALS } from "./demo-credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export type UserRole =
  | "MD" | "AVP" | "Business Manager" | "Sales Executive"
  | "CRES" | "Production" | "Accounts" | "HR" | "IT Admin";

export interface DemoUser {
  id: string; name: string; email: string;
  password: string; role: UserRole; branch: string;
}

// Map DB enum values to display labels used in the session
const ROLE_DISPLAY: Record<string, string> = {
  MD: "MD", AVP: "AVP",
  BUSINESS_MANAGER: "Business Manager",
  SALES_EXECUTIVE:  "Sales Executive",
  CRES:             "CRES",
  PRODUCTION:       "Production",
  ACCOUNTS:         "Accounts",
  HR:               "HR",
  IT_ADMIN:         "IT Admin",
  CONSULTANT:       "Consultant",
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "ZAG SIGNS ERP",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const normalizedEmail = credentials.email.trim().toLowerCase();

        // 1. Try database first
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
          if (dbUser) {
            if (dbUser.status !== "ACTIVE" || !dbUser.isActive) return null;
            const match = await bcrypt.compare(credentials.password, dbUser.password);
            if (!match) return null;
            return {
              id:     dbUser.id,
              name:   dbUser.name,
              email:  dbUser.email,
              role:   ROLE_DISPLAY[dbUser.role] ?? dbUser.role,
              branch: dbUser.branch ?? "All",
            };
          }
        } catch {
          // DB unavailable — fall through to demo credentials
        }

        // 2. Fall back to demo credentials
        const found = DEMO_CREDENTIALS.find(
          u => u.email === normalizedEmail && u.password === credentials.password
        );
        if (!found) return null;
        return {
          id:     String(DEMO_CREDENTIALS.indexOf(found) + 1),
          name:   found.name,
          email:  found.email,
          role:   found.role as string,
          branch: found.branch,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id     = user.id;
        token.role   = (user as DemoUser).role;
        token.branch = (user as DemoUser).branch;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        session.user.role   = token.role   as string;
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
    maxAge:   8 * 60 * 60,
  },
};
