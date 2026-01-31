"use client";

import React from "react";
import { useTranslations } from "next-intl";

import * as Icons from "@/components/ui/icons";
import { DocumentGuide } from "@/components/document-guide";
import { MobileNav } from "@/components/mobile-nav";

import { LocaleLink } from "@/i18n/navigation";
import type { MainNavItem } from "@/types";

interface MainNavProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
}

export function MainNav({
  items,
  children,
}: MainNavProps) {
  const t = useTranslations('MainNav');
  const intro = t('introducing');
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false);
  const toggleMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  const handleMenuItemClick = () => {
    toggleMenu();
  };
  return (
    <div className="flex gap-6 md:gap-10">
      <div className="flex items-center">
        <LocaleLink href="/" className="hidden items-center space-x-2 md:flex">
          <div className="text-3xl">VideoFly</div>
        </LocaleLink>

        <a
          href="https://docs.videofly.app"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 hidden md:flex lg:flex xl:flex"
        >
          <DocumentGuide>
            {intro}
          </DocumentGuide>
        </a>
      </div>

      <button
        type="button"
        className="flex items-center space-x-2 md:hidden"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        {showMobileMenu ? <Icons.Close/> : <Icons.Logo/>}
        <span className="font-bold">Menu</span>
      </button>
      {showMobileMenu && items && (
        <MobileNav items={items} menuItemClick={handleMenuItemClick}>
          {children}
        </MobileNav>
      )}
    </div>
  );
}
