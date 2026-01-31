import { VideoStatus, db, videos } from "@/db";
import { and, desc, eq, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getStorage } from "@/lib/storage";
import { getModelConfig, calculateModelCredits } from "../config/credits";
import { getProvider, type ProviderType, type VideoTaskResponse } from "../ai";
import { creditService } from "./credit";
import { generateSignedCallbackUrl } from "@/ai/utils/callback-signature";
import { emitVideoEvent } from "@/lib/video-events";

export interface GenerateVideoParams {
  userId: string;
  prompt: string;
  model: string; // "sora-2"
  duration?: number;
  aspectRatio?: string; // "16:9" | "9:16"
  quality?: string; // "standard" | "high"
  imageUrl?: string; // image-to-video
  imageUrls?: string[]; // image-to-video (multi-image)
  mode?: string;
  outputNumber?: number;
  generateAudio?: boolean;
}

export interface VideoGenerationResult {
  videoUuid: string;
  taskId: string;
  provider: ProviderType;
  status: string;
  estimatedTime?: number;
  creditsUsed: number;
}

export class VideoService {
  private callbackBaseUrl: string;

  constructor() {
    this.callbackBaseUrl = process.env.AI_CALLBACK_URL || "";
  }

  /**
   * Create video generation task
   */
  async generate(params: GenerateVideoParams): Promise<VideoGenerationResult> {
    const modelConfig = getModelConfig(params.model);
    if (!modelConfig) {
      throw new Error(`Unsupported model: ${params.model}`);
    }

    const effectiveDuration = params.duration || modelConfig.durations[0] || 5;

    const outputNumber = Math.max(1, params.outputNumber ?? 1);
    const creditsRequired = calculateModelCredits(params.model, {
      duration: effectiveDuration,
      quality: params.quality,
    }) * outputNumber;

    const hasImageInput =
      (params.imageUrls && params.imageUrls.length > 0) || Boolean(params.imageUrl);

    if (hasImageInput && !modelConfig.supportImageToVideo) {
      throw new Error(`Model ${params.model} does not support image-to-video`);
    }

    const videoUuid = `vid_${nanoid(21)}`;

    const [videoResult] = await db
      .insert(videos)
      .values({
        uuid: videoUuid,
        userId: params.userId,
        prompt: params.prompt,
        model: params.model,
        parameters: {
          duration: params.duration,
          aspectRatio: params.aspectRatio,
          quality: params.quality,
          outputNumber,
          mode: params.mode,
          imageUrl: params.imageUrl,
          imageUrls: params.imageUrls,
          generateAudio: params.generateAudio,
        },
        status: VideoStatus.PENDING,
        startImageUrl: params.imageUrls?.[0] || params.imageUrl || null,
        creditsUsed: creditsRequired,
        duration: effectiveDuration,
        aspectRatio: params.aspectRatio || null,
        provider: modelConfig.provider,
        updatedAt: new Date(),
      })
      .returning({ uuid: videos.uuid, id: videos.id });

    if (!videoResult) {
      throw new Error("Failed to create video record");
    }

    let freezeResult: { success: boolean; holdId: number };
    try {
      freezeResult = await creditService.freeze({
        userId: params.userId,
        credits: creditsRequired,
        videoUuid: videoResult.uuid,
      });
    } catch (error) {
      await db
        .update(videos)
        .set({
          status: VideoStatus.FAILED,
          errorMessage: String(error),
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoResult.uuid));
      throw error;
    }

    if (!freezeResult.success) {
      await db
        .update(videos)
        .set({
          status: VideoStatus.FAILED,
          errorMessage: `Insufficient credits. Required: ${creditsRequired}`,
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoResult.uuid));
      throw new Error(`Insufficient credits. Required: ${creditsRequired}`);
    }

    // ✅ 支持通过环境变量选择 provider
    // 优先级: 环境变量 > 模型配置
    const defaultProvider = (process.env.DEFAULT_AI_PROVIDER as ProviderType) || modelConfig.provider;
    const provider = getProvider(defaultProvider);

    const callbackUrl = this.callbackBaseUrl
      ? generateSignedCallbackUrl(
        `${this.callbackBaseUrl}/${defaultProvider}`,  // ✅ 使用实际选择的 provider
        videoResult.uuid
      )
      : undefined;

    try {
      const result = await provider.createTask({
        model: params.model,
        prompt: params.prompt,
        duration: effectiveDuration,  // ✅ 使用计算后的时长
        aspectRatio: params.aspectRatio,
        quality: params.quality,
        imageUrl: params.imageUrl,
        imageUrls: params.imageUrls,
        mode: params.mode,
        outputNumber,
        generateAudio: params.generateAudio,
        callbackUrl,
      });

      await db
        .update(videos)
        .set({
          status: VideoStatus.GENERATING,
          externalTaskId: result.taskId,
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoResult.uuid));

      return {
        videoUuid: videoResult.uuid,
        taskId: result.taskId,
        provider: defaultProvider,  // ✅ 返回实际使用的 provider
        status: "GENERATING",
        estimatedTime: result.estimatedTime,
        creditsUsed: creditsRequired,
      };
    } catch (error) {
      await creditService.release(videoResult.uuid);

      await db
        .update(videos)
        .set({
          status: VideoStatus.FAILED,
          errorMessage: String(error),
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoResult.uuid));
      throw error;
    }
  }

