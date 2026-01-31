/**
 * Video History Panel
 *
 * 视频历史记录面板组件
 * - 显示最近 10 条视频记录
 * - 按时间排序：最旧的在最上面，最新的在最下面
 * - 空状态：显示示例视频占位
 * - 替代现有的 ResultPanel
 */

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { VideoHistoryCard } from "./video-history-card";
import { DemoVideos } from "./demo-videos";
import type { VideoHistoryItem } from "@/lib/video-history-storage";

interface VideoHistoryPanelProps {
  historyItems: VideoHistoryItem[];
  generatingIds?: string[];
  onDelete?: (uuid: string) => void;
  className?: string;
}

export function VideoHistoryPanel({
  historyItems,
  generatingIds = [],
  onDelete,
  className,
}: VideoHistoryPanelProps) {
  const t = useTranslations("VideoHistory");
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 只显示最近10个视频（最新的10个）
  // 排序：最旧的在上面，最新的在下面
  const recentItems = [...historyItems]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-10);  // 取最后10个（最新的10个）

  // 滚动到底部（显示最新的视频）
  useEffect(() => {
    if (scrollRef.current && recentItems.length > 0) {
      // 延迟执行，确保 DOM 已经渲染
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,  // 滚动到底部
          behavior: "smooth",
        });
      }, 100);
    }
  }, [recentItems.length]);

  const hasItems = historyItems.length > 0;

  return (
    <div
      className={cn(
        "h-full w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden flex flex-col",
        className
      )}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-purple-500" />
          {hasItems ? t("title") : t("demoTitle")}
        </div>
        {hasItems && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("my-creations")}
            className="h-7 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            More Creations
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>

      {/* 内容区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {!hasItems ? (
          // 空状态：显示示例视频
          <div className="h-full flex flex-col justify-center">
            <DemoVideos />
          </div>
        ) : (
          // 有历史记录：显示列表（最近10个）
          <div className="space-y-4">
            {recentItems.map((video) => {
              const isGenerating = generatingIds.includes(video.uuid);
              return (
                <VideoHistoryCard
                  key={video.uuid}
                  video={video}
                  isGenerating={isGenerating}
                  onDelete={() => onDelete?.(video.uuid)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
