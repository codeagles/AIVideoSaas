import type Stripe from "stripe";

import { SubscriptionPlan, customers, db } from "@/db";
import { eq } from "drizzle-orm";

import { stripe } from ".";
import { getSubscriptionPlan } from "./plans";

export async function handleEvent(event: Stripe.DiscriminatedEvent) {
  const session = event.data.object as Stripe.Checkout.Session;
  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    const { userId } = subscription.metadata;
    if (!userId) {
      throw new Error("Missing user id");
    }
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.authUserId, userId))
      .limit(1);

    if (customer) {
      return await db
        .update(customers)
        .set({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
        })
        .where(eq(customers.id, customer.id));
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    const { userId } = subscription.metadata;
    if (!userId) {
      throw new Error("Missing user id");
    }
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.authUserId, userId))
      .limit(1);

    if (customer) {
      const priceId = subscription.items.data[0]?.price.id;
      if (!priceId) {
        return;
      }

      const plan = getSubscriptionPlan(priceId);
      return await db
        .update(customers)
        .set({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
          plan: plan || SubscriptionPlan.FREE,
        })
        .where(eq(customers.id, customer.id));
    }
  }
  if (event.type === "customer.subscription.updated") {
    console.log("event.type: ", event.type);
  }
  console.log("✅ Stripe Webhook Processed");
}
