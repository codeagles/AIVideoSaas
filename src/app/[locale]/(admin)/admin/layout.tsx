import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { HeaderSimple } from "@/components/layout/header-simple";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import type { Locale } from "@/config/i18n-config";

interface AdminLayoutProps {
  children?: React.ReactNode;
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;

  // 检查管理员权限
  const user = await requireAdmin(`/${locale}/login`);

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
        {/* Admin Sidebar */}
        <AdminSidebar locale={locale} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
