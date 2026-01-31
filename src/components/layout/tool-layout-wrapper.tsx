"use client";

import { MobileMenuProvider, useMobileMenu } from "./mobile-menu-context";
import { HeaderSimple } from "./header-simple";
import { Sidebar } from "./sidebar";

interface ToolLayoutWrapperProps {
  children: React.ReactNode;
  lang?: string;
  user?: any;
}

function ToolLayoutContent({ children, lang, user }: ToolLayoutWrapperProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useMobileMenu();

  return (
    <>
      <HeaderSimple user={user} lang={lang} />
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          lang={lang}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>
    </>
  );
}

export function ToolLayoutWrapper({
  children,
  lang = "en",
  user,
}: ToolLayoutWrapperProps) {
  return (
    <MobileMenuProvider>
      <div className="min-h-screen bg-background">
        <ToolLayoutContent lang={lang} user={user}>
          {children}
        </ToolLayoutContent>
      </div>
    </MobileMenuProvider>
  );
}
