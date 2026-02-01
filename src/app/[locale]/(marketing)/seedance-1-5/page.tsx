import type { Locale } from "@/config/i18n-config";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LocaleLink } from "@/i18n/navigation";
import { cn } from "@/components/ui";

interface ModelPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

// SEO Metadata
export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seedance" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    alternates: {
      languages: {
        en: "/seedance-1-5",
        zh: "/zh/seedance-1-5",
      },
    },
  };
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seedance" });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - SEO: h1 tag */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              {t("hero.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section - SEO: h2 + structured content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              {t("overview.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              {t("overview.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section - SEO: h2 with feature cards */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              {t("features.title")}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Text-to-Video */}
              <article className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("features.textToVideo.title")}</h3>
                <p className="text-muted-foreground">
                  {t("features.textToVideo.description")}
                </p>
              </article>

              {/* Image-to-Video */}
              <article className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("features.imageToVideo.title")}</h3>
                <p className="text-muted-foreground">
                  {t("features.imageToVideo.description")}
                </p>
              </article>

              {/* Frame-to-Video */}
              <article className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("features.frameToVideo.title")}</h3>
                <p className="text-muted-foreground">
                  {t("features.frameToVideo.description")}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section - SEO: structured data table */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
              {t("specs.title")}
            </h2>

            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Duration */}
                <div className="p-6">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                    {t("specs.duration")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {t.raw("specs.durationOptions").map((option: string) => (
                      <span key={option} className="px-3 py-1.5 bg-muted rounded-full text-sm">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                <div className="p-6">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                    {t("specs.resolution")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {t.raw("specs.resolutionOptions").map((option: string) => (
                      <span key={option} className="px-3 py-1.5 bg-muted rounded-full text-sm">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="p-6">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                    {t("specs.aspectRatio")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {t.raw("specs.aspectRatioOptions").map((option: string) => (
                      <span key={option} className="px-3 py-1.5 bg-muted rounded-full text-sm">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Camera & Audio */}
                <div className="p-6">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                    {t("specs.camera")} / {t("specs.audio")}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">{t.raw("specs.cameraOptions")[0]}</p>
                    <p className="text-sm">{t.raw("specs.cameraOptions")[1]}</p>
                    <p className="text-sm">{t("specs.audioOption")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("useCases.title")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("useCases.description")}
            </p>
            <ul className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              {t.raw("useCases.items").map((item: string, index: number) => (
                <li key={index} className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Prompt Tips Section - SEO: h2 with detailed content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t("promptTips.title")}
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              {t("promptTips.description")}
            </p>

            {/* Tips Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {t.raw("promptTips.tips").map((tip: { title: string; description: string }, index: number) => (
                <article key={index} className="bg-card border rounded-lg p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm">
                      {index + 1}
                    </span>
                    {tip.title}
                  </h3>
                  <p className="text-muted-foreground text-sm ml-8">
                    {tip.description}
                  </p>
                </article>
              ))}
            </div>

            {/* Example Prompts */}
            <div className="bg-muted/50 rounded-xl p-6 md:p-8">
              <h3 className="font-semibold mb-4 text-lg">
                {t("promptTips.examples.title")}
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("features.textToVideo.title")}
                  </p>
                  <p className="bg-background rounded-lg p-4 text-sm border">
                    {t("promptTips.examples.textToVideo")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("features.imageToVideo.title")}
                  </p>
                  <p className="bg-background rounded-lg p-4 text-sm border">
                    {t("promptTips.examples.imageToVideo")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("features.frameToVideo.title")}
                  </p>
                  <p className="bg-background rounded-lg p-4 text-sm border">
                    {t("promptTips.examples.frameToVideo")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              {t("cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LocaleLink
                href={`/${locale}/image-to-video`}
                className={cn(
                  "px-8 py-4 bg-background text-foreground rounded-lg font-semibold",
                  "hover:bg-background/90 transition-colors"
                )}
              >
                {t("cta.imageToVideo")}
              </LocaleLink>
              <LocaleLink
                href={`/${locale}/text-to-video`}
                className={cn(
                  "px-8 py-4 border border-primary-foreground/30 rounded-lg font-semibold",
                  "hover:bg-primary-foreground/10 transition-colors"
                )}
              >
                {t("cta.textToVideo")}
              </LocaleLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
