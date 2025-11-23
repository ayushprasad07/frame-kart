// src/app/api/auth/[...nextauth]/options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD =
  "$2b$10$xkxtHycVS9PLtUGUEbNU/.2xrMK2Ocdw5y3vXhj0s0A4DP4tKWhk."; // hashed

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: any) {
        const { username, password } = credentials;

        // Check username
        if (username !== DEFAULT_ADMIN_USERNAME) {
          throw new Error("Invalid credentials");
        }

        // Check hashed password
        const isValid = await bcrypt.compare(password, DEFAULT_ADMIN_PASSWORD);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // SUCCESS → return admin user data (include `id` to satisfy NextAuth's DefaultUser)
        return {
          id: "default-admin-id",
          _id: "admin",
          username: DEFAULT_ADMIN_USERNAME,
          role: "admin",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      session.user._id = token._id as string;
      session.user.username = token.username as string;
      session.user.role = token.role as string;
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
