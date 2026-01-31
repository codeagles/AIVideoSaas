"use client";

import { useMemo, useState, useTransition } from "react";
import Balancer from "react-wrap-balancer";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { creem } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import * as Icons from "@/components/ui/icons";

import { useSigninModal } from "@/hooks/use-signin-modal";
import {
  getLocalizedOnetimePackages,
  getLocalizedSubscriptionPackages,
  type CreditsDictionary,
  type LocalizedPackage,
} from "@/hooks/use-credit-packages";

interface DarkPricingProps {
  userId?: string;
  dictPrice: Record<string, string>;
  dictCredits: CreditsDictionary;
}

type PricingTab = "onetime" | "monthly" | "yearly";
type FeatureItem = {
  text: string;
  included: boolean;
};

function formatPrice(cents: number): string {
  const value = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  return `$${value}`;
}

// 定义标准功能列表（所有产品功能的并集）
function getStandardFeatures(products: LocalizedPackage[]): FeatureItem[] {
  // 收集所有产品的功能
  const allFeatures = products.flatMap(p => p.localizedFeatures);
  // 去重
  const uniqueFeatures = Array.from(new Set(allFeatures));

  return uniqueFeatures.map(feature => ({
    text: feature,
    included: false, // 默认为 false，每个产品会自己设置
  }));
}

export function DarkPricing({
  userId,
  dictPrice,
  dictCredits,
}: DarkPricingProps) {
  const t = useTranslations("PricingCards");
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

  // 计算标准功能列表（所有产品的功能并集）
  const standardFeatures = useMemo(() => {
    return getStandardFeatures(currentProducts);
  }, [currentProducts]);

  return (
    <section className="container mx-auto flex flex-col items-center text-center py-6 md:py-6">
      {/* Tab 切换 */}
      <div className="mb-6 mx-auto flex justify-center">
        <div className="inline-flex rounded-lg bg-muted p-1">
          <TabButton
            active={activeTab === "onetime"}
            onClick={() => setActiveTab("onetime")}
          >
            {t("onetime")}
          </TabButton>
          <TabButton
            active={activeTab === "monthly"}
            onClick={() => setActiveTab("monthly")}
          >
            {t("monthly")}
          </TabButton>
          <TabButton
            active={activeTab === "yearly"}
            onClick={() => setActiveTab("yearly")}
            showBadge
          >
            {t("yearly")}
            <span className="ml-1.5 rounded-md bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
              {t("off_percent")}
            </span>
          </TabButton>
        </div>
      </div>

      {/* 价格卡片 */}
      {currentProducts.length > 0 ? (
        <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-3 lg:grid-cols-3">
          {currentProducts.map((product, index) => {
            const isRecommended = index === 1 && currentProducts.length > 1;
            const isCurrent = activeProductId === product.id && hasAccess;

            // 为每个产品生成对齐后的功能列表
            const alignedFeatures = standardFeatures.map(feature => ({
              ...feature,
              included: product.localizedFeatures.some(f => f === feature.text),
            }));

            return (
              <PricingCard
                key={product.id}
                product={product}
                features={alignedFeatures}
                isRecommended={isRecommended}
                isCurrent={isCurrent}
                userId={userId}
                isPending={isPending}
                buyCreditsLabel={buyCreditsLabel}
                dictPrice={dictPrice}
                dictCredits={dictCredits}
                onCheckout={handleCheckout}
                onPortal={handlePortal}
                signInModal={signInModal}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          {t("no_products")}
        </div>
      )}
    </section>
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
        "relative rounded-md px-6 py-2.5 text-sm font-semibold transition-all duration-200",
        !showBadge && "pr-6",
        active
          ? "bg-primary text-primary-foreground shadow-md scale-105"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// ============================================
// Pricing Card Component
// ============================================

interface PricingCardProps {
  product: LocalizedPackage;
  features: FeatureItem[];
  isRecommended: boolean;
  isCurrent: boolean;
  userId?: string;
  isPending: boolean;
  buyCreditsLabel: string;
  dictPrice: Record<string, string>;
  dictCredits: CreditsDictionary;
  onCheckout: (product: LocalizedPackage) => void;
  onPortal: () => void;
  signInModal: { onOpen: () => void };
}

function PricingCard({
  product,
  features,
  isRecommended,
  isCurrent,
  userId,
  isPending,
  buyCreditsLabel,
  dictPrice,
  dictCredits,
  onCheckout,
  onPortal,
  signInModal,
}: PricingCardProps) {
  const t = useTranslations("PricingCards");

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border",
        isRecommended && "border-primary"
      )}
    >
      <div className="min-h-[150px] items-start space-y-4 bg-secondary/30 p-6">
        <p className="font-urban flex text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {product.displayName}
        </p>

        <div className="flex flex-row">
          <div className="flex items-end gap-2">
            <div className="flex text-left text-3xl font-semibold leading-6">
              {formatPrice(product.price.amount)}
            </div>
            <div className="-mb-1 ml-2 text-left text-sm font-medium text-muted-foreground">
              {product.billingPeriod ? (product.billingPeriod === "year" ? t("per_year") : t("per_month")) : ""}
            </div>
          </div>
        </div>

        {/* 显示积分数 */}
        {product.credits && (
          <div className="text-left text-sm text-muted-foreground">
            {dictCredits.title || "Credits"}: {product.credits.toLocaleString()}
          </div>
        )}

        {product.displayDescription ? (
          <div className="text-left text-sm text-muted-foreground">
            {product.displayDescription}
          </div>
        ) : null}
      </div>

      <div className="flex h-full flex-col justify-between gap-10 p-6">
        <ul className="space-y-2 text-left text-sm font-medium leading-normal">
          {features.map((feature, idx) => (
            <li className="flex items-start" key={idx}>
              {feature.included ? (
                <Icons.Check className="mr-3 h-5 w-5 shrink-0 text-primary" />
              ) : (
                <Icons.Close className="mr-3 h-5 w-5 shrink-0 text-destructive" />
              )}
              <p className={cn(feature.included ? "text-foreground" : "text-muted-foreground")}>
                {feature.text}
              </p>
            </li>
          ))}
        </ul>

        {userId ? (
          isCurrent ? (
            <button
              onClick={onPortal}
              className={cn(
                "w-full rounded-lg py-2.5 text-sm font-semibold transition-colors",
                "hover:opacity-90",
                isRecommended
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {dictPrice.manage_subscription}
            </button>
          ) : (
            <button
              disabled={isPending}
              onClick={() => onCheckout(product)}
              className={cn(
                "w-full rounded-lg py-2.5 text-sm font-semibold transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:opacity-90",
                isRecommended
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {isPending ? (
                <>
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : product.billingPeriod ? (
                dictPrice.upgrade
              ) : (
                buyCreditsLabel
              )}
            </button>
          )
        ) : (
          <button
            onClick={signInModal.onOpen}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-semibold transition-colors",
              "hover:opacity-90",
              isRecommended
                ? "bg-primary text-primary-foreground"
                : "bg-primary text-primary-foreground"
            )}
          >
            {dictPrice.signup}
          </button>
        )}
      </div>
    </div>
  );
}
