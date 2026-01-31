import type {
  AIVideoProvider,
  VideoGenerationParams,
  VideoTaskResponse,
} from "../types";
import {
  getProviderConfig,
  getProviderModelId,
  transformParamsForProvider,
} from "../model-mapping";

export class KieProvider implements AIVideoProvider {
  name = "kie";
  supportImageToVideo = false; // kie only supports text-to-video
  private apiKey: string;
  private baseUrl = "https://api.kie.ai";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createTask(params: VideoGenerationParams): Promise<VideoTaskResponse> {
    const internalModelId = params.model || "sora-2";
    const providerConfig = getProviderConfig(internalModelId, "kie");
    if (!providerConfig?.supported) {
      throw new Error(`Model ${internalModelId} is not supported by KIE`);
    }
    const apiEndpoint = providerConfig.apiEndpoint || "/api/v1/jobs/createTask";

    const providerModelId = getProviderModelId(
      internalModelId,
      "kie",
      params
    );
    const transformedParams = transformParamsForProvider(
      internalModelId,
      "kie",
      params
    );

    const body: Record<string, any> = {
      ...transformedParams,
      model: providerModelId,
    };
    if (params.callbackUrl && body.callBackUrl === undefined) {
      body.callBackUrl = params.callbackUrl;
    }

    const response = await fetch(`${this.baseUrl}${apiEndpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (result.code !== 200) throw new Error(result.msg || "API error");

    return {
      taskId: result.data.taskId,
      provider: "kie",
      status: "pending",
      raw: result,
    };
  }

  async getTaskStatus(taskId: string): Promise<VideoTaskResponse> {
    if (this.isVeoTaskId(taskId)) {
      return this.getVeoTaskStatus(taskId);
    }

    const response = await fetch(
      `${this.baseUrl}/api/v1/jobs/recordInfo?taskId=${taskId}`,
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );

    const result = await response.json();
    if (result.code !== 200) throw new Error(result.msg);

    const data = result.data;
    let videoUrl: string | undefined;

    if (data.state === "success" && data.resultJson) {
      try {
        const parsed = JSON.parse(data.resultJson);
        videoUrl = this.pickFirstUrl(parsed?.resultUrls);
      } catch (error) {
        console.error("Failed to parse KIE resultJson:", error);
      }
    }

    return {
      taskId: data.taskId,
      provider: "kie",
      status: this.mapStatus(data.state),
      videoUrl,
      error: data.failCode
        ? { code: data.failCode, message: data.failMsg }
        : undefined,
      raw: data,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseCallback(payload: any): VideoTaskResponse {
    const data = payload.data || payload;

    if (data?.info?.resultUrls || payload?.data?.info?.resultUrls) {
      return this.parseVeoCallback(payload);
    }

    let videoUrl: string | undefined;

    if (data.state === "success" && data.resultJson) {
      try {
        const parsed = JSON.parse(data.resultJson);
        videoUrl = this.pickFirstUrl(parsed?.resultUrls);
      } catch (error) {
        console.error("Failed to parse KIE resultJson:", error);
      }
    }

    return {
      taskId: data.taskId,
      provider: "kie",
      status: this.mapStatus(data.state),
      videoUrl,
      error: data.failCode
        ? { code: data.failCode, message: data.failMsg }
        : undefined,
      raw: data,
    };
  }

  private mapStatus(state: string): VideoTaskResponse["status"] {
    const map: Record<string, VideoTaskResponse["status"]> = {
      waiting: "pending",
      success: "completed",
      fail: "failed",
    };
    return map[state] || "pending";
  }

  private isVeoTaskId(taskId: string): boolean {
    return taskId.startsWith("veo_task_");
  }

  private pickFirstUrl(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed[0];
        }
      } catch {
        // fall through
      }
    }
    return undefined;
  }

  private mapVeoStatus(flag: number | undefined): VideoTaskResponse["status"] {
    if (flag === 1) return "completed";
    if (flag === 2 || flag === 3) return "failed";
    return "processing";
  }

  private async getVeoTaskStatus(taskId: string): Promise<VideoTaskResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/veo/record-info?taskId=${taskId}`,
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );

    const result = await response.json();
    if (result.code !== 200) throw new Error(result.msg || "API error");

    const data = result.data || {};
    const status = this.mapVeoStatus(data.successFlag);
    const videoUrl = this.pickFirstUrl(data.response?.resultUrls);

    return {
      taskId: data.taskId || taskId,
      provider: "kie",
      status,
      videoUrl,
      error: data.errorMessage
        ? { code: String(data.errorCode || "VEO_ERROR"), message: data.errorMessage }
        : undefined,
      raw: data,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseVeoCallback(payload: any): VideoTaskResponse {
    const data = payload.data || payload;
    const info = data.info || {};
    const videoUrl = this.pickFirstUrl(info.resultUrls);
    const status =
      payload.code === 200 && videoUrl ? "completed" : "failed";

    return {
      taskId: data.taskId,
      provider: "kie",
      status,
      videoUrl,
      error:
        payload.code && payload.code !== 200
          ? { code: String(payload.code), message: payload.msg || "Veo task failed" }
          : undefined,
      raw: payload,
    };
  }
}
