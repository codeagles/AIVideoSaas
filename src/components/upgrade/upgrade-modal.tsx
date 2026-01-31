/**
 * Upgrade Modal
 *
 * 升级弹窗组件
 * - 显示定价信息
 * - 支持三种类型：一次性积分包、按月订阅、按年订阅
 * - 根据 openModal 传入的 reason 显示不同的提示信息
 */

"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { cn } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DarkPricing } from "@/components/price/dark-pricing";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useCredits } from "@/stores/credits-store";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";

function UpgradeModalContent() {
  const t = useTranslations("UpgradeModal");
  const tPricing = useTranslations("PricingCards");
  const tCredits = useTranslations("Credits");
  const { isOpen, closeModal, reason, requiredCredits } = useUpgradeModal();
  const [userId, setUserId] = useState<string | undefined>();

  // 获取当前用户
  useEffect(() => {
    authClient.getSession().then((session) => {
      setUserId(session?.data?.user?.id);
    });
  }, []);

  // 构建 dictPrice
  const dictPrice: Record<string, string> = {
    pricing: tPricing("pricing"),
    slogan: tPricing("slogan"),
    onetime: tPricing("onetime"),
    monthly: tPricing("monthly"),
    yearly: tPricing("yearly"),
    off_percent: tPricing("off_percent"),
    no_products: tPricing("no_products"),
    per_year: tPricing("per_year"),
    per_month: tPricing("per_month"),
    signup: tPricing("signup"),
    manage_subscription: tPricing("manage_subscription"),
    upgrade: tPricing("upgrade"),
  };

  // 构建 dictCredits
  const dictCredits = {
    title: tCredits("title"),
    buy_credits: tCredits("buyCredits"),
    packages: {
      starter: {
        name: tCredits("packages.starter.name"),
        description: tCredits("packages.starter.description"),
      },
      standard: {
        name: tCredits("packages.standard.name"),
        description: tCredits("packages.standard.description"),
      },
      pro: {
        name: tCredits("packages.pro.name"),
        description: tCredits("packages.pro.description"),
      },
      team: {
        name: tCredits("packages.team.name"),
        description: tCredits("packages.team.description"),
      },
    },
    features: {
      hd_videos: tCredits("features.hd_videos"),
      fast_generation: tCredits("features.fast_generation"),
      no_watermark: tCredits("features.no_watermark"),
      commercial_use: tCredits("features.commercial_use"),
      priority_support: tCredits("features.priority_support"),
      api_access: tCredits("features.api_access"),
      custom_models: tCredits("features.custom_models"),
    },
  };

  // 根据 reason 显示不同的标题
  const getTitle = () => {
    switch (reason) {
      case "insufficient_credits":
        return t("insufficient_credits_title");
      case "expired":
        return t("expired_title");
      default:
        return t("default_title");
    }
  };

  // 根据 reason 显示不同的描述
  const getDescription = () => {
    switch (reason) {
      case "insufficient_credits":
        return t("insufficient_credits_description", { credits: requiredCredits });
      case "expired":
        return t("expired_description");
      default:
        return t("default_description");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        className="!p-0 overflow-hidden max-h-[90vh]"
        style={{
          width: '100%',
          maxWidth: '880px',
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-background"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* 标题区域 */}
        <div className="px-4 sm:px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl sm:text-2xl">{getTitle()}</DialogTitle>
          {getDescription() && (
            <p className="text-sm text-muted-foreground mt-2">{getDescription()}</p>
          )}
        </div>

        {/* 定价内容区域 - 可滚动 */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6">
          <DarkPricing
            userId={userId}
            dictPrice={dictPrice}
            dictCredits={dictCredits}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { UpgradeModalContent as UpgradeModal };
