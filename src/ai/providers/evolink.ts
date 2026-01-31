import type {
  AIVideoProvider,
  VideoGenerationParams,
  VideoTaskResponse,
} from "../types";
import {
  getProviderModelId,
  transformParamsForProvider,
} from "../model-mapping";

export class EvolinkProvider implements AIVideoProvider {
  name = "evolink";
  supportImageToVideo = true; // evolink supports image-to-video
  private apiKey: string;
  private baseUrl = "https://api.evolink.ai/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createTask(params: VideoGenerationParams): Promise<VideoTaskResponse> {
    const internalModelId = params.model || "sora-2";
    const providerModelId = getProviderModelId(
      internalModelId,
      "evolink",
      params
    );
    const transformedParams = transformParamsForProvider(
      internalModelId,
      "evolink",
      params
    );

    const response = await fetch(`${this.baseUrl}/videos/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...transformedParams,
        model: providerModelId,
      }),
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.error?.message || error.message || errorMessage;
      } catch {
        // If parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    return {
      taskId: data.id,
      provider: "evolink",
      status: this.mapStatus(data.status),
      progress: data.progress,
      estimatedTime: data.task_info?.estimated_time,
      raw: data,
    };
  }

  async getTaskStatus(taskId: string): Promise<VideoTaskResponse> {
    const response = await fetch(
      `${this.baseUrl}/tasks/${taskId}`,
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Handle task not found (404) or gone (410)
      if (response.status === 404 || response.status === 410) {
        return {
          taskId,
          provider: "evolink",
          status: "failed",
          error: {
            code: "TASK_NOT_FOUND",
            message: errorText || "Task not found or expired",
          },
        };
      }
      // Handle rate limiting (429)
      if (response.status === 429) {
        throw new Error(
          `Rate limit exceeded. Please retry later. ${errorText}`
        );
      }
      // Handle unauthorized (401) or forbidden (403)
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Authentication failed. Check your API key. ${errorText}`
        );
      }
      // Generic error
      throw new Error(
        `Failed to get task status (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();

    // According to Evolink API docs, video URL is in results array
    const videoUrl = Array.isArray(data.results)
      ? data.results[0]
      : data.data?.video_url;

    return {
      taskId: data.id,
      provider: "evolink",
      status: this.mapStatus(data.status),
      progress: data.progress,
      videoUrl: videoUrl,
      thumbnailUrl: data.data?.thumbnail_url,
      error: data.error,
      raw: data,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseCallback(payload: any): VideoTaskResponse {
    // According to Evolink API docs, callback format matches task query format
    const videoUrl = Array.isArray(payload.results)
      ? payload.results[0]
      : payload.data?.video_url;

    return {
      taskId: payload.id,
      provider: "evolink",
      status: this.mapStatus(payload.status),
      progress: payload.progress,
      videoUrl: videoUrl,
      thumbnailUrl: payload.data?.thumbnail_url,
      error: payload.error,
      raw: payload,
    };
  }

  private mapStatus(status: string): VideoTaskResponse["status"] {
    const map: Record<string, VideoTaskResponse["status"]> = {
      pending: "pending",
      processing: "processing",
      completed: "completed",
      failed: "failed",
      cancelled: "failed",
    };
    return map[status] || "pending";
  }
}
