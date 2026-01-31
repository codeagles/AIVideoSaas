"use client";

// ============================================
// Creation Empty State Component
// ============================================

import { useTranslations } from "next-intl";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/components/ui";

interface CreationEmptyProps {
  className?: string;
}

export function CreationEmpty({ className }: CreationEmptyProps) {
  const t = useTranslations("dashboard.myCreations.empty");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Film className="h-10 w-10 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-lg font-semibold">{t("title")}</h3>
      <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
        {t("description")}
      </p>

      {/* Optional CTA button */}
      {/* <Link href="/image-to-video">
        <Button className="mt-4">
          Start Creating
        </Button>
      </Link> */}
    </div>
  );
}
