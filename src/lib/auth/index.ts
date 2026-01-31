// Server-only exports - these should only be imported in server components
// For client components, import from "@/lib/auth/client" instead

import type { User } from "./auth";

// Re-export auth instance (server-only)
export { auth, type Session, type User } from "./auth";

/**
 * Get current user session on the server side (RSC / Server Actions)
 * Must be called from App Router (uses next/headers)
 * @see https://www.better-auth.com/docs/integrations/next
 */
export async function getCurrentUser(): Promise<User | null> {
  // Dynamic import to avoid issues with pages directory
  const { headers } = await import("next/headers");
  const { auth } = await import("./auth");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (session?.user as User) ?? null;
}

/**
 * Get current session on the server side
 * Must be called from App Router (uses next/headers)
 */
export async function getServerSession() {
  const { headers } = await import("next/headers");
  const { auth } = await import("./auth");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Server-side auth guard - redirects if not logged in
 * Must be called from App Router
 */
export async function requireAuth(redirectTo = "/login"): Promise<User> {
  const { redirect } = await import("next/navigation");
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user as User;
}

/**
 * Server-side admin guard - redirects if not admin
 * Must be called from App Router
 */
export async function requireAdmin(redirectTo = "/"): Promise<User> {
  const { redirect } = await import("next/navigation");
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    redirect(redirectTo);
  }
  return user as User;
}
