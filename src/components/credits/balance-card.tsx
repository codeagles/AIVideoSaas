"use client";

// ============================================
// 积分余额组件
// ============================================

import { useTranslations } from "next-intl";
import { Gem } from "lucide-react";
import { cn } from "@/components/ui";
import type { CreditBalance } from "@/lib/types/dashboard";

interface BalanceCardProps {
  balance: CreditBalance | null;
  onBuyCredits: () => void;
}

export function BalanceCard({ balance, onBuyCredits }: BalanceCardProps) {
  const t = useTranslations("dashboard.credits");

  if (!balance) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading balance...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 可用积分 */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold">
          {balance.availableCredits.toLocaleString()}
        </span>
        <span className="text-muted-foreground">{t("available")}</span>
      </div>

      {/* 已用积分 */}
      <div className="text-sm text-muted-foreground">
        {t("used")}: {balance.usedCredits}
      </div>

      {/* 购买积分按钮 */}
      <button
        type="button"
        onClick={onBuyCredits}
        className="py-2 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
      >
        <Gem className="h-4 w-4" />
        {t("buyCredits")}
      </button>
    </div>
  );
}
