import { getToolPageConfig } from "@/config/tool-pages";
import { ToolPageLayout } from "@/components/tool/tool-page-layout";
import type { Locale } from "@/config/i18n-config";

interface ReferenceToVideoPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function ReferenceToVideoPage({ params }: ReferenceToVideoPageProps) {
  const config = getToolPageConfig("reference-to-video");
  const { locale } = await params;
  return (
    <ToolPageLayout
      config={config}
      locale={locale}
      toolRoute="reference-to-video"
    />
  );
}
