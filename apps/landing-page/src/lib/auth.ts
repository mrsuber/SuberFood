import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/profile/setup",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginCount: user.loginCount + 1,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // On initial sign in, set the user ID and fetch role
      if (user) {
        token.id = user.id;
        // Fetch role from database for new logins
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
        // Set last role check timestamp
        token.roleCheckedAt = Date.now();
      }

      // Refresh role from database only every 5 minutes to reduce DB load
      // This ensures role changes are picked up without querying on every request
      const fiveMinutes = 5 * 60 * 1000;
      const shouldRefreshRole =
        token.id &&
        (!token.roleCheckedAt || Date.now() - (token.roleCheckedAt as number) > fiveMinutes);

      if (shouldRefreshRole) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.roleCheckedAt = Date.now();
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Update login stats for OAuth users
      if (account?.provider !== "credentials") {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginCount: { increment: 1 },
          },
        });
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // If user just signed in, check if they're an admin
      // This handles redirects after OAuth signin
      if (url === baseUrl || url === `${baseUrl}/`) {
        // Try to get user from database to check role
        // Note: This is called during OAuth flow, so we need to extract user info
        const urlObj = new URL(url);

        // For OAuth callbacks, NextAuth handles the redirect
        // We'll let the normal flow continue and handle admin redirect client-side
        return url;
      }

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn(message) {
      // Log sign-in event
      console.log("User signed in:", message.user.email);
    },
  },
};
