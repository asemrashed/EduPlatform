import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

function getPhoneLookupVariants(inputPhone: string): string[] {
  const raw = (inputPhone || "").trim();
  const clean = raw.replace(/[\s\-\(\)]/g, "");
  const digitsOnly = clean.replace(/\D/g, "");
  const variants = new Set<string>();

  if (clean) variants.add(clean);
  if (digitsOnly) variants.add(digitsOnly);
  if (digitsOnly) variants.add(`+${digitsOnly}`);

  if (digitsOnly.startsWith("8801") && digitsOnly.length === 13) {
    const local = `0${digitsOnly.slice(2)}`;
    variants.add(local);
    variants.add(`+${digitsOnly}`);
  } else if (digitsOnly.startsWith("01") && digitsOnly.length === 11) {
    const intl = `88${digitsOnly}`;
    variants.add(intl);
    variants.add(`+${intl}`);
  } else if (digitsOnly.startsWith("1") && digitsOnly.length === 10) {
    const local = `0${digitsOnly}`;
    const intl = `880${digitsOnly}`;
    variants.add(local);
    variants.add(intl);
    variants.add(`+${intl}`);
  }

  return [...variants];
}

function isValidLoginPhone(inputPhone: string): boolean {
  const clean = (inputPhone || "").replace(/[\s\-\(\)]/g, "");
  return /^01\d{9}$/.test(clean);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }
        if (!isValidLoginPhone(credentials.phone)) {
          return null;
        }

        try {
          await connectDB();

          const phoneVariants = getPhoneLookupVariants(credentials.phone);
          const user = await User.findOne({
            phone: { $in: phoneVariants },
            isActive: true,
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );
          if (!isPasswordValid) {
            return null;
          }

          await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

          const userData = {
            id: user._id.toString(),
            email: user.email,
            phone: user.phone,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            image: user.avatar,
          };

          return userData;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as { role?: unknown }).role = (user as { role?: unknown }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = (token as { role?: string }).role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
