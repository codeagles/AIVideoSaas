import { SubscriptionPlan } from "@/db";

import { env } from "./env.mjs";

type PlanType = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

const planMap: Record<string, PlanType> = {};
const registerPlan = (priceId: string | undefined, plan: PlanType) => {
  if (priceId) {
    planMap[priceId] = plan;
  }
};

registerPlan(env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID, SubscriptionPlan.PRO);
registerPlan(env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID, SubscriptionPlan.PRO);
registerPlan(
  env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
  SubscriptionPlan.BUSINESS
);
registerPlan(
  env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID,
  SubscriptionPlan.BUSINESS
);

export const PLANS = planMap;

export function getSubscriptionPlan(priceId: string | undefined): PlanType {
  return priceId && PLANS[priceId] ? PLANS[priceId]! : SubscriptionPlan.FREE;
}
