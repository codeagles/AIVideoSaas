"use client";

// ============================================
// Creation Card Component
// ============================================

import { useRef, useState } from "react";
import Link from "next/link";
import { Play, Clock, AlertCircle, MoreHorizontal, Download, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Video } from "@/lib/types/dashboard";

interface CreationCardProps {
  video: Video;
  onClick: (uuid: string) => void;
  onDelete?: (uuid: string) => void;
  isDeleting?: boolean;
}

const statusConfig = {
  completed: {
    icon: Play,
    iconBg: "bg-primary",
    labelKey: "status.completed",
    labelColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  pending: {
    icon: Clock,
    iconBg: "bg-muted",
    labelKey: "status.pending",
    labelColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  generating: {
    icon: Clock,
    iconBg: "bg-muted",
    labelKey: "status.generating",
    labelColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  uploading: {
    icon: Clock,
    iconBg: "bg-muted",
    labelKey: "status.uploading",
    labelColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  failed: {
    icon: AlertCircle,
    iconBg: "bg-destructive/10",
    labelKey: "status.failed",
    labelColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
};

export function CreationCard({
  video,
  onClick,
  onDelete,
  isDeleting,
}: CreationCardProps) {
  const t = useTranslations("dashboard.myCreations");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const normalizedStatus = (video.status || "pending").toLowerCase() as keyof typeof statusConfig;
  const config = statusConfig[normalizedStatus] ?? statusConfig.pending;
  const StatusIcon = config.icon;
  const statusLabel = t(config.labelKey as "status.completed");

  const isProcessing =
    normalizedStatus === "pending" ||
    normalizedStatus === "generating" ||
    normalizedStatus === "uploading";
  const isFailed = normalizedStatus === "failed";
  const isCompleted = normalizedStatus === "completed";

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    await onDelete?.(video.uuid);
  };

  const handleDownload = () => {
    if (video.videoUrl) {
      const link = document.createElement("a");
      link.href = video.videoUrl;
      link.download = `videofly-${video.uuid}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t("actions.downloadSuccess"));
    }
  };

  const handlePreviewStart = () => {
    if (!isCompleted || !video.videoUrl) return;
    const element = videoRef.current;
    if (!element) return;
    element.currentTime = 0;
    element.play().catch(() => {});
  };

  const handlePreviewStop = () => {
    const element = videoRef.current;
    if (!element) return;
    element.pause();
    element.currentTime = 0;
  };

  return (
    <>
      <div
        className={cn(
          "group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg cursor-pointer",
          isDeleting && "opacity-50 pointer-events-none"
        )}
        onClick={() => onClick(video.uuid)}
        onMouseEnter={handlePreviewStart}
        onMouseLeave={handlePreviewStop}
      >
        {/* Thumbnail / Preview */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
          {isCompleted && video.videoUrl ? (
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnailUrl || undefined}
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-contain"
            />
          ) : video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.prompt}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
              <StatusIcon className="h-12 w-12 text-muted-foreground" />
              {isFailed && video.errorMessage && (
                <p className="text-[11px] text-destructive line-clamp-3">
                  {(() => {
                    try {
                      const parsed = JSON.parse(video.errorMessage);
                      return parsed.error?.message || parsed.message || video.errorMessage;
                    } catch {
                      return video.errorMessage;
                    }
                  })()}
                </p>
              )}
            </div>
          )}

          {/* Overlay for completed videos */}
          {isCompleted && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
              </div>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <Badge className={config.labelColor} variant="outline">
              {statusLabel}
            </Badge>
          </div>

          {/* Duration badge (completed only) */}
          {isCompleted && video.duration > 0 && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="bg-black/70 text-white border-0">
                {Math.floor(video.duration)}s
              </Badge>
            </div>
          )}

          {/* Action menu */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isCompleted && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("actions.download")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Card info */}
        <div className="p-2 space-y-1.5">
          {/* Model & Aspect Ratio */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium capitalize">{video.model}</span>
            <span>{video.aspectRatio}</span>
          </div>

          {/* Prompt */}
          <div className="text-xs text-foreground/90 line-clamp-2">
            {video.prompt}
          </div>

          {/* Date */}
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
          </div>

          {/* Error is displayed in the preview area for failed videos */}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm.message")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteConfirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("deleteConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
