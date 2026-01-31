import { notFound } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { HeaderSimple } from "@/components/layout/header-simple";
import { Sidebar } from "@/components/layout/sidebar";
import { UpgradeModal } from "@/components/upgrade/upgrade-modal";
import { i18n, type Locale } from "@/config/i18n-config";

interface DashboardLayoutProps {
  children?: React.ReactNode;
  params: Promise<{
    locale: Locale;
  }>;
}

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params;
  const user = await requireAuth(`/${locale}/login`);

  return (
    <div className="min-h-screen bg-background">
      <HeaderSimple
        user={{
          name: user.name,
          image: user.image,
          email: user.email,
        }}
        lang={locale}
      />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Fixed 200px */}
        <Sidebar lang={locale} />

        {/* Main Content Area - Flex */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* 全局升级弹窗 */}
      <UpgradeModal />
    </div>
  );
}
