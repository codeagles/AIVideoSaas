"use server";

import { z } from "zod";

import { userActionClient } from "@/lib/safe-action";
import {
  ensureCustomer,
  getCustomerByUserId,
  updateUserName,
} from "@/services/customer";

export const updateUserNameAction = userActionClient
  .schema(z.object({ name: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    await updateUserName(ctx.user.id, parsedInput.name);
    return { success: true };
  });

export const getCustomerAction = userActionClient
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    const customer = await getCustomerByUserId(ctx.user.id);
    return { success: true, customer };
  });

export const ensureCustomerAction = userActionClient
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    const customer = await ensureCustomer(ctx.user.id);
    return { success: true, customer };
  });
