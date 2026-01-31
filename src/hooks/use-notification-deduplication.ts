import { useEffect, useRef } from "react";

/**
 * useNotificationDeduplication - 跨标签页通知去重
 *
 * 使用 BroadcastChannel API 确保多个标签页中只有一个显示通知
 *
 * @example
 * ```tsx
 * const { shouldNotify, markNotified } = useNotificationDeduplication();
 *
 * useEffect(() => {
 *   if (videoCompleted && shouldNotify(videoId)) {
 *     toast.success("Video ready!");
 *     markNotified(videoId);
 *   }
 * }, [videoCompleted, videoId]);
 * ```
 */
export function useNotificationDeduplication() {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const processingRef = useRef<Set<string>>(new Set());
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 仅在浏览器环境中初始化
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    const channel = new BroadcastChannel("videofly-notifications");
    channelRef.current = channel;

    // 监听其他标签页的消息
    const handleMessage = (event: MessageEvent) => {
      const { type, videoId } = event.data;

      if (type === "claiming" && videoId) {
        // 另一个标签页正在处理这个视频的通知
        // 标记为已处理，防止重复通知
        processingRef.current.add(videoId);
        notifiedRef.current.add(videoId);
      } else if (type === "completed" && videoId) {
        // 另一个标签页已完成通知
        notifiedRef.current.add(videoId);
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);

  /**
   * 检查是否应该显示通知
   * @param videoId 视频 ID
   * @returns 是否应该显示通知
   */
  const shouldNotify = (videoId: string): boolean => {
    // 如果已经通知过，不再重复通知
    if (notifiedRef.current.has(videoId)) {
      return false;
    }

    // 如果另一个标签页正在处理，不重复通知
    if (processingRef.current.has(videoId)) {
      return false;
    }

    // 标记为正在处理
    processingRef.current.add(videoId);

    // 通过 BroadcastChannel 声明正在处理
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({
          type: "claiming",
          videoId,
        });
      } catch (error) {
        // Channel 已关闭，忽略错误
        console.warn("BroadcastChannel closed, unable to send claiming message");
      }
    }

    return true;
  };

  /**
   * 标记视频已通知
   * @param videoId 视频 ID
   */
  const markNotified = (videoId: string) => {
    notifiedRef.current.add(videoId);

    // 通过 BroadcastChannel 通知其他标签页
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({
          type: "completed",
          videoId,
        });
      } catch (error) {
        // Channel 已关闭，忽略错误
        console.warn("BroadcastChannel closed, unable to send completed message");
      }
    }
  };

  /**
   * 重置指定视频的通知状态（用于重试等场景）
   * @param videoId 视频 ID
   */
  const resetNotification = (videoId: string) => {
    processingRef.current.delete(videoId);
    notifiedRef.current.delete(videoId);
  };

  /**
   * 清理所有通知状态
   */
  const clearAll = () => {
    processingRef.current.clear();
    notifiedRef.current.clear();
  };

  return {
    shouldNotify,
    markNotified,
    resetNotification,
    clearAll,
  };
}
