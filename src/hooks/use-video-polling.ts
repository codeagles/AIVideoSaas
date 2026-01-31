import { useRef, useCallback, useEffect } from "react";
import type { Video } from "@/db";

interface UseVideoPollingOptions {
  pollInterval?: number;
  onCompleted?: (video: Video) => void;
  onFailed?: (args: { videoId: string; error?: string }) => void;
}

export function useVideoPolling(options: UseVideoPollingOptions = {}) {
  const { pollInterval = 15000, onCompleted, onFailed } = options;

  const pollingIntervals = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map()
  );

  const fetchVideoDetail = useCallback(async (videoId: string) => {
    const detailResponse = await fetch(`/api/v1/video/${videoId}`);
    if (!detailResponse.ok) {
      throw new Error("Failed to fetch video detail");
    }
    const detailResult = await detailResponse.json();
    return detailResult.data as Video;
  }, []);

  const stopPolling = useCallback((videoId: string) => {
    const intervalId = pollingIntervals.current.get(videoId);
    if (intervalId) {
      clearInterval(intervalId);
      pollingIntervals.current.delete(videoId);
    }
  }, []);

  const startPolling = useCallback(
    (videoId: string) => {
      if (!videoId) return;

      if (pollingIntervals.current.has(videoId)) {
        stopPolling(videoId);
      }

      const pollStatus = async () => {
        try {
          const response = await fetch(`/api/v1/video/${videoId}/status`);
          if (!response.ok) {
            throw new Error("Failed to fetch video status");
          }

          const result = await response.json();
          const status = result?.data?.status;
          const error = result?.data?.error;

          if (status === "COMPLETED") {
            try {
              const video = await fetchVideoDetail(videoId);
              stopPolling(videoId);
              onCompleted?.(video);
            } catch (detailError) {
              console.error("Failed to fetch completed video:", detailError);
              stopPolling(videoId);
              onFailed?.({ videoId, error: "Failed to fetch video detail" });
            }
          } else if (status === "FAILED") {
            stopPolling(videoId);
            onFailed?.({ videoId, error });
          }
        } catch (pollError) {
          console.error("Polling error:", pollError);
        }
      };

      pollStatus();
      const intervalId = setInterval(pollStatus, pollInterval);
      pollingIntervals.current.set(videoId, intervalId);
    },
    [pollInterval, onCompleted, onFailed, fetchVideoDetail, stopPolling]
  );

  const stopAllPolling = useCallback(() => {
    pollingIntervals.current.forEach((intervalId) => clearInterval(intervalId));
    pollingIntervals.current.clear();
  }, []);

  const isPolling = useCallback((videoId: string) => {
    return pollingIntervals.current.has(videoId);
  }, []);

  useEffect(() => {
    return () => stopAllPolling();
  }, [stopAllPolling]);

  return {
    startPolling,
    stopPolling,
    stopAllPolling,
    isPolling,
  };
}
