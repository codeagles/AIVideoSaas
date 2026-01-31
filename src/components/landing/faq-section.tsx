"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BlurFade } from "@/components/magicui/blur-fade";

interface FAQItem {
  questionKey: string;
  answerKey: string;
}

const faqData: FAQItem[] = [
  {
    questionKey: "template.question",
    answerKey: "template.answer",
  },
  {
    questionKey: "deployment.question",
    answerKey: "deployment.answer",
  },
  {
    questionKey: "aiModels.question",
    answerKey: "aiModels.answer",
  },
  {
    questionKey: "credits.question",
    answerKey: "credits.answer",
  },
  {
    questionKey: "customization.question",
    answerKey: "customization.answer",
  },
  {
    questionKey: "payment.question",
    answerKey: "payment.answer",
  },
];

export function FAQSection() {
  const t = useTranslations("FAQ");

  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* 标题 */}
          <BlurFade inView>
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                {t("title")}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground"
              >
                {t("subtitle")}
              </motion.p>
            </div>
          </BlurFade>

          {/* FAQ 列表 */}
          <BlurFade delay={0.2} inView>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {faqData.map((item, index) => (
                  <motion.div
                    key={item.questionKey}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <AccordionItem
                      value={`faq-${index}`}
                      className="px-6 rounded-2xl border border-border bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-colors"
                    >
                      <AccordionTrigger className="text-left hover:no-underline cursor-pointer">
                        <span className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                            {index + 1}
                          </span>
                          <span>{t(item.questionKey)}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pl-11 text-muted-foreground">
                        {t(item.answerKey)}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          </BlurFade>

          {/* 底部提示 */}
          <BlurFade delay={0.4} inView>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-primary/20"
            >
              <p className="text-muted-foreground">
                {t("contact")}
                <a
                  href="mailto:support@videofly.app"
                  className="text-primary hover:underline mx-1"
                >
                  support@videofly.app
                </a>
              </p>
            </motion.div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
