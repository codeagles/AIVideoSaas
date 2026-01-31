import { MobileMenuProvider } from "@/components/layout/mobile-menu-context";
import { ToolLayoutContent } from "@/components/layout/tool-layout-content";
import { i18n, type Locale } from "@/config/i18n-config";
import { getCurrentUser } from "@/lib/auth";

interface ToolLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: Locale;
  }>;
}

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function ToolLayout({
  children,
  params,
}: ToolLayoutProps) {
  const { locale } = await params;
  const user = await getCurrentUser();

  return (
    <MobileMenuProvider>
      <ToolLayoutContent lang={locale} user={user}>
        {children}
      </ToolLayoutContent>
    </MobileMenuProvider>
  );
}
