import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    return apiSuccess({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
