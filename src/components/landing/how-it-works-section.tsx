"use client";

import { Type, Upload, Video, Download, Sparkles, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { BlurFade } from "@/components/magicui/blur-fade";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { cn } from "@/components/ui";

/**
 * How It Works Section - 工作流程展示
 *
 * 设计模式: Step-by-Step with Timeline
 * - 清晰的步骤展示
 * - 动画数字计数器
 */

// 步骤数据
const steps = [
  {
    step: "01",
    icon: Type,
    titleKey: "steps.prompt.title",
    descKey: "steps.prompt.description",
    gradient: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500",
    stat: { value: 30, suffix: "s", labelKey: "steps.prompt.stat" },
  },
  {
    step: "02",
    icon: Upload,
    titleKey: "steps.upload.title",
    descKey: "steps.upload.description",
    gradient: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500",
    stat: null,
  },
  {
    step: "03",
    icon: Video,
    titleKey: "steps.generate.title",
    descKey: "steps.generate.description",
    gradient: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500",
    stat: { value: 2, suffix: "min", labelKey: "steps.generate.stat" },
  },
  {
    step: "04",
    icon: Download,
    titleKey: "steps.download.title",
    descKey: "steps.download.description",
    gradient: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500",
    stat: { value: 1080, suffix: "p", labelKey: "steps.download.stat" },
  },
];

export function HowItWorks() {
  const t = useTranslations("HowItWorks");

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      </div>

      <div className="container mx-auto px-4">
        {/* 区域标题 */}
        <BlurFade inView>
          <div className="text-center max-w-3xl mx-auto mb-16">
            {/* 徽章 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
            >
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {t("badge")}
              </span>
            </motion.div>

            {/* 主标题 */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              {t("title")}
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mt-2">
                {t("subtitle")}
              </span>
            </motion.h2>

            {/* 描述 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {t("description")}
            </motion.p>
          </div>
        </BlurFade>

        {/* 步骤卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <BlurFade key={step.step} delay={index * 0.1} inView>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* 连接线 (桌面端) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border via-border/50 to-transparent -translate-x-1/2" />
                  )}

                  {/* 步骤编号徽章 */}
                  <motion.div
                    className="absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg z-10"
                    style={{
                      background: `linear-gradient(135deg, ${step.gradient.split(" ")[0].replace("from-", "#")}, ${step.gradient.split(" ")[1].replace("to-", "#")})`,
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step.step}
                  </motion.div>

                  {/* 卡片主体 */}
                  <div className="relative pt-8 h-full">
                    <div className="relative h-full p-6 rounded-2xl border border-border bg-background hover:shadow-xl transition-all duration-300 group-hover:border-border/50">
                      {/* 图标 */}
                      <motion.div
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg",
                          "bg-gradient-to-br",
                          step.gradient
                        )}
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>

                      {/* 标题 */}
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                        {t(step.titleKey)}
                      </h3>

                      {/* 描述 */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {t(step.descKey)}
                      </p>

                      {/* 统计数据 (如果有) */}
                      {step.stat && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          whileInView={{ opacity: 1, height: "auto" }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="pt-4 border-t border-border/50"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              {t(step.stat.labelKey)}:
                            </span>
                            <span className="text-lg font-bold text-foreground">
                              <NumberTicker value={step.stat.value} />
                              {step.stat.suffix}
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {/* 悬停时的光晕效果 */}
                      <div
                        className={cn(
                          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl",
                          "bg-gradient-to-br",
                          step.gradient
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              </BlurFade>
            );
          })}
        </div>

        {/* 底部提示 */}
        <BlurFade delay={0.5} inView>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-border">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">{t("bottomHint")}</span>
            </div>
          </motion.div>
        </BlurFade>
      </div>
    </section>
  );
}
