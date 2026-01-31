"use client";

// ============================================
// My Creations Page
// ============================================

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useVideos } from "@/hooks/use-videos";
import { useRefreshProcessingVideos } from "@/hooks/use-videos";
import {
  CreationCard,
  CreationGrid,
  CreationFilter,
  CreationEmpty,
  CreationSkeleton,
  VideoDetailDialog,
} from "@/components/creation";
import type { Video, VideoFilterOptions } from "@/lib/types/dashboard";

interface MyCreationsPageProps {
  locale: string;
}

export function MyCreationsPage({ locale }: MyCreationsPageProps) {
  const t = useTranslations("dashboard.myCreations");

  // Filter state
  const [filter, setFilter] = useState<VideoFilterOptions>({
    status: "all",
    model: "all",
    sortBy: "newest",
  });

  // Selected video for detail dialog
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Fetch videos
  const {
    videos,
    isLoading,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
    deleteVideo,
    isDeleting,
    refetch,
  } = useVideos(filter);

  // Auto-refresh processing videos
  useRefreshProcessingVideos(videos, refetch);

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const current = observerTarget.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [hasMore, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = (newFilter: Partial<VideoFilterOptions>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const handleVideoClick = (uuid: string) => {
    const video = videos.find((v) => v.uuid === uuid);
    if (video) {
      setSelectedVideo(video);
    }
  };

  const handleCloseDialog = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {videos.length} {videos.length === 1 ? "creation" : "creations"}
          </p>
        </div>

        {/* Filter */}
        <CreationFilter filter={filter} onFilterChange={handleFilterChange} />
      </div>

      {/* Content */}
      {isLoading ? (
        <CreationSkeleton />
      ) : videos.length === 0 ? (
        <CreationEmpty />
      ) : (
        <>
          <CreationGrid>
            {videos.map((video) => (
              <CreationCard
                key={video.uuid}
                video={video}
                onClick={handleVideoClick}
                onDelete={deleteVideo}
                isDeleting={isDeleting}
              />
            ))}
          </CreationGrid>

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={observerTarget} className="py-4 text-center text-sm text-muted-foreground">
              {isFetchingNextPage ? "Loading..." : ""}
            </div>
          )}
        </>
      )}

      {/* Video Detail Dialog */}
      <VideoDetailDialog
        video={selectedVideo}
        open={!!selectedVideo}
        onClose={handleCloseDialog}
        onDelete={deleteVideo}
        isDeleting={isDeleting}
      />
    </div>
  );
}
