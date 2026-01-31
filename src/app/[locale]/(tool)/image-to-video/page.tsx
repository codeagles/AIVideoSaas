import { getToolPageConfig } from "@/config/tool-pages";
import { ToolPageLayout } from "@/components/tool/tool-page-layout";
import type { Locale } from "@/config/i18n-config";

interface ImageToVideoPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function ImageToVideoPage({ params }: ImageToVideoPageProps) {
  const config = getToolPageConfig("image-to-video");
  const { locale } = await params;
  return (
    <ToolPageLayout
      config={config}
      locale={locale}
      toolRoute="image-to-video"
    />
  );
}
