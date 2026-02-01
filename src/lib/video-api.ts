import type { SubmitData } from "@/components/video-generator";

/**
 * API request format for Seedance 1.5 Pro
 */
export interface VideoGenerateRequest {
  prompt: string;
  model: "seedance-1.5-pro";
  duration: number; // 4-12 seconds
  aspectRatio?: string;
  quality?: string; // "480p", "720p", "1080p"
  imageUrl?: string;
  imageUrls?: string[];
  generateAudio?: boolean;
}

/**
 * Parse duration string to number
 * "8s" -> 8, "12s" -> 12
 */
export function parseDuration(duration?: string): number {
  if (!duration) return 8; // default to 8s for Seedance
  const num = Number.parseInt(duration.replace(/\D/g, ""));
  // Seedance supports 4-12 seconds
  if (num >= 4 && num <= 12) return num;
  return 8; // default
}

/**
 * Convert resolution to quality
 * "1080P" / "1080p" -> "1080p"
 * "720P" / "720p" -> "720p"
 * "480P" / "480p" -> "480p"
 */
export function resolutionToQuality(resolution?: string): string {
  if (!resolution) return "720p";
  const lower = resolution.toLowerCase();
  if (lower.includes("1080")) return "1080p";
  if (lower.includes("480")) return "480p";
  return "720p";
}

/**
 * Upload image and return public URL
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const uploadRes = await fetch("/api/v1/upload", {
    method: "POST",
    body: formData,
  });

  const uploadData = await uploadRes.json();
  if (!uploadData.success) {
    throw new Error(uploadData.error?.message || "Failed to upload image");
  }

  return uploadData.data.publicUrl as string;
}

/**
 * Transform SubmitData to API request
 * Handles both `quality` (direct) and `resolution` (converted) fields
 */
export async function transformSubmitData(
  data: SubmitData
): Promise<VideoGenerateRequest> {
  // Upload images if exist
  let imageUrl: string | undefined;
  let imageUrls: string[] | undefined;
  if (data.images && data.images.length > 0) {
    if (data.images.length === 1) {
      imageUrl = await uploadImage(data.images[0]);
    } else {
      imageUrls = await Promise.all(data.images.map(uploadImage));
    }
  }

  // Determine quality: use direct quality field if present, otherwise convert from resolution
  let quality: string | undefined;
  if (data.quality) {
    quality = data.quality;
  } else if (data.resolution) {
    quality = resolutionToQuality(data.resolution);
  }

  return {
    prompt: data.prompt,
    model: "seedance-1.5-pro",
    duration: parseDuration(data.duration),
    aspectRatio: data.aspectRatio,
    quality,
    imageUrl,
    imageUrls,
    generateAudio: true, // Seedance defaults to generating audio
  };
}

/**
 * Call video generation API
 */
export async function generateVideo(
  request: VideoGenerateRequest
): Promise<{ videoUuid: string; status: string; creditsUsed: number }> {
  const res = await fetch("/api/v1/video/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to generate video");
  }

  return data.data;
}

/**
 * Get video status (triggers backend refresh)
 */
export async function getVideoStatus(
  videoUuid: string
): Promise<{ status: string; videoUrl?: string; error?: string }> {
  const res = await fetch(`/api/v1/video/${videoUuid}/status`);
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to get video status");
  }

  return data.data;
}

/**
 * Get credit balance
 */
export async function getCreditBalance(): Promise<{
  totalCredits: number;
  usedCredits: number;
  frozenCredits: number;
  availableCredits: number;
  expiringSoon: number;
}> {
  const res = await fetch("/api/v1/credit/balance");
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to get credit balance");
  }

  return data.data;
}
