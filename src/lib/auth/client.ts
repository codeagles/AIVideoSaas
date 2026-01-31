"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { creemClient } from "@creem_io/better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [magicLinkClient(), creemClient()],
});

// Export commonly used methods
export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  creem,
} = authClient;

// Re-export types
export type AuthClient = typeof authClient;

// User type for client components
// This matches the server-side User type structure
export type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isAdmin?: boolean | null;
};
