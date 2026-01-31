import { getAvailableModels } from "@/config/credits";
import { apiSuccess } from "@/lib/api/response";

export async function GET() {
  const models = getAvailableModels();
  return apiSuccess(models);
}
