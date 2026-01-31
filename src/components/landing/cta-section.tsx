"use client";

import { ArrowRight, Check, Sparkles, Video, Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { BlurFade } from "@/components/magicui/blur-fade";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { Marquee } from "@/components/magicui/marquee";
import { LocaleLink } from "@/i18n/navigation";
import { cn } from "@/components/ui";

/**
 * CTA Section - 行动号召区域
 *
 * 设计模式: Social Proof + CTA
 * - 用户头像展示社交证明
 * - Marquee 滚动展示评价
 * - Glassmorphism 风格卡片
 */

// 用户头像数据
const avatarUrls = [
  {
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    profileUrl: "#",
  },
  {
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    profileUrl: "#",
  },
  {
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    profileUrl: "#",
  },
  {
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
    profileUrl: "#",
  },
];

// 评价数据
const testimonials = [
  {
    content: "Amazing tool! Created stunning videos in minutes.",
    author: "Sarah Chen",
    role: "Content Creator",
    rating: 5,
  },
  {
    content: "The AI video generation is mind-blowing!",
    author: "Mike Johnson",
    role: "Marketing Director",
    rating: 5,
  },
  {
    content: "Best investment for our social media team.",
    author: "Emma Wilson",
    role: "Social Media Manager",
    rating: 5,
  },
  {
    content: "Incredible quality and super fast generation.",
    author: "David Lee",
    role: "Video Producer",
    rating: 5,
  },
];

// 优势列表
const benefits = [
  { icon: Check, labelKey: "benefits.free", color: "text-green-500" },
  { icon: Check, labelKey: "benefits.noCard", color: "text-green-500" },
  { icon: Check, labelKey: "benefits.cancel", color: "text-green-500" },
  { icon: Check, labelKey: "benefits.support", color: "text-green-500" },
];

export function CTASection() {
  const t = useTranslations("CTA");

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      </div>

      <div className="container mx-auto px-4">
        <div className="relative max-w-6xl mx-auto">
          {/* 主要 CTA 卡片 */}
          <BlurFade inView>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl"
            >
              {/* 边框光效 */}
              <BorderBeam
                size={400}
                duration={12}
                anchor={90}
                borderWidth={2}
                colorFrom="#3B82F6"
                colorTo="#A855F7"
              />

              {/* 顶部渐变装饰 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                {/* 左侧: 内容 */}
                <div className="space-y-6">
                  {/* 徽章 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20"
                  >
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {t("badge")}
                    </span>
                  </motion.div>

                  {/* 标题 */}
                  <h2 className="text-3xl md:text-4xl font-bold">
                    {t("title")}
                    <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                      {t("subtitle")}
                    </span>
                  </h2>

                  {/* 描述 */}
                  <p className="text-lg text-muted-foreground">
                    {t("description")}
                  </p>

                  {/* 优势列表 */}
                  <ul className="space-y-3">
                    {benefits.map((benefit, index) => {
                      const Icon = benefit.icon;
                      return (
                        <motion.li
                          key={benefit.labelKey}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 text-muted-foreground"
                        >
                          <Icon className={cn("h-5 w-5 shrink-0", benefit.color)} />
                          <span>{t(benefit.labelKey)}</span>
                        </motion.li>
                      );
                    })}
                  </ul>

                  {/* CTA 按钮组 */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <ShimmerButton
                      shimmerColor="#ffffff"
                      shimmerSize="0.05em"
                      shimmerDuration="3s"
                      borderRadius="100px"
                      background="linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)"
                      className="px-8 py-3 text-base font-medium shadow-lg shadow-blue-500/25"
                    >
                      {t("getStarted")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </ShimmerButton>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 text-base font-medium rounded-full border-2 border-border bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all"
                    >
                      {t("learnMore")}
                    </motion.button>
                  </div>

                  {/* 社交证明 - 头像 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 pt-4"
                  >
                    <AvatarCircles
                      numPeople={500000}
                      avatarUrls={avatarUrls}
                      className="justify-start"
                    />
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">4.9/5</span>{" "}
                        {t("from")} 2,000+ {t("reviews")}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* 右侧: 预览卡片 */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* 装饰性光晕 */}
                  <div className="absolute -top-8 -right-8 w-48 h-48 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl -z-10" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl -z-10" />

                  {/* 视频预览卡片 */}
                  <div className="relative rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-sm overflow-hidden">
                    {/* 模拟视频播放器 */}
                    <div className="aspect-video bg-gradient-to-br from-muted/80 to-muted/60 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="relative"
                      >
                        {/* 播放按钮 */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg cursor-pointer">
                          <Video className="h-10 w-10 text-white" />
                        </div>
                        {/* 波纹动画 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 animate-ping opacity-30" />
                      </motion.div>
                    </div>

                    {/* 模拟进度条 */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t("generating")}</span>
                        <span className="font-medium text-primary">100%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "100%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {t("readyIn")} 2-5 {t("minutes")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </BlurFade>

          {/* 评价 Marquee */}
          <BlurFade delay={0.2} inView>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{t("testimonials.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("testimonials.subtitle")}</p>
              </div>

              <Marquee pauseOnHover className="[--duration:30s]">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="w-80 mx-4 p-6 rounded-2xl border border-border bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm mb-4 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                      <div>
                        <p className="text-sm font-medium">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </Marquee>
            </motion.div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
