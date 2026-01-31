import { auth, type User } from "@/lib/auth";

import { ApiError } from "./error";

/**
 * Get authenticated user from request headers
 * Returns null if not authenticated
 */
export async function getAuthUser(request: Request): Promise<User | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return null;
  }

  return session.user as User;
}

/**
 * Require authentication - throws ApiError if not authenticated
 */
export async function requireAuth(request: Request): Promise<User> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new ApiError("Unauthorized", 401);
  }
  return user;
}

/**
 * Require admin role - throws ApiError if not admin
 */
export async function requireAdmin(request: Request): Promise<User> {
  const user = await requireAuth(request);
  if (!user.isAdmin) {
    throw new ApiError("Forbidden", 403);
  }
  return user;
}
