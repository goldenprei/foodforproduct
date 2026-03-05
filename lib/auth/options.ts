import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

import { prisma } from "@/lib/db/prisma";
import { env, getAdminEmailSet } from "@/lib/env";

const adminEmails = getAdminEmailSet();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET
    })
  ],
  pages: {
    signIn: "/admin/login"
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      return adminEmails.has(user.email.toLowerCase());
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        });
        session.user.role = dbUser?.role ?? "OWNER";
      }
      return session;
    }
  },
  session: {
    strategy: "database"
  }
};
