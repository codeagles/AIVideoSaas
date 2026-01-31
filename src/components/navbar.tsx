"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import type { User } from "@/lib/auth";
import { cn } from "@/components/ui";
import { Button } from "@/components/ui/button";

import { MainNav } from "./main-nav";
import { LocaleChange } from "@/components/locale-change";
import { GitHubStar } from "@/components/github-star";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { UserAccountNav } from "./user-account-nav";
import { LocaleLink } from "@/i18n/navigation";

import useScroll from "@/hooks/use-scroll";
import type { MainNavItem } from "@/types";

interface NavBarProps {
  user: Pick<User, "name" | "image" | "email"> | undefined;
  items?: MainNavItem[];
  children?: React.ReactNode;
  rightElements?: React.ReactNode;
  scroll?: boolean;
}

export function NavBar({
  user,
  items,
  children,
  rightElements,
  scroll = false,
}: NavBarProps) {
  const t = useTranslations('NavBar');
  const scrolled = useScroll(50);
  const signInModal = useSigninModal();
  const pathname = usePathname();

  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center border-border bg-background/60 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-background/0") : "border-b"
      }`}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <MainNav items={items}>
          {children}
        </MainNav>

        <div className="flex items-center space-x-3">
          {items?.length ? (
            <nav className="hidden gap-6 md:flex">
              {items?.map((item, index) => (
                <LocaleLink
                  key={index}
                  href={item.disabled ? "#" : item.href}
                  className={cn(
                    "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                    pathname.endsWith(item.href)
                      ? "text-blue-500 font-semibold"
                      : "",
                    item.disabled && "cursor-not-allowed opacity-80",
                  )}
                >
                  {item.title}
                </LocaleLink>
              ))}
            </nav>
          ) : null}

          <div className="w-[1px] h-8 bg-accent" />

          {rightElements}

          <div className="hidden md:flex lg:flex xl:flex">
            <GitHubStar />
          </div>
          <LocaleChange />
          {!user ? (
            <>
              <Button variant="outline" size="sm" onClick={signInModal.onOpen}>
                {t('login')}
              </Button>
              <Button
                className="px-3"
                variant="default"
                size="sm"
                onClick={signInModal.onOpen}
              >
                {t('signup')}
              </Button>
            </>
          ) : null}

          {user ? <UserAccountNav user={user} /> : null}
        </div>
      </div>
    </header>
  );
}
