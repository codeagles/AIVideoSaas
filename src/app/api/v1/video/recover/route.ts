import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { getProvider } from "@/ai";

/**
 * 恢复卡住的视频任务
 * GET /api/v1/video/recover?secret=YOUR_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员密钥
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.CALLBACK_HMAC_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 查找所有非完成状态的视频
    const stuckVideos = await db
      .select()
      .from(videos)
      .where(
        or(
          eq(videos.status, "PENDING"),
          eq(videos.status, "GENERATING"),
          eq(videos.status, "UPLOADING")
        )
      )
      .orderBy(sql`"videos"."created_at" DESC`)
      .limit(20);

    if (stuckVideos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No stuck videos found",
        recovered: 0,
      });
    }

    const results: Array<{
      uuid: string;
      status: string;
      evolinkStatus: string;
      action: string;
    }> = [];

    // 检查每个视频的实际状态
    for (const video of stuckVideos) {
      if (!video.external_task_id) {
        results.push({
          uuid: video.uuid,
          status: video.status,
          evolinkStatus: "no_task_id",
          action: "skipped",
        });
        continue;
      }

      try {
        // 从 evolink 获取状态
        const provider = getProvider("evolink");
        const taskStatus = await provider.getTaskStatus(video.external_task_id);

        if (taskStatus.status === "completed" && taskStatus.videoUrl) {
          // 任务已完成，返回信息
          results.push({
            uuid: video.uuid,
            status: video.status,
            evolinkStatus: taskStatus.status,
            action: "ready_to_complete",
            videoUrl: taskStatus.videoUrl,
            thumbnailUrl: taskStatus.thumbnailUrl,
          });
        } else if (taskStatus.status === "failed") {
          results.push({
            uuid: video.uuid,
            status: video.status,
            evolinkStatus: "failed",
            action: "mark_as_failed",
          });
        } else {
          results.push({
            uuid: video.uuid,
            status: video.status,
            evolinkStatus: taskStatus.status || "unknown",
            action: "still_processing",
          });
        }
      } catch (error) {
        results.push({
          uuid: video.uuid,
          status: video.status,
          evolinkStatus: "error",
          action: "query_failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: stuckVideos.length,
      results,
    });
  } catch (error) {
    console.error("Recover API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * 手动触发视频完成
 * POST /api/v1/video/recover?secret=YOUR_SECRET
 * Body: { videoUuid, videoUrl, thumbnailUrl }
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员密钥
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.CALLBACK_HMAC_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { videoUuid, videoUrl, thumbnailUrl } = body;

    if (!videoUuid || !videoUrl) {
      return NextResponse.json(
        { error: "Missing required fields: videoUuid, videoUrl" },
        { status: 400 }
      );
    }

    // 获取视频信息
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.uuid, videoUuid))
      .limit(1);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // 手动触发完成流程
    const { videoService } = await import("@/services/video");
    await videoService.tryCompleteGeneration({
      videoUuid,
      provider: video.provider || "evolink",
      payload: {
        id: video.external_task_id || "",
        status: "completed",
        progress: 100,
        results: [videoUrl],
        data: {
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Video recovered successfully",
    });
  } catch (error) {
    console.error("Recover POST error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
