import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { HowItWorks } from "@/components/landing/how-it-works-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";

import type { Locale } from "@/config/i18n-config";

interface HomePageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  return (
    <>
      <HeroSection />
      <ShowcaseSection />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
      <FAQSection />
    </>
  );
}
