"use client";

import { Video, Image, Wand2, Zap, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { BlurFade } from "@/components/magicui/blur-fade";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { cn } from "@/components/ui";

/**
 * Features Section - 特性展示
 *
 * 设计模式: Alternating Feature Cards
 * - 交替布局（左右交替）
 * - 简洁的卡片设计
 * - 参考 Linear/Vercel 风格
 */

// 特性数据
const features = [
  {
    icon: Video,
    titleKey: "textToVideo.title",
    descKey: "textToVideo.description",
    gradient: "from-blue-500 to-cyan-500",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80",
  },
  {
    icon: Image,
    titleKey: "imageToVideo.title",
    descKey: "imageToVideo.description",
    gradient: "from-purple-500 to-pink-500",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
  },
  {
    icon: Wand2,
    titleKey: "enhancement.title",
    descKey: "enhancement.description",
    gradient: "from-orange-500 to-red-500",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
  },
];

// 核心优势数据
const benefits = [
  {
    icon: Zap,
    titleKey: "fast.title",
    descKey: "fast.description",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: Shield,
    titleKey: "secure.title",
    descKey: "secure.description",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Clock,
    titleKey: "realtime.title",
    descKey: "realtime.description",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
];

export function FeaturesSection() {
  const t = useTranslations("Features");

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      </div>

      <div className="container mx-auto px-4">
        {/* 区域标题 */}
        <BlurFade inView>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              {t("title")}
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                {t("subtitle")}
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {t("description")}
            </motion.p>
          </div>
        </BlurFade>

        {/* 主要特性 - 交替布局 */}
        <div className="space-y-24 md:space-y-32 mb-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;

            return (
              <BlurFade key={feature.titleKey} delay={index * 0.1} inView>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${
                    isEven ? "" : "md:flex md:flex-row-reverse"
                  }`}
                >
                  {/* 左侧/右侧 - 图片 */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative"
                  >
                    {/* 装饰光晕 */}
                    <div
                      className={cn(
                        "absolute -inset-4 rounded-3xl blur-2xl -z-10 opacity-40",
                        "bg-gradient-to-br",
                        feature.gradient
                      )}
                    />

                    {/* 图片卡片 */}
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-background shadow-xl">
                      <img
                        src={feature.image}
                        alt={t(feature.titleKey)}
                        className="w-full aspect-[4/3] object-cover"
                      />
                      {/* 渐变遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>
                  </motion.div>

                  {/* 右侧/左侧 - 内容 */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="space-y-6"
                  >
                    {/* 图标 */}
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                        "bg-gradient-to-br",
                        feature.gradient
                      )}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {/* 标题 */}
                    <h3 className="text-2xl md:text-3xl font-bold">
                      {t(feature.titleKey)}
                    </h3>

                    {/* 描述 */}
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {t(feature.descKey)}
                    </p>

                    {/* 装饰线 */}
                    <div
                      className={cn(
                        "w-16 h-1 rounded-full",
                        "bg-gradient-to-r",
                        feature.gradient
                      )}
                    />
                  </motion.div>
                </motion.div>
              </BlurFade>
            );
          })}
        </div>

        {/* 核心优势 - 网格布局 */}
        <BlurFade delay={0.4} inView>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group p-6 rounded-2xl border border-border bg-background hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  {/* 图标 */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
                      benefit.bgColor
                    )}
                  >
                    <Icon className={cn("h-6 w-6", benefit.color)} />
                  </div>

                  {/* 标题 */}
                  <h4 className="text-lg font-semibold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                    {t(benefit.titleKey)}
                  </h4>

                  {/* 描述 */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(benefit.descKey)}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </BlurFade>

        {/* 底部 CTA */}
        <BlurFade delay={0.6} inView>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <p className="text-muted-foreground mb-6 text-lg">
              {t("bottomCTA.text")}
            </p>
            <ShimmerButton
              shimmerColor="#ffffff"
              shimmerSize="0.05em"
              shimmerDuration="3s"
              borderRadius="100px"
              background="linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)"
              className="px-8 py-3 text-base font-medium shadow-lg shadow-blue-500/25"
            >
              {t("bottomCTA.button")}
            </ShimmerButton>
          </motion.div>
        </BlurFade>
      </div>
    </section>
  );
}
