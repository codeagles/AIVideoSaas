import { SubscriptionPlan, customers, db, users } from "@/db";
import { eq } from "drizzle-orm";

export async function updateUserName(userId: string, name: string) {
  await db.update(users).set({ name }).where(eq(users.id, userId));
}

export async function getCustomerByUserId(userId: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.authUserId, userId))
    .limit(1);
  return customer ?? null;
}

export async function ensureCustomer(userId: string) {
  const existing = await getCustomerByUserId(userId);
  if (existing) return existing;

  const [created] = await db
    .insert(customers)
    .values({
      authUserId: userId,
      plan: SubscriptionPlan.FREE,
    })
    .returning();

  return created ?? null;
}
