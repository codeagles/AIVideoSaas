"use client";

// ============================================
// Video Store (Zustand)
// ============================================

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Video, VideoFilterOptions, VideoStatus } from "@/lib/types/dashboard";

interface VideosState {
  // 状态
  videos: Video[];
  filter: VideoFilterOptions;
  hasMore: boolean;
  isLoading: boolean;
  isDeleting: Set<string>;
  error: string | null;

  // 操作
  setVideos: (videos: Video[]) => void;
  addVideos: (videos: Video[]) => void;
  removeVideo: (uuid: string) => void;
  updateVideo: (uuid: string, updates: Partial<Video>) => void;
  setFilter: (filter: Partial<VideoFilterOptions>) => void;
  setLoading: (loading: boolean) => void;
  setDeleting: (uuid: string, isDeleting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  videos: [],
  filter: {
    status: "all",
    model: "all",
    sortBy: "newest",
  } satisfies VideoFilterOptions,
  hasMore: true,
  isLoading: false,
  isDeleting: new Set<string>(),
  error: null,
};

export const useVideosStore = create<VideosState>()(
  devtools(
    (set) => ({
      ...initialState,

      // 设置视频列表（替换）
      setVideos: (videos) => set({ videos }),

      // 添加视频列表（追加）
      addVideos: (newVideos) =>
        set((state) => ({
          videos: [...state.videos, ...newVideos],
          hasMore: newVideos.length > 0,
        })),

      // 删除视频
      removeVideo: (uuid) =>
        set((state) => ({
          videos: state.videos.filter((v) => v.uuid !== uuid),
        })),

      // 更新视频
      updateVideo: (uuid, updates) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.uuid === uuid ? { ...v, ...updates } : v
          ),
        })),

      // 设置筛选条件
      setFilter: (newFilter) =>
        set((state) => ({
          filter: { ...state.filter, ...newFilter },
        })),

      // 设置加载状态
      setLoading: (isLoading) => set({ isLoading }),

      // 设置删除状态
      setDeleting: (uuid, isDeleting) =>
        set((state) => {
          const newSet = new Set(state.isDeleting);
          if (isDeleting) {
            newSet.add(uuid);
          } else {
            newSet.delete(uuid);
          }
          return { isDeleting: newSet };
        }),

      // 设置错误
      setError: (error) => set({ error }),

      // 重置状态
      reset: () => set(initialState),
    }),
    { name: "VideosStore" }
  )
);

// ============================================
// Selectors
// ============================================

/**
 * 获取筛选后的视频列表
 */
export function useFilteredVideos() {
  const videos = useVideosStore((state) => state.videos);
  const filter = useVideosStore((state) => state.filter);

  return videos.filter((video) => {
    // 状态筛选
    if (filter.status && filter.status !== "all") {
      if (video.status !== filter.status) return false;
    }

    // 模型筛选
    if (filter.model && filter.model !== "all") {
      if (video.model !== filter.model) return false;
    }

    return true;
  });
}

/**
 * 获取视频统计
 */
export function useVideoStats() {
  const videos = useVideosStore((state) => state.videos);

  return {
    total: videos.length,
    completed: videos.filter((v) => v.status === "completed").length,
    processing: videos.filter((v) => v.status === "generating" || v.status === "uploading").length,
    failed: videos.filter((v) => v.status === "failed").length,
  };
}

/**
 * 获取指定视频
 */
export function useVideo(uuid: string) {
  const videos = useVideosStore((state) => state.videos);
  return videos.find((v) => v.uuid === uuid);
}
