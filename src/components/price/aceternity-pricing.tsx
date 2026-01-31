"use client";

import { useMemo, useState, useTransition } from "react";
import Balancer from "react-wrap-balancer";
import { IconCheck } from "@tabler/icons-react";
import { motion } from "motion/react";

import { creem } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useSigninModal } from "@/hooks/use-signin-modal";
import {
  getLocalizedOnetimePackages,
  getLocalizedSubscriptionPackages,
  type CreditsDictionary,
  type LocalizedPackage,
} from "@/hooks/use-credit-packages";

interface AceternityPricingProps {
  userId?: string;
  dictPrice: Record<string, string>;
  dictCredits: CreditsDictionary;
}

type PricingTab = "onetime" | "monthly" | "yearly";

function formatPrice(cents: number): string {
  const value = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  return `$${value}`;
}

export function AceternityPricing({
  userId,
  dictPrice,
  dictCredits,
}: AceternityPricingProps) {
  const [activeTab, setActiveTab] = useState<PricingTab>("onetime");
  const [hasAccess, setHasAccess] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const signInModal = useSigninModal();

  // 组织产品数据
  const allSubscriptionProducts = useMemo(
    () =>
      getLocalizedSubscriptionPackages(dictCredits).sort(
        (a, b) => a.credits - b.credits
      ),
    [dictCredits]
  );

  const onetimeProducts = useMemo(
    () =>
      getLocalizedOnetimePackages(dictCredits).sort(
        (a, b) => a.credits - b.credits
      ),
    [dictCredits]
  );

  const monthlyProducts = useMemo(
    () => allSubscriptionProducts.filter((p) => p.billingPeriod === "month"),
    [allSubscriptionProducts]
  );

  const yearlyProducts = useMemo(
    () => allSubscriptionProducts.filter((p) => p.billingPeriod === "year"),
    [allSubscriptionProducts]
  );

  const handleCheckout = (product: LocalizedPackage) => {
    if (!userId) {
      signInModal.onOpen();
      return;
    }

    startTransition(async () => {
      const origin = window.location.origin;
      const { data, error } = await creem.createCheckout({
        productId: product.id,
        successUrl: `${origin}/my-creations?payment=success`,
        metadata: {
          plan: product.id,
        },
      });

      if (error) {
        toast.error("Checkout error", {
          description: error.message ?? "Failed to create checkout session.",
        });
        return;
      }

      if (!data || !("url" in data) || !data.url) {
        toast.error("Checkout error", {
          description: "Missing checkout URL from Creem.",
        });
        return;
      }

      window.location.href = data.url;
    });
  };

  const handlePortal = async () => {
    const { data, error } = await creem.createPortal();
    if (error) {
      toast.error("Portal error", {
        description: error.message ?? "Failed to open customer portal.",
      });
      return;
    }

    if (!data || !("url" in data) || !data.url) {
      toast.error("Portal error", {
        description: "Missing portal URL from Creem.",
      });
      return;
    }

    window.location.href = data.url;
  };

  // 获取当前 tab 的产品
  const getCurrentProducts = () => {
    switch (activeTab) {
      case "onetime":
        return onetimeProducts;
      case "monthly":
        return monthlyProducts;
      case "yearly":
        return yearlyProducts;
      default:
        return [];
    }
  };

  const currentProducts = getCurrentProducts();
  const buyCreditsLabel = dictCredits.buy_credits ?? "Buy Credits";

  return (
    <main className="flex min-h-[60vh] flex-col bg-background">
      <div className="relative mx-auto my-12 flex w-full max-w-7xl flex-1 flex-col px-4 py-0 sm:my-10 md:my-20 lg:px-4">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="pt-4 text-center text-2xl font-bold tracking-tight text-foreground md:text-4xl">
            {dictPrice.slogan || "Choose Your Plan"}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-center text-base text-muted-foreground">
            <Balancer>
              选择适合您的积分方案，灵活满足不同需求
            </Balancer>
          </p>
        </motion.div>

        {/* Tab 切换 */}
        <div className="my-8 flex justify-center">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <TabButton
              active={activeTab === "onetime"}
              onClick={() => setActiveTab("onetime")}
            >
              一次性积分包
            </TabButton>
            <TabButton
              active={activeTab === "monthly"}
              onClick={() => setActiveTab("monthly")}
            >
              按月订阅
            </TabButton>
            <TabButton
              active={activeTab === "yearly"}
              onClick={() => setActiveTab("yearly")}
              showBadge
            >
              按年订阅
            </TabButton>
          </div>
        </div>

        {/* 价格卡片 */}
        <div className="py-4 md:py-10">
          {currentProducts.length > 0 ? (
            <div className="grid w-full grid-cols-1 gap-2 p-4 sm:gap-3 md:grid-cols-2 md:gap-4 md:p-8 lg:grid-cols-3">
              {currentProducts.map((product, index) => {
                const isRecommended = index === 1 && currentProducts.length > 1;
                const isCurrent = activeProductId === product.id && hasAccess;

                return (
                  <PricingCard
                    key={product.id}
                    product={product}
                    isRecommended={isRecommended}
                    isCurrent={isCurrent}
                    userId={userId}
                    isPending={isPending}
                    buyCreditsLabel={buyCreditsLabel}
                    dictPrice={dictPrice}
                    onCheckout={handleCheckout}
                    onPortal={handlePortal}
                    signInModal={signInModal}
                    index={index}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              暂无可用产品
            </div>
          )}
        </div>

        {/* 底部联系信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground">
            <Balancer>
              Email{" "}
              <a
                className="font-medium text-primary hover:underline"
                href="mailto:support@videofly.app"
              >
                support@videofly.app
              </a>{" "}
              {dictPrice.contact}
              <br />
              <strong>{dictPrice.contact_2}</strong>
            </Balancer>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

// ============================================
// Tab Button Component
// ============================================

interface TabButtonProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  showBadge?: boolean;
}

function TabButton({ active, children, onClick, showBadge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-md px-6 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-background",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground"
      )}
    >
      {children}
      {showBadge && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
          40%
        </span>
      )}
    </button>
  );
}

// ============================================
// Pricing Card Component
// ============================================

interface PricingCardProps {
  product: LocalizedPackage;
  isRecommended: boolean;
  isCurrent: boolean;
  userId?: string;
  isPending: boolean;
  buyCreditsLabel: string;
  dictPrice: Record<string, string>;
  onCheckout: (product: LocalizedPackage) => void;
  onPortal: () => void;
  signInModal: { onOpen: () => void };
  index: number;
}

function PricingCard({
  product,
  isRecommended,
  isCurrent,
  userId,
  isPending,
  buyCreditsLabel,
  dictPrice,
  onCheckout,
  onPortal,
  signInModal,
  index,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div
        className={cn(
          "relative rounded-xl bg-card p-6 transition-all duration-300",
          "hover:shadow-lg",
          isRecommended &&
            "border-2 border-primary shadow-xl shadow-primary/20"
        )}
      >
        {isRecommended && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
              推荐
            </span>
          </div>
        )}

        <div className="flex h-full flex-col gap-4">
          {/* 标题和描述 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {product.displayName}
            </h3>
            {product.displayDescription && (
              <p className="mt-1 text-sm text-muted-foreground">
                {product.displayDescription}
              </p>
            )}
          </div>

          {/* 价格 */}
          <div className="my-2">
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(product.price.amount)}
              </span>
              {product.billingPeriod && (
                <span className="text-muted-foreground mb-1 text-sm">
                  /{product.billingPeriod === "year" ? "年" : "月"}
                </span>
              )}
            </div>
          </div>

          {/* CTA 按钮 */}
          {userId ? (
            isCurrent ? (
              <Button
                variant={isRecommended ? "default" : "outline"}
                className="w-full"
                onClick={onPortal}
              >
                {dictPrice.manage_subscription}
              </Button>
            ) : (
              <Button
                variant={isRecommended ? "default" : "outline"}
                className={cn(
                  "w-full transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]"
                )}
                disabled={isPending}
                onClick={() => onCheckout(product)}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading...
                  </span>
                ) : product.billingPeriod ? (
                  dictPrice.upgrade
                ) : (
                  buyCreditsLabel
                )}
              </Button>
            )
          ) : (
            <Button
              variant={isRecommended ? "default" : "outline"}
              className={cn(
                "w-full transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
              onClick={signInModal.onOpen}
            >
              {dictPrice.signup}
            </Button>
          )}

          {/* 功能列表 */}
          <div className="mt-4 flex-1">
            <ul className="space-y-3">
              {product.localizedFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <IconCheck className="h-3 w-3 [stroke-width:3px] text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
