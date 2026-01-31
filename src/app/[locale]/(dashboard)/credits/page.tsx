import { CreditsPage } from "@/components/credits/credits-page";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CreditsRoute({ params }: PageProps) {
  const { locale } = await params;
  return <CreditsPage locale={locale} />;
}
