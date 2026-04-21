import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    phone?: string;
    name: string;
    role: "admin" | "instructor" | "student" | string;
    image?: string;
  }

  interface Session {
    user?: {
      id?: string;
      role?: "admin" | "instructor" | "student" | string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string;
  }
}
