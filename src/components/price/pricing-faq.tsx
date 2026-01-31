import Balancer from "react-wrap-balancer";
import { useTranslations, useLocale } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { priceFaqDataMap } from "@/config/price/price-faq-data";

export function PricingFaq() {
  const t = useTranslations('PricingFaq');
  const locale = useLocale();
  const pricingFaqData = priceFaqDataMap[locale];

  return (
    <section className="container max-w-3xl py-2">
      <div className="mb-14 space-y-6 text-center">
        <h1 className="font-heading text-center text-3xl md:text-5xl">
          <Balancer>{t('faq')}</Balancer>
        </h1>
        <p className="text-md text-muted-foreground">
          <Balancer>{t('faq_detail')}</Balancer>
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {pricingFaqData?.map((faqItem) => (
          <AccordionItem key={faqItem.id} value={faqItem.id}>
            <AccordionTrigger>{faqItem.question}</AccordionTrigger>
            <AccordionContent>{faqItem.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
