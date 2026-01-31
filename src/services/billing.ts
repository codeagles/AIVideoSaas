import { customers, db } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/payment";
import { pricingData } from "@/payment/subscriptions";
import { eq } from "drizzle-orm";

export type UserSubscriptionPlan = {
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string | null;
    yearly: string | null;
  };
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: number;
  isPaid: boolean;
  interval: "month" | "year" | null;
  isCanceled?: boolean;
};

export async function createStripeSession(userId: string, planId: string) {
  const [customer] = await db
    .select({
      id: customers.id,
      plan: customers.plan,
      stripeCustomerId: customers.stripeCustomerId,
    })
    .from(customers)
    .where(eq(customers.authUserId, userId))
    .limit(1);

  const returnUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    : "/dashboard";

  if (customer?.plan && customer.plan !== "FREE") {
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId!,
      return_url: returnUrl,
    });
    return { success: true as const, url: session.url };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false as const, url: null };
  }
  const email = user.email!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    client_reference_id: userId,
    subscription_data: { metadata: { userId } },
    cancel_url: returnUrl,
    success_url: returnUrl,
    line_items: [{ price: planId, quantity: 1 }],
  });

  if (!session.url) return { success: false as const, url: null };
  return { success: true as const, url: session.url };
}

export async function getUserPlans(userId: string): Promise<UserSubscriptionPlan | undefined> {
  const [custom] = await db
    .select({
      stripeSubscriptionId: customers.stripeSubscriptionId,
      stripeCurrentPeriodEnd: customers.stripeCurrentPeriodEnd,
      stripeCustomerId: customers.stripeCustomerId,
      stripePriceId: customers.stripePriceId,
    })
    .from(customers)
    .where(eq(customers.authUserId, userId))
    .limit(1);

  if (!custom) {
    return undefined;
  }

  const isPaid =
    !!custom.stripePriceId &&
    !!custom.stripeCurrentPeriodEnd &&
    custom.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now();

  const customPlan =
    pricingData.find((plan) => plan.stripeIds.monthly === custom.stripePriceId) ??
    pricingData.find((plan) => plan.stripeIds.yearly === custom.stripePriceId);
  const plan = isPaid && customPlan ? customPlan : pricingData[0]!;

  const interval = isPaid
    ? customPlan?.stripeIds.monthly === custom.stripePriceId
      ? "month"
      : customPlan?.stripeIds.yearly === custom.stripePriceId
        ? "year"
        : null
    : null;

  let isCanceled = false;
  if (isPaid && custom.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      custom.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...plan,
    ...custom,
    stripeCurrentPeriodEnd: custom.stripeCurrentPeriodEnd?.getTime() ?? 0,
    isPaid,
    interval,
    isCanceled,
  };
}

export async function getMySubscription(userId: string) {
  const [customer] = await db
    .select({
      plan: customers.plan,
      stripeCurrentPeriodEnd: customers.stripeCurrentPeriodEnd,
    })
    .from(customers)
    .where(eq(customers.authUserId, userId))
    .limit(1);

  if (!customer) return null;
  return {
    plan: customer.plan,
    endsAt: customer.stripeCurrentPeriodEnd,
  };
}
