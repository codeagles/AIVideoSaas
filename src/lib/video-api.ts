import type { SubmitData } from "@/components/video-generator";

/**
 * API request format
 */
export interface VideoGenerateRequest {
  prompt: string;
  model: "sora-2";
  duration: 10 | 15;
  aspectRatio?: "16:9" | "9:16";
  quality?: "standard" | "high";
  imageUrl?: string;
}

/**
 * Parse duration string to number
 * "10s" -> 10, "15s" -> 15
 */
export function parseDuration(duration?: string): 10 | 15 {
  if (!duration) return 10;
  const num = Number.parseInt(duration.replace(/\D/g, ""));
  return num === 15 ? 15 : 10;
}

/**
 * Convert resolution to quality
 * "1080P" / "1080p" -> "high"
 * "720P" / "720p" / other -> "standard"
 */
export function resolutionToQuality(resolution?: string): "standard" | "high" {
  if (!resolution) return "standard";
  return resolution.toLowerCase().includes("1080") ? "high" : "standard";
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
  // Upload image if exists
  let imageUrl: string | undefined;
  if (data.images && data.images.length > 0) {
    imageUrl = await uploadImage(data.images[0]);
  }

  // Determine quality: use direct quality field if present, otherwise convert from resolution
  let quality: "standard" | "high" | undefined;
  if (data.quality) {
    quality = data.quality as "standard" | "high";
  } else if (data.resolution) {
    quality = resolutionToQuality(data.resolution);
  }

  return {
    prompt: data.prompt,
    model: "sora-2",
    duration: parseDuration(data.duration),
    aspectRatio: data.aspectRatio as "16:9" | "9:16" | undefined,
    quality,
    imageUrl,
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
