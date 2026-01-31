"use client";

import { useMobileMenu } from "@/components/layout/mobile-menu-context";
import { HeaderSimple } from "@/components/layout/header-simple";
import { Sidebar } from "@/components/layout/sidebar";

interface ToolLayoutContentProps {
  children: React.ReactNode;
  lang: string;
  user: any;
}

export function ToolLayoutContent({
  children,
  lang,
  user,
}: ToolLayoutContentProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useMobileMenu();

  return (
    <div className="min-h-screen bg-background">
      <HeaderSimple
        user={user}
        lang={lang}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          lang={lang}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
