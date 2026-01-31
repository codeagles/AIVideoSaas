import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";

import { ModalProvider } from "@/components/modal-provider";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import type { Locale } from "@/config/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    locale: Locale;
  }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();
  const dict = await getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-16 border-b" />}>
        <LandingHeader user={user ?? null} />
      </Suspense>

      <ModalProvider dict={dict} locale={locale}>
        <main className="flex-1">{children}</main>
      </ModalProvider>

      <LandingFooter />
    </div>
  );
}
