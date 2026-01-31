import { NextRequest } from "next/server";
import { videoService } from "@/services/video";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { uuid } = await params;

    const video = await videoService.getVideo(uuid, user.id);

    if (!video) {
      return apiError("Video not found", 404);
    }

    return apiSuccess(video);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { uuid } = await params;

    await videoService.deleteVideo(uuid, user.id);

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
