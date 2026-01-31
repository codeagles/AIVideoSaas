import { SettingsPage } from "@/components/billing/settings-page";
import { requireAuth } from "@/lib/auth";
import { i18n, type Locale } from "@/config/i18n-config";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function SettingsRoute({ params }: PageProps) {
  const { locale } = await params;
  const user = await requireAuth(`/${locale}/login`);

  return (
    <SettingsPage
      locale={locale}
      userEmail={user.email}
      userId={user.id}
    />
  );
}
