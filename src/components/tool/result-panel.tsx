"use client";

import { useState } from "react";
import { Play, Download, RefreshCw, Sparkles, Trash2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Video } from "@/db";

interface ResultPanelProps {
  currentVideos?: Video[];
  generatingIds?: string[];
  onRegenerate?: () => void;
  onDelete?: (uuid: string) => void;
  onRetry?: (uuid: string) => void;
  className?: string;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    labelKey: "status.completed",
    labelColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  pending: {
    icon: Clock,
    labelKey: "status.pending",
    labelColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  generating: {
    icon: Clock,
    labelKey: "status.generating",
    labelColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  uploading: {
    icon: Clock,
    labelKey: "status.uploading",
    labelColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  failed: {
    icon: AlertCircle,
    labelKey: "status.failed",
    labelColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

export function ResultPanel({
  currentVideos = [],
  generatingIds = [],
  onRegenerate,
  onDelete,
  onRetry,
  className,
}: ResultPanelProps) {
  const tTool = useTranslations("ToolPage");
  const tStatus = useTranslations("dashboard.myCreations.status");
  const tActions = useTranslations("dashboard.myCreations.actions");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);

  const hasItems = currentVideos.length > 0 || generatingIds.length > 0;

  const handleDelete = async (uuid: string) => {
    setIsDeleting(uuid);
    try {
      await onDelete?.(uuid);
    } finally {
      setIsDeleting(null);
      setDeleteDialogOpen(null);
    }
  };

  const handleRetry = async (uuid: string) => {
    setIsRetrying(uuid);
    try {
      await onRetry?.(uuid);
    } finally {
      setIsRetrying(null);
    }
  };

  if (!hasItems) {
    return (
      <div
        className={cn(
          "h-full w-full rounded-2xl border border-border bg-card/70 shadow-md",
          className
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {tTool("exploreTitle")}
          </div>
          <span className="text-xs text-muted-foreground">{tTool("exploreSubtitle")}</span>
        </div>

        <div className="grid h-full gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-muted/30 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Play className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-base font-semibold text-foreground">{tTool("emptyTitle")}</div>
                <div className="text-sm text-muted-foreground">{tTool("emptySubtitle")}</div>
              </div>
            </div>
            <div className="mt-6 text-xs uppercase tracking-wide text-muted-foreground">
              {tTool("promptIdeas")}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {[tTool("promptExample1"), tTool("promptExample2"), tTool("promptExample3")].map((text) => (
                <div
                  key={text}
                  className="rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground/90"
                >
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {tTool("tipsTitle")}
            </div>
            <ul className="mt-3 space-y-2 text-sm text-foreground/90">
              <li>{tTool("tipsLine1")}</li>
              <li>{tTool("tipsLine2")}</li>
              <li>{tTool("tipsLine3")}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full w-full rounded-2xl border border-border bg-card/70 shadow-md overflow-hidden flex flex-col",
        className
      )}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          {tTool("resultTitle")}
        </div>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-muted/30 text-foreground hover:bg-muted/50 transition-all"
          >
            <RefreshCw className="h-3 w-3" />
            {tTool("newGeneration")}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* Generating videos */}
          {generatingIds.map((videoId) => (
            <div
              key={`generating-${videoId}`}
              className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col justify-between min-h-[220px]"
            >
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {tStatus("generating")}
                </Badge>
                <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
              <div className="pt-6 text-sm text-foreground/90">
                {tTool("generatingHint")}
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate mt-2">
                {videoId.slice(0, 8)}...
              </div>
            </div>
          ))}

          {/* Current videos */}
          {currentVideos.map((video) => {
            const videoSrc = video.videoUrl || "";
            const normalizedStatus = (video.status || "pending").toLowerCase() as keyof typeof statusConfig;
            const config = statusConfig[normalizedStatus] || statusConfig.pending;
            const StatusIcon = config.icon;

            const isCompleted = normalizedStatus === "completed";
            const isFailed = normalizedStatus === "failed";
            const isProcessing = normalizedStatus === "pending" || normalizedStatus === "generating" || normalizedStatus === "uploading";

            return (
              <div
                key={video.uuid}
                className="rounded-xl border border-border bg-background/80 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-video bg-black">
                  {videoSrc ? (
                    <video
                      src={videoSrc}
                      controls
                      className="w-full h-full object-contain"
                      poster={video.thumbnailUrl || undefined}
                    />
                  ) : video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.prompt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <StatusIcon className={cn("h-10 w-10", isFailed ? "text-rose-500" : "text-muted-foreground")} />
                    </div>
                  )}

                  {/* Status badge overlay */}
                  <div className="absolute top-2 left-2">
                    <Badge className={config.labelColor} variant="outline">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {tStatus(config.labelKey as "status.completed")}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Model & metadata */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{video.model || "N/A"}</span>
                    <span>•</span>
                    <span>{video.duration || 0}s</span>
                    {video.aspectRatio && (
                      <>
                        <span>•</span>
                        <span>{video.aspectRatio}</span>
                      </>
                    )}
                  </div>

                  {/* Prompt */}
                  <p className="text-sm text-foreground line-clamp-2">
                    "{video.prompt || ""}"
                  </p>

                  {/* Error message for failed videos */}
                  {isFailed && video.errorMessage && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 line-clamp-2 bg-rose-500/10 px-2 py-1 rounded">
                      {(() => {
                        try {
                          const parsed = JSON.parse(video.errorMessage);
                          return parsed.error?.message || parsed.message || video.errorMessage;
                        } catch {
                          return video.errorMessage;
                        }
                      })()}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Download - completed only */}
                    {isCompleted && (
                      <a
                        href={videoSrc || "#"}
                        download
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center",
                          videoSrc
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted/30 text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {tActions("download")}
                      </a>
                    )}

                    {/* Retry - failed only */}
                    {isFailed && onRetry && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 h-8 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                        onClick={() => handleRetry(video.uuid)}
                        disabled={isRetrying === video.uuid}
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5 mr-1", isRetrying === video.uuid && "animate-spin")} />
                        {tActions("retry")}
                      </Button>
                    )}

                    {/* Delete - completed or failed */}
                    {(isCompleted || isFailed) && onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300"
                        onClick={() => setDeleteDialogOpen(video.uuid)}
                        disabled={isDeleting === video.uuid}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    {/* Processing indicator */}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        {tStatus("processing")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete confirmation dialog */}
                <AlertDialog open={deleteDialogOpen === video.uuid} onOpenChange={(open) => !open && setDeleteDialogOpen(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{tActions("deleteConfirm.title")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {tActions("deleteConfirm.message")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tActions("deleteConfirm.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(video.uuid)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {tActions("deleteConfirm.confirm")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
