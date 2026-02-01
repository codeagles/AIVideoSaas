import { getTranslations } from "next-intl/server";
import type { Locale } from "@/config/i18n-config";
import type { Metadata } from "next";
import { BlurFade } from "@/components/magicui/blur-fade";
import { CheckCircle2 } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "隐私政策 - VideoMint" : "Privacy Policy - VideoMint",
    description: locale === "zh"
      ? "了解 VideoMint 如何收集、使用和保护您的个人信息"
      : "Learn how VideoMint collects, uses, and protects your personal information",
  };
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("Privacy");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <BlurFade inView>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("lastUpdated")}: {new Date().toLocaleDateString()}
              </p>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose dark:prose-invert max-w-none">
              {/* Introduction */}
              <BlurFade inView delay={0.1}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">1</span>
                    {t("sections.introduction.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.introduction.content")}</p>
                </div>
              </BlurFade>

              {/* Data Collection */}
              <BlurFade inView delay={0.2}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">2</span>
                    {t("sections.dataCollect.title")}
                  </h2>
                  <p className="text-muted-foreground mb-4">{t("sections.dataCollect.intro")}</p>
                  <ul className="space-y-3">
                    {[
                      "account",
                      "usage",
                      "payment",
                      "technical",
                      "content",
                    ].map((key) => (
                      <li key={key} className="flex items-start gap-3 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{t(`sections.dataCollect.items.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </BlurFade>

              {/* Data Use */}
              <BlurFade inView delay={0.3}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">3</span>
                    {t("sections.dataUse.title")}
                  </h2>
                  <p className="text-muted-foreground mb-4">{t("sections.dataUse.intro")}</p>
                  <ul className="space-y-3">
                    {[
                      "service",
                      "account",
                      "communication",
                      "improvement",
                      "legal",
                    ].map((key) => (
                      <li key={key} className="flex items-start gap-3 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{t(`sections.dataUse.items.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </BlurFade>

              {/* Data Sharing */}
              <BlurFade inView delay={0.4}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">4</span>
                    {t("sections.dataSharing.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.dataSharing.content")}</p>
                </div>
              </BlurFade>

              {/* Data Security */}
              <BlurFade inView delay={0.5}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">5</span>
                    {t("sections.dataSecurity.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.dataSecurity.content")}</p>
                </div>
              </BlurFade>

              {/* User Rights */}
              <BlurFade inView delay={0.6}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">6</span>
                    {t("sections.userRights.title")}
                  </h2>
                  <p className="text-muted-foreground mb-4">{t("sections.userRights.intro")}</p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {[
                      "access",
                      "rectification",
                      "deletion",
                      "portability",
                      "withdraw",
                    ].map((key) => (
                      <li key={key} className="flex items-start gap-3 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{t(`sections.userRights.items.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </BlurFade>

              {/* Data Retention */}
              <BlurFade inView delay={0.7}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">7</span>
                    {t("sections.dataRetention.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.dataRetention.content")}</p>
                </div>
              </BlurFade>

              {/* Children */}
              <BlurFade inView delay={0.8}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">8</span>
                    {t("sections.children.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.children.content")}</p>
                </div>
              </BlurFade>

              {/* Changes */}
              <BlurFade inView delay={0.9}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">9</span>
                    {t("sections.changes.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.changes.content")}</p>
                </div>
              </BlurFade>

              {/* Contact */}
              <BlurFade inView delay={1.0}>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-primary/20">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">10</span>
                    {t("sections.contact.title")}
                  </h2>
                  <p className="text-muted-foreground mb-2">{t("sections.contact.content")}</p>
                  <a
                    href="mailto:support@videomint.app"
                    className="text-primary hover:underline font-medium"
                  >
                    support@videomint.app
                  </a>
                </div>
              </BlurFade>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
