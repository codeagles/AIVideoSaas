/**
 * Tool Page Layout Component
 *
 * 工具页面统一布局组件
 *
 * 根据工具页面配置动态渲染：
 * - 左侧：生成器面板
 * - 右侧：落地页（未登录）或结果面板（已登录）
 *
 * SEO 友好，支持服务端渲染
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { useCredits } from "@/stores/credits-store";
import { useVideoPolling } from "@/hooks/use-video-polling";
import { useNotificationDeduplication } from "@/hooks/use-notification-deduplication";
import { videoTaskStorage } from "@/lib/video-task-storage";
import { videoHistoryStorage, type VideoHistoryItem } from "@/lib/video-history-storage";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { siteConfig } from "@/config/site";
import type { Video } from "@/db";
import type { ToolPageConfig } from "@/config/tool-pages";
import { GeneratorPanel, type GeneratorData } from "@/components/tool/generator-panel";
import { uploadImage } from "@/lib/video-api";
import { ToolLandingPage } from "@/components/tool/tool-landing-page";
import { VideoHistoryPanel } from "@/components/tool/video-history-panel";
import { toast } from "sonner";

const TOOL_PREFILL_KEY = "videofly_tool_prefill";

// ============================================================================
// Types
// ============================================================================

export interface ToolPageLayoutProps {
  /**
   * 工具页面配置
   */
  config: ToolPageConfig;

  /**
   * 工具路由（用于 SEO 和导航）
   */
  toolRoute: string;

  /**
   * 当前语言
   */
  locale: string;
}

// ============================================================================
// ToolPageLayout Component
// ============================================================================

/**
 * ToolPageLayout - 工具页面布局
 *
 * 处理：
 * - 用户登录状态检测
 * - 视频生成流程
 * - 积分检查
 * - 左右面板布局切换
 *
 * @example
 * ```tsx
 * import { getToolPageConfig } from "@/config/tool-pages";
 *
 * export default function ImageToVideoPage({ params }) {
 *   const config = getToolPageConfig("image-to-video");
 *   return <ToolPageLayout config={config} locale={params.locale} toolRoute="image-to-video" />;
 * }
 * ```
 */
