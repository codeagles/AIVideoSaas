import { NextRequest } from "next/server";
import { videoService } from "@/services/video";
import { type ProviderType } from "@/ai";
import { verifyCallbackSignature } from "@/ai/utils/callback-signature";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const providerType = provider as ProviderType;

    // Validate provider type
    if (!["evolink", "kie"].includes(providerType)) {
      return apiError("Invalid provider", 400);
    }

    // Get signature info from URL params
    const { searchParams } = new URL(request.url);
    const videoUuid = searchParams.get("videoUuid");
    const timestamp = searchParams.get("ts");
    const signature = searchParams.get("sig");

    // Verify signature
    if (!videoUuid || !timestamp || !signature) {
      console.error("Missing callback signature parameters");
      return apiError("Missing signature parameters", 400);
    }

    const verification = verifyCallbackSignature(videoUuid, timestamp, signature);
    if (!verification.valid) {
      console.error(
        `Callback signature verification failed: ${verification.error}`
      );
      return apiError(verification.error || "Invalid signature", 401);
    }

    const payload = await request.json();

    // Pass in videoUuid (already verified)
    await videoService.handleCallback(providerType, payload, videoUuid);

    return apiSuccess({ received: true });
  } catch (error) {
    console.error("Callback error:", error);
    return apiError("Callback processing failed", 500);
  }
}
