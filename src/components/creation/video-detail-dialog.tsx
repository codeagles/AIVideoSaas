"use client";

// ============================================
// Video Detail Dialog Component
// ============================================

import { useEffect, useRef, useState } from "react";
import { X, Download, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
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
import type { Video } from "@/lib/types/dashboard";

interface VideoDetailDialogProps {
  video: Video | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (uuid: string) => void;
  isDeleting?: boolean;
}

export function VideoDetailDialog({
  video,
  open,
  onClose,
  onDelete,
  isDeleting,
}: VideoDetailDialogProps) {
  const t = useTranslations("dashboard.myCreations");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play video when dialog opens
  useEffect(() => {
    if (open && video?.videoUrl && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play might be blocked by browser
        console.log("Auto-play blocked, user interaction required");
      });
    }
  }, [open, video]);

  // Pause video when dialog closes
  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
    }
  }, [open]);

  if (!video) return null;

  const handleDelete = async () => {
    await onDelete?.(video.uuid);
    setShowDeleteDialog(false);
    onClose();
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

  const normalizedStatus = (video.status || "pending").toLowerCase();
  const statusLabel =
    t(`status.${normalizedStatus}` as "status.completed") || t("status.processing");

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="p-0 overflow-hidden"
          style={{
            width: '75vw',
            maxWidth: '85vw',
            height: '80vh',
          }}
        >
          <DialogTitle className="sr-only">{t("title")}</DialogTitle>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-background"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col lg:flex-row h-full">
            {/* Left: Video Player (~65% for better 16:9 display) */}
            <div className="lg:w-[65%] h-[60vh] lg:h-full bg-black flex items-center justify-center">
              {video.videoUrl ? (
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  controls
                  className="w-full h-full"
                  playsInline
                />
              ) : video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.prompt}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-muted-foreground">No video available</div>
              )}
            </div>

            {/* Right: Video Info (~35%) */}
            <div className="lg:w-[35%] h-[40vh] lg:h-full p-8 space-y-6 overflow-y-auto">
              {/* Status badge */}
              <div>
                <Badge
                  className={
                    normalizedStatus === "completed"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : normalizedStatus === "failed"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  }
                  variant="outline"
                >
                  {statusLabel}
                </Badge>
              </div>

              {/* Model info */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t("detail.model")}</div>
                  <div className="font-medium capitalize">{video.model}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("detail.duration")}</div>
                    <div className="font-medium">{video.duration}s</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">{t("detail.aspectRatio")}</div>
                    <div className="font-medium">{video.aspectRatio}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Prompt */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">{t("detail.prompt")}</div>
                <p className="text-sm leading-relaxed">{video.prompt}</p>
              </div>

              <div className="border-t border-border" />

              {/* Metadata */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("detail.createdAt")}</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("detail.creditsUsed")}</span>
                  <span className="font-medium">{video.creditsUsed}</span>
                </div>
              </div>

              {/* Actions */}
              {normalizedStatus === "completed" && (
                <>
                  <div className="border-t border-border" />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("actions.download")}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("actions.delete")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
