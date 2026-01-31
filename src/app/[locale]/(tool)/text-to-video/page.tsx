import { getToolPageConfig } from "@/config/tool-pages";
import { ToolPageLayout } from "@/components/tool/tool-page-layout";
import type { Locale } from "@/config/i18n-config";

interface TextToVideoPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function TextToVideoPage({ params }: TextToVideoPageProps) {
  const config = getToolPageConfig("text-to-video");
  const { locale } = await params;
  return (
    <ToolPageLayout
      config={config}
      locale={locale}
      toolRoute="text-to-video"
    />
  );
}
