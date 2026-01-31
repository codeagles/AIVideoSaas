/**
 * Video History Card
 *
 * 单个视频历史记录卡片
 * - 生成中：显示元数据标签 + 进度面板
 * - 已完成：显示缩略图 + 标题 + 时间 + 复制按钮
 * - 失败：显示错误信息
 */

import { useTranslations } from "next-intl";
import { Copy, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/components/ui";
import { Button } from "@/components/ui/button";
import type { VideoHistoryItem } from "@/lib/video-history-storage";
import { toast } from "sonner";

interface VideoHistoryCardProps {
  video: VideoHistoryItem;
  isGenerating?: boolean;
  onDelete?: () => void;
}

export function VideoHistoryCard({
  video,
  isGenerating = false,
  onDelete,
}: VideoHistoryCardProps) {
  const t = useTranslations("VideoHistory");

  const isCompleted = video.status === "completed";
  const isFailed = video.status === "failed";

  // 格式化时间（显示日期和时间）
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      // 今天的视频只显示时间
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      // 其他日期显示日期和时间
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  };

  // 复制提示词
  const handleCopyPrompt = () => {
    if (video.prompt) {
      navigator.clipboard.writeText(video.prompt);
      toast.success("Prompt copied to clipboard");
    }
  };

  // 元数据标签
  const renderMetadata = () => {
    return (
      <div className="flex items-center flex-wrap gap-2 text-xs text-zinc-500 mt-2">
        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
          {video.model}
        </span>
        {video.aspectRatio && (
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {video.aspectRatio}
          </span>
        )}
        {video.duration && (
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {video.duration}s
          </span>
        )}
      </div>
    );
  };

  // 生成中状态
  if (isGenerating || video.status === "generating") {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
        {/* 顶部行：Prompt + 发起时间 */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-white font-medium line-clamp-1 flex-1">
            {video.prompt || "Untitled"}
          </p>
          <span className="text-xs text-zinc-500 ml-2">
            {formatTime(video.createdAt)}
          </span>
        </div>

        {/* 进度面板：矩形框 + 加载动画 */}
        <div className="bg-zinc-800/50 rounded-lg p-6">
          <div className="flex items-center justify-center gap-3 text-sm text-white">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>{t("generating")}</span>
          </div>
        </div>

        {/* 元数据标签 */}
        {renderMetadata()}
      </div>
    );
  }

  // 已完成状态
  if (isCompleted) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {/* 视频缩略图 */}
        <div className="relative aspect-video bg-black">
          {video.videoUrl ? (
            <video
              src={video.videoUrl}
              className="w-full h-full object-cover"
              poster={video.thumbnailUrl || undefined}
              controls
            />
          ) : video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.prompt}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-zinc-600" />
            </div>
          )}
        </div>

        {/* 卡片内容 */}
        <div className="p-4 space-y-3">
          {/* 顶部行：标题 + 时间 + 复制提示词 */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-white font-medium line-clamp-1 flex-1">
              {video.prompt || "Untitled"}
            </p>
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="text-xs">{formatTime(video.createdAt)}</span>
              {video.prompt && (
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="p-1 hover:text-zinc-300 transition-colors"
                  title="Copy prompt"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 元数据标签 */}
          {renderMetadata()}
        </div>
      </div>
    );
  }

  // 失败状态
  if (isFailed) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
        {/* 失败图标和提示 */}
        <div className="flex items-center gap-3 text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t("generationFailed")}</p>
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              {video.prompt || "Unknown error"}
            </p>
          </div>
        </div>

        {/* 元数据标签 */}
        {renderMetadata()}

        {/* 删除按钮 */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="w-full h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            {t("removeFromHistory")}
          </Button>
        )}
      </div>
    );
  }

  return null;
}
