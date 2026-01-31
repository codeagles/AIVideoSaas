import { createSafeActionClient } from "next-safe-action";

import { getServerSession } from "@/lib/auth";

export const actionClient = createSafeActionClient({
  handleServerError: (e) => {
    if (e instanceof Error) {
      return { success: false, error: e.message };
    }
    return { success: false, error: "Unknown error" };
  },
});

export const userActionClient = actionClient.use(async ({ next }) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return next({ ctx: { user: session.user } });
});

export const adminActionClient = userActionClient.use(async ({ next, ctx }) => {
  if (!ctx.user?.isAdmin) {
    throw new Error("Forbidden");
  }
  return next({ ctx });
});
