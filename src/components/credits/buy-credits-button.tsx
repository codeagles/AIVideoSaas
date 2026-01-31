"use client";

// ============================================
// Buy Credits Button Component
// ============================================

import { useTranslations } from "next-intl";
import Link from "next/link";

interface BuyCreditsButtonProps {
  locale: string;
}

export function BuyCreditsButton({ locale }: BuyCreditsButtonProps) {
  const t = useTranslations("dashboard.credits");

  return (
    <Link href={`/${locale}/pricing`}>
      <button className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
        {t("buyCredits")}
      </button>
    </Link>
  );
}
