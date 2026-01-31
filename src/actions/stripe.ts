"use server";

import { z } from "zod";

import { userActionClient } from "@/lib/safe-action";
import { createStripeSession, getMySubscription, getUserPlans } from "@/services/billing";

export const createStripeSessionAction = userActionClient
  .schema(z.object({ planId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    const result = await createStripeSession(ctx.user.id, parsedInput.planId);
    return { success: result.success, url: result.url };
  });

export const getUserPlansAction = userActionClient
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    const plan = await getUserPlans(ctx.user.id);
    return { success: true, plan };
  });

export const getMySubscriptionAction = userActionClient
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    const subscription = await getMySubscription(ctx.user.id);
    return { success: true, subscription };
  });
