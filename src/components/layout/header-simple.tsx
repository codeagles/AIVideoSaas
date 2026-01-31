"use client";

import Link from "next/link";
import { useLocalePathname, useLocaleRouter } from "@/i18n/navigation";
import { Gem, Globe, Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { authClient, type User } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui";
import { useCredits } from "@/stores/credits-store";
import { UserAvatar } from "@/components/user-avatar";
import { useSigninModal } from "@/hooks/use-signin-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userMenuItems } from "@/config/navigation";
import { i18n, localeMap } from "@/config/i18n-config";

interface HeaderSimpleProps {
  user?: Pick<User, "name" | "image" | "email"> | null;
  lang?: string;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export function HeaderSimple({
  user,
  lang = "en",
  mobileMenuOpen = false,
  onMobileMenuToggle,
}: HeaderSimpleProps) {
  const { balance } = useCredits();
  const signInModal = useSigninModal();
  const router = useLocaleRouter();
  const pathname = useLocalePathname();
  const tCommon = useTranslations("Common");
  const tHeader = useTranslations("Header");
  const currentLocale = lang || "en";

  const switchLocale = (nextLocale: string) => {
    router.push(pathname, { locale: nextLocale });
  };

  const menuLabelMap: Record<string, string> = {
    creations: tHeader("myCreations"),
    credits: tHeader("credits"),
    settings: tHeader("settings"),
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden p-2 hover:bg-muted rounded-md"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href={`/${lang}`} className="flex items-center gap-2">
            <span className="text-xl font-semibold">VideoFly</span>
          </Link>
        </div>

        {/* Right: Credits + User Menu */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-semibold">
                  {currentLocale.toUpperCase()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              <div className="px-2 py-1 text-xs text-muted-foreground">
                {tCommon("language")}
              </div>
              {i18n.locales.map((locale) => (
                <DropdownMenuItem
                  key={locale}
                  onSelect={() => switchLocale(locale)}
                  className={cn(
                    "cursor-pointer",
                    locale === currentLocale && "bg-muted"
                  )}
                >
                  <span>{localeMap[locale]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Credits Display */}
          {user && balance && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border">
              <Gem className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                {balance.availableCredits}
              </span>
            </div>
          )}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2">
                <UserAvatar
                  user={{ name: user.name ?? null, image: user.image ?? null }}
                  className="h-8 w-8"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user.email && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                )}
                <DropdownMenuSeparator />
                {userMenuItems.map((item) => (
                  <DropdownMenuItem key={item.id} asChild>
                    <Link href={`/${lang}${item.href}`}>
                      {menuLabelMap[item.id] ?? item.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onSelect={async () => {
                    await authClient.signOut();
                    router.push(`/${lang}`);
                    router.refresh();
                  }}
                >
                  {tCommon("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={signInModal.onOpen}>
              {tCommon("login")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
