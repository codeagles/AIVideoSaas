"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Zap, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  VideoGeneratorInput,
  type SubmitData,
  DEFAULT_CONFIG,
  DEFAULT_DEFAULTS,
} from "@/components/video-generator";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Meteors } from "@/components/magicui/meteors";
import { cn } from "@/components/ui";
import { authClient } from "@/lib/auth/client";
import { calculateModelCredits, getAvailableModels } from "@/config/credits";
import { uploadImage } from "@/lib/video-api";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { videoTaskStorage } from "@/lib/video-task-storage";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PENDING_PROMPT_KEY = "videofly_pending_prompt";
const PENDING_IMAGE_KEY = "videofly_pending_image";
const NOTIFICATION_ASKED_KEY = "videofly_notification_asked";
const TOOL_PREFILL_KEY = "videofly_tool_prefill";

/**
 * Hero Section - 视频生成器优先设计
 *
 * 设计模式: Video-First Hero with Glassmorphism
 * - Hero 区域直接集成视频生成组件
 * - Glassmorphism 风格: 背景模糊、透明层、微妙边框
 * - Magic UI 动画组件增强交互体验
 */
export function HeroSection() {
  const t = useTranslations("Hero");
  const tNotify = useTranslations("Notifications");
  const locale = useLocale();
  const router = useRouter();
  const signInModal = useSigninModal();
  const { data: session } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<SubmitData | null>(null);

  const generatorConfig = useMemo(() => {
    const availableIds = new Set(getAvailableModels().map((model) => model.id));
    const filteredVideoModels = DEFAULT_CONFIG.videoModels.filter((model) => availableIds.has(model.id));
    return {
      ...DEFAULT_CONFIG,
      videoModels: filteredVideoModels.length > 0 ? filteredVideoModels : DEFAULT_CONFIG.videoModels,
    };
  }, []);

  const generatorDefaults = useMemo(() => {
    const preferredModel = generatorConfig.videoModels[0]?.id ?? DEFAULT_DEFAULTS.videoModel;
    return {
      ...DEFAULT_DEFAULTS,
      videoModel: preferredModel,
    };
  }, [generatorConfig.videoModels]);

  const defaultDuration = useMemo(() => {
    const rawDuration = generatorDefaults.duration ?? generatorConfig.durations?.[0];
    if (!rawDuration) return 10;
    const parsed = Number.parseInt(String(rawDuration), 10);
    return Number.isNaN(parsed) ? 10 : parsed;
  }, [generatorDefaults.duration, generatorConfig.durations]);

  const normalizeMode = (mode?: string) => {
    if (!mode) return "text-to-video";
    switch (mode) {
      case "text-image-to-video":
        return "text-to-video";
      case "t2v":
        return "text-to-video";
      case "i2v":
        return "image-to-video";
      case "r2v":
        return "reference-to-video";
      default:
        return mode;
    }
  };

  const parseDuration = (duration?: string | number) => {
    if (typeof duration === "number") return duration;
    if (!duration) return undefined;
    const parsed = Number.parseInt(duration, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const calculateCredits = useCallback((params: {
    type: "video" | "image";
    model: string;
    outputNumber: number;
    duration?: string;
    resolution?: string;
  }) => {
    if (params.type !== "video") return 0;
    const parsedDuration = parseDuration(params.duration) ?? defaultDuration;
    const baseCredits = calculateModelCredits(params.model, {
      duration: parsedDuration,
      quality: params.resolution,
    });
    return baseCredits * params.outputNumber;
  }, [defaultDuration, parseDuration]);

  const resolveImageUrls = async (data: SubmitData) => {
    if (data.images && data.images.length > 0) {
      return Promise.all(data.images.map((file) => uploadImage(file)));
    }
    return data.imageUrls;
  };

  const getToolRouteByMode = (mode: string) => {
    const normalized = normalizeMode(mode);
    switch (normalized) {
      case "image-to-video":
      case "i2v":
        return "image-to-video";
      case "reference-to-video":
      case "r2v":
        return "reference-to-video";
      case "text-to-video":
      case "t2v":
      default:
        return "text-to-video";
    }
  };

  const processSubmission = async (data: SubmitData) => {
    setIsSubmitting(true);
    try {
      const normalizedMode = normalizeMode(data.mode);
      const shouldIncludeImages = normalizedMode !== "text-to-video";
      const resolvedImageUrls = shouldIncludeImages ? await resolveImageUrls(data) : undefined;
      const response = await fetch("/api/v1/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: data.prompt,
          model: data.model,
          mode: normalizedMode,
          duration: parseDuration(data.duration),
          aspectRatio: data.aspectRatio,
          quality: data.quality ?? data.resolution,
          outputNumber: data.outputNumber,
          generateAudio: data.generateAudio,
          imageUrls: shouldIncludeImages ? resolvedImageUrls : undefined,
          // Keep compatibility for providers that only expect a single image
          imageUrl: shouldIncludeImages ? resolvedImageUrls?.[0] : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error?.message || "Failed to generate video");
      }

      const result = await response.json();
      const toolRoute = getToolRouteByMode(normalizedMode);
      toast.success("Generation started");
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            TOOL_PREFILL_KEY,
            JSON.stringify({
              prompt: data.prompt,
              model: data.model,
              mode: normalizedMode,
              duration: parseDuration(data.duration),
              aspectRatio: data.aspectRatio,
              quality: data.quality ?? data.resolution,
              imageUrl: shouldIncludeImages ? resolvedImageUrls?.[0] : undefined,
            })
          );
        }
      } catch (storageError) {
        console.warn("Failed to store tool prefill data:", storageError);
      }
      if (session?.user?.id) {
        videoTaskStorage.addTask({
          userId: session.user.id,
          videoId: result.data.videoUuid,
          taskId: result.data.taskId,
          prompt: data.prompt,
          model: data.model,
          mode: normalizedMode,
          status: "generating",
          createdAt: Date.now(),
          notified: false,
        });
      }
      router.push(`/${locale}/${toolRoute}?id=${result.data.videoUuid}`);
    } catch (error) {
      console.error("Generation error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate video. Please try again.";
      // Check for common errors and provide helpful messages
      if (message.includes("credits") || message.includes("Credit")) {
        toast.error("Insufficient credits. Please top up and try again.");
      } else if (message.includes("database") || message.includes("DATABASE_URL")) {
        toast.error("Service temporarily unavailable. Please try again later.");
      } else {
        toast.error(message || "Failed to generate video. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setPendingSubmitData(null);
    }
  };

  const handleAllowNotify = () => {
    setShowNotifyDialog(false);
    Notification.requestPermission().then(() => {
      localStorage.setItem(NOTIFICATION_ASKED_KEY, "1");
      if (pendingSubmitData) {
        processSubmission(pendingSubmitData);
      }
    });
  };

  const handleSkipNotify = () => {
    setShowNotifyDialog(false);
    localStorage.setItem(NOTIFICATION_ASKED_KEY, "1");
    if (pendingSubmitData) {
      processSubmission(pendingSubmitData);
    }
  };

  const handleSubmit = async (data: SubmitData) => {
    let activeUser = session?.user ?? null;
    if (!activeUser) {
      try {
        const fresh = await authClient.getSession();
        activeUser = fresh?.data?.user ?? null;
      } catch (error) {
        console.warn("Failed to refresh session:", error);
      }
    }

    if (!activeUser) {
      try {
        sessionStorage.setItem(PENDING_PROMPT_KEY, data.prompt);
        if (data.images?.[0]) {
          const reader = new FileReader();
          reader.onloadend = () => {
            sessionStorage.setItem(PENDING_IMAGE_KEY, reader.result as string);
          };
          reader.readAsDataURL(data.images[0]);
        }
      } catch (error) {
        console.warn("Failed to store pending input:", error);
      }
      signInModal.onOpen();
      return;
    }

    // Check for notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      const asked = localStorage.getItem(NOTIFICATION_ASKED_KEY);
      if (!asked && Notification.permission === "default") {
        setPendingSubmitData(data);
        setShowNotifyDialog(true);
        return;
      }
    }

    processSubmission(data);
  };

  return (
    <section className="relative min-h-screen overflow-hidden pb-20">
      {/* 背景渐变效果 */}
      <div className="absolute inset-0 -z-20">
        {/* 顶部径向渐变 - 天蓝色 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/15 via-background to-background" />
        {/* 底部径向渐变 - 紫色 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-500/10 via-background to-background" />
      </div>

      {/* 动画流星效果 */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Meteors number={15} minDelay={0.5} maxDelay={2} minDuration={3} maxDuration={8} />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col items-center gap-10">
          {/* 标题与说明区域 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center space-y-6 max-w-3xl mx-auto"
          >
            {/* 主标题 */}
            <BlurFade delay={0.1} inView>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {t("title")}
              </h1>
            </BlurFade>

            {/* 描述 */}
            <BlurFade delay={0.2} inView>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("description")}
              </p>
            </BlurFade>

            {/* 特性标签 */}
            <BlurFade delay={0.3} inView className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Zap, label: t("features.fast"), color: "text-yellow-500" },
                { icon: Play, label: t("features.easy"), color: "text-blue-500" },
                { icon: Sparkles, label: t("features.ai"), color: "text-purple-500" },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 dark:bg-black/30 backdrop-blur-sm"
                  >
                    <Icon className={cn("h-4 w-4", feature.color)} />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </motion.div>
                );
              })}
            </BlurFade>
          </motion.div>

          {/* 视频生成器 - 核心组件 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="w-full max-w-4xl mx-auto relative"
          >
            {/* 装饰性光晕效果 */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-3xl -z-10" />

            {/* 视频生成器 - 不需要外层容器，直接使用组件 */}
            <VideoGeneratorInput
              config={generatorConfig}
              defaults={generatorDefaults}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              calculateCredits={calculateCredits}
              onSubmit={handleSubmit}
            />

            {/* 底部提示 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-xs text-muted-foreground mt-4"
            >
              {t("creditsHint")}
            </motion.p>
          </motion.div>
        </div>
      </div>

      <AlertDialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tNotify("enableNotifications")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tNotify("notificationDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipNotify}>{tNotify("maybeLater")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleAllowNotify}>{tNotify("allow")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
