"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@/components/ui";

import { ModeToggle } from "@/components/mode-toggle";

export function SiteFooter({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations('SiteFooter');
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Image
            src="/images/avatars/saasfly-logo.svg"
            width="36"
            height="36"
            alt=""
          />
          <p className="text-center text-sm leading-loose md:text-left">
            {t('copyright', { currentYear })}
          </p>
        </div>
        <ModeToggle />
      </div>
    </footer>
  );
}