  /**
   * Handle AI Callback
   */
  async handleCallback(
    providerType: ProviderType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    videoUuid: string
  ): Promise<void> {
    const provider = getProvider(providerType);
    const result = provider.parseCallback(payload);

    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.uuid, videoUuid))
      .limit(1);

    if (!video) {
      console.error(`Video not found: ${videoUuid}`);
      return;
    }

    if (video.externalTaskId && video.externalTaskId !== result.taskId) {
      console.error(
        `Task ID mismatch: expected ${video.externalTaskId}, got ${result.taskId}`
      );
      return;
    }

    if (result.status === "completed" && result.videoUrl) {
      await this.tryCompleteGeneration(video.uuid, result);
    } else if (result.status === "failed") {
      await this.tryFailGeneration(video.uuid, result.error?.message);
    }
  }

  /**
   * Get task status (for frontend polling)
   */
  async refreshStatus(
    videoUuid: string,
    userId: string
  ): Promise<{
    status: string;
    videoUrl?: string;
    error?: string;
  }> {
    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.uuid, videoUuid), eq(videos.userId, userId)))
      .limit(1);

    if (!video) {
      throw new Error("Video not found");
    }

    if (video.status === VideoStatus.COMPLETED || video.status === VideoStatus.FAILED) {
      return {
        status: video.status,
        videoUrl: video.videoUrl || undefined,
        error: video.errorMessage || undefined,
      };
    }

    if (video.externalTaskId && video.provider) {
      try {
        const provider = getProvider(video.provider as ProviderType);
        const result = await provider.getTaskStatus(video.externalTaskId);

        if (result.status === "completed" && result.videoUrl) {
          const updated = await this.tryCompleteGeneration(video.uuid, result);
          return {
            status: updated.status,
            videoUrl: updated.videoUrl || undefined,
          };
        }

        if (result.status === "failed") {
          const updated = await this.tryFailGeneration(
            video.uuid,
            result.error?.message
          );
          return {
            status: updated.status,
            error: updated.errorMessage || undefined,
          };
        }
        if (result.status === "processing" && video.status === VideoStatus.PENDING) {
          await db
            .update(videos)
            .set({
              status: VideoStatus.GENERATING,
              updatedAt: new Date(),
            })
            .where(eq(videos.uuid, video.uuid));
          return { status: VideoStatus.GENERATING };
        }
      } catch (error) {
        console.error("Failed to refresh status from provider:", error);
      }
    }

    return { status: video.status };
  }

  /**
   * Refresh status by external task id
   */
  async refreshStatusByTaskId(taskId: string, userId: string) {
    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.externalTaskId, taskId), eq(videos.userId, userId)))
      .limit(1);

    if (!video) {
      throw new Error("Video not found");
    }

    return this.refreshStatus(video.uuid, userId);
  }

  /**
   * Try to complete generation (transaction + optimistic lock)
   */
  private async tryCompleteGeneration(
    videoUuid: string,
    result: VideoTaskResponse
  ): Promise<{ status: string; videoUrl?: string | null }> {
    return db.transaction(async (trx) => {
      const [video] = await trx
        .select()
        .from(videos)
        .where(eq(videos.uuid, videoUuid))
        .limit(1);

      if (!video) {
        throw new Error("Video not found");
      }

      if (video.status === VideoStatus.COMPLETED) {
        return { status: video.status, videoUrl: video.videoUrl };
      }
      if (video.status === VideoStatus.FAILED) {
        return { status: video.status, videoUrl: null };
      }

      if (
        video.status !== VideoStatus.GENERATING &&
        video.status !== VideoStatus.UPLOADING
      ) {
        return { status: video.status, videoUrl: video.videoUrl };
      }

      await trx
        .update(videos)
        .set({
          status: VideoStatus.UPLOADING,
          originalVideoUrl: result.videoUrl,
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoUuid));

      const storage = getStorage();
      const key = `videos/${videoUuid}/${Date.now()}.mp4`;
      const uploaded = await storage.downloadAndUpload({
        sourceUrl: result.videoUrl!,
        key,
        contentType: "video/mp4",
      });

      await creditService.settle(videoUuid);

      await trx
        .update(videos)
        .set({
          status: VideoStatus.COMPLETED,
          videoUrl: uploaded.url,
          thumbnailUrl: result.thumbnailUrl || null,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoUuid));

      emitVideoEvent({
        userId: video.userId,
        videoUuid,
        status: "COMPLETED",
        videoUrl: uploaded.url,
        thumbnailUrl: result.thumbnailUrl || null,
      });

      return { status: VideoStatus.COMPLETED, videoUrl: uploaded.url };
    });
  }

  /**
   * Try to mark as failed (transaction + optimistic lock)
   */
  private async tryFailGeneration(
    videoUuid: string,
    errorMessage?: string
  ): Promise<{ status: string; errorMessage?: string | null }> {
    return db.transaction(async (trx) => {
      const [video] = await trx
        .select()
        .from(videos)
        .where(eq(videos.uuid, videoUuid))
        .limit(1);

      if (!video) {
        throw new Error("Video not found");
      }

      if (video.status === VideoStatus.COMPLETED || video.status === VideoStatus.FAILED) {
        return { status: video.status, errorMessage: video.errorMessage };
      }

      await creditService.release(videoUuid);

      await trx
        .update(videos)
        .set({
          status: VideoStatus.FAILED,
          errorMessage: errorMessage || "Generation failed",
          updatedAt: new Date(),
        })
        .where(eq(videos.uuid, videoUuid));

      emitVideoEvent({
        userId: video.userId,
        videoUuid,
        status: "FAILED",
        error: errorMessage || "Generation failed",
      });

      return {
        status: VideoStatus.FAILED,
        errorMessage: errorMessage || "Generation failed",
      };
    });
  }

  /**
   * Get video details
   */
  async getVideo(uuid: string, userId: string) {
    const [video] = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.uuid, uuid),
          eq(videos.userId, userId),
          eq(videos.isDeleted, false)
        )
      )
      .limit(1);
    return video ?? null;
  }

  /**
   * Get user video list
   */
  async listVideos(
    userId: string,
    options?: {
      limit?: number;
      cursor?: string;
      status?: string;
    }
  ) {
    const limit = options?.limit || 20;

    const conditions = [
      eq(videos.userId, userId),
      eq(videos.isDeleted, false),
    ];

    if (options?.status) {
      conditions.push(eq(videos.status, options.status as typeof VideoStatus[keyof typeof VideoStatus]));
    }

    if (options?.cursor) {
      const [cursorVideo] = await db
        .select({ createdAt: videos.createdAt })
        .from(videos)
        .where(eq(videos.uuid, options.cursor))
        .limit(1);

      if (cursorVideo) {
        conditions.push(lt(videos.createdAt, cursorVideo.createdAt));
      }
    }

    const list = await db
      .select()
      .from(videos)
      .where(and(...conditions))
      .orderBy(desc(videos.createdAt))
      .limit(limit + 1);

    const hasMore = list.length > limit;
    if (hasMore) list.pop();

    return {
      videos: list,
      nextCursor: hasMore ? list[list.length - 1]?.uuid : undefined,
    };
  }

  /**
   * Delete video (soft delete)
   */
  async deleteVideo(uuid: string, userId: string): Promise<void> {
    await db
      .update(videos)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(videos.uuid, uuid), eq(videos.userId, userId)));
  }
}

export const videoService = new VideoService();