export function ToolPageLayout({
  config,
  toolRoute,
  locale,
}: ToolPageLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { balance, optimisticFreeze, optimisticRelease, invalidate } = useCredits();
  const { openModal } = useUpgradeModal();
  const { shouldNotify, markNotified } = useNotificationDeduplication();
  const videoIdFromQuery = searchParams.get("id");
  const NOTIFICATION_ASKED_KEY = "videofly_notification_asked";
  const tNotify = useTranslations("Notifications");
  const tTool = useTranslations("ToolPage");

  // 状态
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentVideos, setCurrentVideos] = useState<Video[]>([]);
  const [generatingIds, setGeneratingIds] = useState<string[]>([]);
  const [historyItems, setHistoryItems] = useState<VideoHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"generator" | "result">("generator");
  const [prefillData, setPrefillData] = useState<{
    prompt?: string;
    model?: string;
    duration?: number;
    aspectRatio?: string;
    quality?: string;
    imageUrl?: string;
  } | null>(null);

  const addGeneratingId = useCallback((videoId: string) => {
    setGeneratingIds((prev) => (prev.includes(videoId) ? prev : [videoId, ...prev]));
  }, []);

  const removeGeneratingId = useCallback((videoId: string) => {
    setGeneratingIds((prev) => prev.filter((id) => id !== videoId));
  }, []);

  const handleCompleted = useCallback(
    (video: Video) => {
      // 更新历史记录
      videoHistoryStorage.updateHistory(
        video.uuid,
        {
          status: "completed",
          videoUrl: video.videoUrl || undefined,
          thumbnailUrl: video.thumbnailUrl || undefined,
          duration: video.duration || undefined,
        },
        user?.id
      );
      setHistoryItems(videoHistoryStorage.getHistory(user?.id));

      // 更新 currentVideos（兼容旧逻辑）
      setCurrentVideos((prev) => {
        const exists = prev.find((v) => v.uuid === video.uuid);
        if (exists) {
          return prev.map((v) => (v.uuid === video.uuid ? video : v));
        }
        return [video, ...prev];
      });
      removeGeneratingId(video.uuid);
      // 刷新积分（生成成功，积分已结算）
      invalidate();
      if (user?.id) {
        videoTaskStorage.updateTask(
          video.uuid,
          { status: "completed" },
          user.id
        );
      }

      // 通知去重：确保只有一个标签页显示通知
      if (!shouldNotify(video.uuid)) {
        return;
      }

      // 准备提示词（截断过长的提示词）
      const promptPreview = video.prompt?.length > 50
        ? `${video.prompt.slice(0, 50)}...`
        : video.prompt || "";

      // 显示通知（浏览器通知或 toast）
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            new Notification(
              tNotify("videoReadyTitle", { siteName: siteConfig.name }),
              {
                body: tNotify("videoReadyBody", { prompt: promptPreview }),
              }
            );
          } catch (error) {
            console.warn("Notification dispatch failed:", error);
            toast.success(
              tNotify("videoReadyTitle", { siteName: siteConfig.name }),
              {
                description: tNotify("videoReadyBody", { prompt: promptPreview }),
              }
            );
          }
        } else {
          toast.success(
            tNotify("videoReadyTitle", { siteName: siteConfig.name }),
            {
              description: promptPreview
                ? tNotify("videoReadyBody", { prompt: promptPreview })
                : tNotify("videoReadyBodyShort"),
            }
          );
        }
      } else {
        toast.success(
          tNotify("videoReadyTitle", { siteName: siteConfig.name }),
          {
            description: promptPreview
              ? tNotify("videoReadyBody", { prompt: promptPreview })
              : tNotify("videoReadyBodyShort"),
          }
        );
      }

      // 标记为已通知，防止其他标签页重复通知
      markNotified(video.uuid);
    },
    [removeGeneratingId, user?.id, invalidate, tNotify, shouldNotify, markNotified]
  );

  const handleFailed = useCallback(
    ({ videoId, error }: { videoId: string; error?: string }) => {
      // 更新历史记录
      videoHistoryStorage.updateHistory(
        videoId,
        {
          status: "failed",
        },
        user?.id
      );
      setHistoryItems(videoHistoryStorage.getHistory(user?.id));

      // 移除生成 ID
      removeGeneratingId(videoId);
      // 刷新积分（生成失败，积分已释放）
      invalidate();
      if (user?.id) {
        videoTaskStorage.updateTask(
          videoId,
          { status: "failed" },
          user.id
        );
      }
      if (error) {
        toast.error(error);
      }
    },
    [removeGeneratingId, user?.id, invalidate]
  );

  const { startPolling, stopPolling, isPolling } = useVideoPolling({
    onCompleted: handleCompleted,
    onFailed: handleFailed,
  });

  // 检查登录状态
  useEffect(() => {
    authClient.getSession().then((session) => {
      setUser(session?.data?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(TOOL_PREFILL_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setPrefillData({
        prompt: parsed?.prompt,
        model: parsed?.model,
        duration: parsed?.duration,
        aspectRatio: parsed?.aspectRatio,
        quality: parsed?.quality,
        imageUrl: parsed?.imageUrl,
      });
      sessionStorage.removeItem(TOOL_PREFILL_KEY);
    } catch (error) {
      console.warn("Failed to read tool prefill data:", error);
    }
  }, []);

  // 加载历史记录（用户登录时）
  useEffect(() => {
    if (!user?.id) return;

    // 从 localStorage 加载历史记录
    const history = videoHistoryStorage.getHistory(user.id);
    setHistoryItems(history);

    // 可选：从服务器同步最近 20 条视频
    fetch(`/api/v1/video/list?limit=20`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.videos) {
          videoHistoryStorage.syncFromServer(data.data.videos);
          setHistoryItems(videoHistoryStorage.getHistory(user.id));
        }
      })
      .catch((error) => {
        console.warn("Failed to sync video history from server:", error);
      });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const localTasks = videoTaskStorage.getGeneratingTasks(user.id);
    localTasks.forEach((task) => {
      addGeneratingId(task.videoId);
      if (!isPolling(task.videoId)) {
        startPolling(task.videoId);
      }
    });
  }, [user?.id, isPolling, startPolling, addGeneratingId]);

  useEffect(() => {
    if (!user?.id) return;
    if (!videoIdFromQuery) return;

    // 立即添加到历史记录（即使是正在生成中）
    const existingItem = historyItems.find(item => item.uuid === videoIdFromQuery);
    if (!existingItem) {
      const newItem: VideoHistoryItem = {
        uuid: videoIdFromQuery,
        userId: user.id,
        prompt: prefillData?.prompt || "",
        model: prefillData?.model || "",
        status: "generating",
        creditsUsed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      videoHistoryStorage.addHistory(newItem);
      setHistoryItems(videoHistoryStorage.getHistory(user.id));
    }

    setActiveTab("result");
    addGeneratingId(videoIdFromQuery);
    if (!isPolling(videoIdFromQuery)) {
      startPolling(videoIdFromQuery);
    }
  }, [videoIdFromQuery, user?.id, isPolling, startPolling, addGeneratingId, prefillData, historyItems]);

  // SSE: listen for backend completion events
  useEffect(() => {
    if (!user?.id) return;
    if (typeof window === "undefined" || !("EventSource" in window)) return;

    const source = new EventSource("/api/v1/video/events");

    const handleVideoEvent = async (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        const videoId = payload.videoUuid as string;

        if (!videoId) return;
        stopPolling(videoId);

        if (payload.status === "COMPLETED") {
          const res = await fetch(`/api/v1/video/${videoId}`);
          if (!res.ok) return;
          const detail = await res.json();
          handleCompleted(detail.data as Video);
        } else if (payload.status === "FAILED") {
          handleFailed({ videoId, error: payload.error });
        }
      } catch (error) {
        console.warn("SSE event handling failed:", error);
      }
    };

    source.addEventListener("video", handleVideoEvent);

    const handleError = () => {
      source.close();
    };
    source.addEventListener("error", handleError);

    return () => {
      source.removeEventListener("video", handleVideoEvent);
      source.removeEventListener("error", handleError);
      source.close();
    };
  }, [user?.id, handleCompleted, handleFailed, stopPolling]);

  // 处理生成提交
  const handleSubmit = useCallback(async (data: GeneratorData) => {
    // 检查登录
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    // 检查积分
    const requiredCredits = data.estimatedCredits || 0;
    const availableCredits = balance?.availableCredits ?? 0;

    if (availableCredits < requiredCredits) {
      // 打开升级弹窗
      openModal({
        reason: "insufficient_credits",
        requiredCredits,
      });
      return;
    }

    // 乐观更新：立即冻结积分（UI 立即反映变化）
    optimisticFreeze(requiredCredits);

    // 开始提交
    setIsSubmitting(true);

    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        const asked = localStorage.getItem(NOTIFICATION_ASKED_KEY);
        if (!asked && Notification.permission === "default") {
          localStorage.setItem(NOTIFICATION_ASKED_KEY, "1");
          toast.info(tNotify("generationWillNotify"), {
            description: tNotify("notificationDescription"),
            action: {
              label: tNotify("enableNotifications"),
              onClick: () => {
                Notification.requestPermission().catch((error) => {
                  console.warn("Notification permission request failed:", error);
                });
              },
            },
          });
        }
      }
    } catch (error) {
      console.warn("Notification permission request failed:", error);
    }

    try {
      const selectedMode = config.generator.mode || toolRoute;
      const imageUrl = data.imageFile
        ? await uploadImage(data.imageFile)
        : data.imageUrl;
      const imageUrls = imageUrl ? [imageUrl] : undefined;
      const response = await fetch("/api/v1/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: data.prompt,
          model: data.model,
          mode: selectedMode,
          duration: data.duration,
          aspectRatio: data.aspectRatio,
          quality: data.quality,
          outputNumber: 1,
          generateAudio: false,
          imageUrls,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate video");
      }

      const result = await response.json();
      const videoUuid = result.data.videoUuid as string;

      toast.success("Generation started");

      // 添加到历史记录
      videoHistoryStorage.addHistory({
        uuid: videoUuid,
        userId: user.id,
        prompt: data.prompt,
        model: data.model,
        status: "generating",
        creditsUsed: data.estimatedCredits,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setHistoryItems(videoHistoryStorage.getHistory(user.id));

      setActiveTab("result");
      addGeneratingId(videoUuid);
      startPolling(videoUuid);

      if (user?.id) {
        videoTaskStorage.addTask({
          userId: user.id,
          videoId: videoUuid,
          taskId: result.data.taskId,
          prompt: data.prompt,
          model: data.model,
          mode: selectedMode,
          status: "generating",
          createdAt: Date.now(),
          notified: false,
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
      // API 调用失败，回滚乐观更新（释放积分）
      const requiredCredits = data.estimatedCredits || 0;
      optimisticRelease(requiredCredits);
      // 显示错误提示
      toast.error(error instanceof Error ? error.message : "Failed to generate video");
    }
    setIsSubmitting(false);
  }, [
    user,
    locale,
    router,
    balance,
    config.generator.mode,
    toolRoute,
    startPolling,
    addGeneratingId,
    optimisticFreeze,
    optimisticRelease,
    tNotify,
  ]);

  // 处理重新生成
  const handleRegenerate = useCallback(() => {
    setActiveTab("generator");
  }, []);

  // 处理删除视频
  const handleDelete = useCallback(async (uuid: string) => {
    try {
      const response = await fetch(`/api/v1/video/${uuid}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      // 从历史记录中删除
      videoHistoryStorage.removeHistory(uuid, user?.id);
      setHistoryItems(videoHistoryStorage.getHistory(user?.id));

      // 更新 currentVideos（兼容旧逻辑）
      setCurrentVideos((prev) => prev.filter((v) => v.uuid !== uuid));
      toast.success("Video deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete video");
    }
  }, [user?.id]);

  // 处理重试失败的视频
  const handleRetry = useCallback(async (uuid: string) => {
    try {
      const response = await fetch(`/api/v1/video/${uuid}/retry`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to retry video");
      }
      const result = await response.json();
      addGeneratingId(uuid);
      startPolling(uuid);
      setCurrentVideos((prev) =>
        prev.map((v) =>
          v.uuid === uuid ? { ...v, status: "GENERATING", errorMessage: null } : v
        )
      );
      toast.success("Video retry started");
    } catch (error) {
      console.error("Retry error:", error);
      toast.error("Failed to retry video");
    }
  }, [addGeneratingId, startPolling]);

  // 移动端：显示标签导航
  const showMobileTabs = true;

  // Unauthenticated Layout: Scrollable, Tool Area + Landing Page
  if (!user) {
    return (
      <div className="flex flex-1 flex-col lg:flex-row h-full overflow-hidden">
        {/* Mobile Tabs */}
        {showMobileTabs && (
          <div className="lg:hidden flex border-b border-border shrink-0">
            <button
              onClick={() => setActiveTab("generator")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "generator"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tTool("generator")}
            </button>
            <button
              onClick={() => setActiveTab("result")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "result"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tTool("result")}
            </button>
          </div>
        )}

        {/* Desktop Sidebar (Left) is handled by the parent layout wrapper, 
            but here we control the content area to be scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Tool Area Container */}
          <div className="container mx-auto max-w-[1600px] p-6 lg:p-8">
            <div className={`flex flex-col lg:flex-row gap-6 ${activeTab === "generator" ? "" : "lg:flex"}`}>

              {/* Generator Panel Side */}
              <div className={`${activeTab === "generator" ? "block" : "hidden"} lg:block w-full lg:w-[380px] shrink-0`}>
                <GeneratorPanel
                  toolType={toolRoute as "image-to-video" | "text-to-video" | "reference-to-video"}
                  isLoading={isSubmitting}
                  onSubmit={handleSubmit}
                  availableModelIds={config.generator.models.available}
                  defaultModelId={config.generator.models.default}
                  initialPrompt={prefillData?.prompt}
                  initialModelId={prefillData?.model}
                  initialDuration={prefillData?.duration}
                  initialAspectRatio={prefillData?.aspectRatio}
                  initialQuality={prefillData?.quality}
                  initialImageUrl={prefillData?.imageUrl}
                />
              </div>

              {/* Result/Preview Side */}
              <div className={`${activeTab === "result" ? "block" : "hidden"} lg:block flex-1 min-h-[500px] rounded-2xl border border-border bg-muted/20 overflow-hidden relative`}>
                {/* Preview Placeholder for Unauthenticated Users */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted/50 mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Detailed Preview</h3>
                  <p className="text-sm max-w-xs">Login to generate and view your high-quality AI videos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Landing Page Content */}
          <ToolLandingPage
            config={config}
            locale={locale}
          />
        </div>
      </div>
    );
  }

  // Authenticated Layout: Three-column application mode
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden p-4 lg:p-4 gap-6 bg-background">
      {/* Mobile Tabs */}
      {showMobileTabs && (
        <div className="lg:hidden flex border-b border-border mb-4 shrink-0">
          <button
            onClick={() => setActiveTab("generator")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "generator"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tTool("generator")}
          </button>
          <button
            onClick={() => setActiveTab("result")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "result"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tTool("result")}
          </button>
        </div>
      )}

      <div className="grid min-h-0 h-fit max-h-[calc(100svh-120px)] grid-cols-1 lg:grid-cols-[380px_minmax(0,1.2fr)] gap-5">
        {/* Generator Panel */}
        <div
          className={`${activeTab === "generator" ? "flex" : "hidden"
            } lg:flex flex-col h-full min-h-0`}
        >
          <div className="h-full min-h-0 rounded-2xl bg-card/70 p-3">
            <GeneratorPanel
              toolType={toolRoute as "image-to-video" | "text-to-video" | "reference-to-video"}
              isLoading={isSubmitting}
              onSubmit={handleSubmit}
              availableModelIds={config.generator.models.available}
              defaultModelId={config.generator.models.default}
              initialPrompt={prefillData?.prompt}
              initialModelId={prefillData?.model}
              initialDuration={prefillData?.duration}
              initialAspectRatio={prefillData?.aspectRatio}
              initialQuality={prefillData?.quality}
              initialImageUrl={prefillData?.imageUrl}
            />
          </div>
        </div>

        {/* Result Panel */}
        <div
          className={`${activeTab === "result" ? "flex" : "hidden"
            } lg:flex flex-1 h-full min-h-0`}
        >
          <VideoHistoryPanel
            historyItems={historyItems}
            generatingIds={generatingIds}
            onDelete={handleDelete}
            className="h-full min-h-0"
          />
        </div>

      </div>
    </div>
  );
}

export default ToolPageLayout;
