import { nanoid } from "nanoid";

import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/error";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { getStorage } from "@/lib/storage";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ApiError("Missing file", 400);
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new ApiError(
        `Invalid content type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError("File too large", 400);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const key = `uploads/${user.id}/${nanoid()}.${ext}`;

    const storage = getStorage();
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await storage.uploadFile({
      key,
      body: buffer,
      contentType: file.type,
    });

    return apiSuccess({ publicUrl: uploaded.url, key });
  } catch (error) {
    return handleApiError(error);
  }
}
