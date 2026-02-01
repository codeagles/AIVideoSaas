import { getTranslations } from "next-intl/server";
import type { Locale } from "@/config/i18n-config";
import type { Metadata } from "next";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Shield, AlertCircle, FileText } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "服务条款 - VideoMint" : "Terms of Service - VideoMint",
    description: locale === "zh"
      ? "VideoMint 服务条款和用户协议"
      : "VideoMint Terms of Service and User Agreement",
  };
}

export default async function TermsOfServicePage() {
  const t = await getTranslations("Terms");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <BlurFade inView>
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </div>
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
              {/* Acceptance */}
              <BlurFade inView delay={0.1}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">1</span>
                    {t("sections.acceptance.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.acceptance.content")}</p>
                </div>
              </BlurFade>

              {/* Account Requirements */}
              <BlurFade inView delay={0.2}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">2</span>
                    {t("sections.account.title")}
                  </h2>
                  <p className="text-muted-foreground mb-4">{t("sections.account.intro")}</p>
                  <ul className="space-y-3">
                    {["age", "accurate", "security", "activity"].map((key) => (
                      <li key={key} className="flex items-start gap-3 text-muted-foreground">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{t(`sections.account.items.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </BlurFade>

              {/* Service Description */}
              <BlurFade inView delay={0.3}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">3</span>
                    {t("sections.service.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.service.content")}</p>
                </div>
              </BlurFade>

              {/* Credits and Payments */}
              <BlurFade inView delay={0.4}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">4</span>
                    {t("sections.credits.title")}
                  </h2>
                  <p className="text-muted-foreground mb-4">{t("sections.credits.intro")}</p>
                  <ul className="space-y-3">
                    {["nonRefundable", "expiration", "transfer", "usage"].map((key) => (
                      <li key={key} className="flex items-start gap-3 text-muted-foreground">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{t(`sections.credits.items.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </BlurFade>

              {/* Acceptable Use */}
              <BlurFade inView delay={0.5}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">5</span>
                    {t("sections.content.title")}
                  </h2>
                  <p className="text-muted-foreground mb-4">{t("sections.content.intro")}</p>
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 mb-4">
                    <p className="text-red-600 dark:text-red-400 font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {t("sections.content.prohibited")}
                    </p>
                    <ul className="space-y-2">
                      {[
                        "illegal",
                        "harmful",
                        "infringing",
                        "misleading",
                        "spam",
                        "harassing",
                      ].map((key) => (
                        <li key={key} className="flex items-start gap-3 text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                          <span>{t(`sections.content.prohibitedItems.${key}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </BlurFade>

              {/* Intellectual Property */}
              <BlurFade inView delay={0.6}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">6</span>
                    {t("sections.intellectualProperty.title")}
                  </h2>
                  <p className="text-muted-foreground mb-4">{t("sections.intellectualProperty.intro")}</p>
                  <ul className="space-y-3">
                    {["ownership", "license", "generated"].map((key) => (
                      <li key={key} className="flex items-start gap-3 text-muted-foreground">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{t(`sections.intellectualProperty.items.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </BlurFade>

              {/* Termination */}
              <BlurFade inView delay={0.7}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">7</span>
                    {t("sections.termination.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.termination.content")}</p>
                </div>
              </BlurFade>

              {/* Disclaimer */}
              <BlurFade inView delay={0.8}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">8</span>
                    {t("sections.disclaimer.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.disclaimer.content")}</p>
                </div>
              </BlurFade>

              {/* Limitation of Liability */}
              <BlurFade inView delay={0.9}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">9</span>
                    {t("sections.limitation.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.limitation.content")}</p>
                </div>
              </BlurFade>

              {/* Governing Law */}
              <BlurFade inView delay={1.0}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">10</span>
                    {t("sections.governing.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.governing.content")}</p>
                </div>
              </BlurFade>

              {/* Changes */}
              <BlurFade inView delay={1.1}>
                <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">11</span>
                    {t("sections.changes.title")}
                  </h2>
                  <p className="text-muted-foreground">{t("sections.changes.content")}</p>
                </div>
              </BlurFade>

              {/* Contact */}
              <BlurFade inView delay={1.2}>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-primary/20">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">12</span>
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
