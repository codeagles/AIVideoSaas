import { NextRequest } from "next/server";
import { videoService } from "@/services/video";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { taskId } = await params;

    if (!taskId) {
      return apiError("Task ID is required", 400);
    }

    const result = await videoService.refreshStatusByTaskId(taskId, user.id);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
