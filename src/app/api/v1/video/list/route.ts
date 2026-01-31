import { NextRequest } from "next/server";
import { videoService } from "@/services/video";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const result = await videoService.listVideos(user.id, {
      limit: Number.parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      status: searchParams.get("status") || undefined,
    });

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
