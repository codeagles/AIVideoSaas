/**
 * Video History Storage
 *
 * 全局视频历史记录存储系统
 * - 跨所有工具页共享（text-to-video, image-to-video, reference-to-video）
 * - 最多保存 20 条记录
 * - 按时间排序：最旧的在最上面，最新的在最下面
 * - 持久化到 localStorage
 */

import type { Video } from "@/db";

// ============================================================================
// Types
// ============================================================================

export type VideoHistoryStatus = "generating" | "completed" | "failed";

export interface VideoHistoryItem {
  uuid: string;
  userId: string;
  prompt: string;
  model: string;
  status: VideoHistoryStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  aspectRatio?: string;
  creditsUsed: number;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

interface VideoHistoryStorageData {
  items: VideoHistoryItem[];
  lastSyncAt?: string;
}

// ============================================================================
// VideoHistoryStorage Class
// ============================================================================

class VideoHistoryStorage {
  private readonly STORAGE_KEY = "videofly_video_history";
  private readonly MAX_ITEMS = 20;

  /**
   * 获取存储键
   */
  private getStorageKey(userId?: string): string {
    return `${this.STORAGE_KEY}:${userId ?? "anon"}`;
  }

  /**
   * 获取所有历史记录（已排序：最旧在上，最新在下）
   */
  getHistory(userId?: string): VideoHistoryItem[] {
    if (typeof window === "undefined") return [];

    const data = this.getStorageData(userId);
    return this.sortItems(data.items);
  }

  /**
   * 添加历史记录
   * - 自动去重（如果 uuid 已存在，则更新）
   * - 自动限制 20 条（超出时删除最旧的）
   */
  addHistory(item: VideoHistoryItem): void {
    const items = this.getHistory(item.userId);

    // 去重：移除已存在的同 uuid 记录
    const filtered = items.filter((i) => i.uuid !== item.uuid);

    // 添加新记录
    filtered.push(item);

    // 排序并限制 20 条
    const sorted = this.sortItems(filtered);
    const limited = sorted.slice(-this.MAX_ITEMS); // 保留最新的 20 条

    this.saveHistory(limited, item.userId);
  }

  /**
   * 更新历史记录
   */
  updateHistory(uuid: string, updates: Partial<VideoHistoryItem>, userId?: string): void {
    const items = this.getHistory(userId);
    const index = items.findIndex((t) => t.uuid === uuid);

    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveHistory(items, userId);
    }
  }

  /**
   * 删除历史记录
   */
  removeHistory(uuid: string, userId?: string): void {
    const items = this.getHistory(userId).filter((t) => t.uuid !== uuid);
    this.saveHistory(items, userId);
  }

  /**
   * 清空所有历史记录
   */
  clearHistory(userId?: string): void {
    this.saveHistory([], userId);
  }

  /**
   * 从服务器同步历史记录
   * - 合并服务器数据和本地数据
   * - 去重并限制 20 条
   * - 排除已删除的视频（isDeleted = true）
   */
  syncFromServer(videos: Video[]): void {
    if (!videos.length) return;

    // 过滤掉已删除的视频
    const activeVideos = videos.filter((v) => !v.isDeleted);

    if (!activeVideos.length) return;

    const userId = activeVideos[0].userId;

    // 将服务器数据转换为历史记录格式
    const serverItems: VideoHistoryItem[] = activeVideos.map((v) => ({
      uuid: v.uuid,
      userId: v.userId,
      prompt: v.prompt,
      model: v.model,
      status: this.normalizeStatus(v.status),
      videoUrl: v.videoUrl || undefined,
      thumbnailUrl: v.thumbnailUrl || undefined,
      duration: v.duration || undefined,
      aspectRatio: v.aspectRatio || undefined,
      creditsUsed: v.creditsUsed,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));

    // 合并本地和服务器数据
    const localItems = this.getHistory(userId);

    // 创建服务器视频的映射
    const serverMap = new Map<string, VideoHistoryItem>();
    serverItems.forEach((item) => serverMap.set(item.uuid, item));

    // 过滤本地数据：保留本地存在但服务器不存在的（可能是生成中的），或者服务器存在的
    const filteredLocal = localItems.filter((localItem) => {
      // 如果服务器有这个视频，使用服务器的版本
      if (serverMap.has(localItem.uuid)) {
        return false; // 将使用服务器版本
      }
      // 如果服务器没有这个视频，可能是新生成的，保留
      return true;
    });

    // 合并
    const merged = [...filteredLocal, ...serverItems];

    // 排序并限制 20 条
    const sorted = this.sortItems(merged);
    const limited = sorted.slice(-this.MAX_ITEMS);

    this.saveHistory(limited, userId);
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  /**
   * 获取存储数据
   */
  private getStorageData(userId?: string): VideoHistoryStorageData {
    if (typeof window === "undefined") {
      return { items: [] };
    }

    const data = localStorage.getItem(this.getStorageKey(userId));
    if (!data) return { items: [] };

    try {
      const parsed = JSON.parse(data) as VideoHistoryStorageData;
      // 清理过期数据（30 天）
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const validItems = parsed.items.filter(
        (item) => new Date(item.createdAt).getTime() > thirtyDaysAgo
      );
      return { ...parsed, items: validItems };
    } catch {
      return { items: [] };
    }
  }

  /**
   * 保存历史记录
   */
  private saveHistory(items: VideoHistoryItem[], userId?: string): void {
    if (typeof window === "undefined") return;

    const data: VideoHistoryStorageData = {
      items,
      lastSyncAt: new Date().toISOString(),
    };

    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(data));
  }

  /**
   * 排序：最旧的在最上面，最新的在最下面
   */
  private sortItems(items: VideoHistoryItem[]): VideoHistoryItem[] {
    return items.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  /**
   * 标准化状态（从服务器状态转换为历史记录状态）
   */
  private normalizeStatus(status: string): VideoHistoryStatus {
    const normalized = status.toLowerCase();
    if (normalized === "completed" || normalized === "completed") return "completed";
    if (normalized === "failed") return "failed";
    return "generating";
  }
}

// ============================================================================
// Export Singleton
// ============================================================================

export const videoHistoryStorage = new VideoHistoryStorage();
