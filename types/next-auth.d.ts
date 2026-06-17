import type { DefaultSession } from "next-auth";

// Augment next-auth types to add role and branch to the session/JWT
declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      branch: string;
    } & DefaultSession["user"];
  }
  interface User {
    role: string;
    branch: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    branch?: string;
  }
}
