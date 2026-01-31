import crypto from "node:crypto";

const SIGNATURE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCallbackSecret(): string {
  const secret = process.env.CALLBACK_HMAC_SECRET;
  if (!secret) {
    throw new Error("CALLBACK_HMAC_SECRET environment variable is not set");
  }
  return secret;
}

/**
 * Generate a signed callback URL
 * Format: baseUrl?videoUuid=xxx&ts=xxx&sig=xxx
 */
export function generateSignedCallbackUrl(
  baseUrl: string,
  videoUuid: string
): string {
  const timestamp = Date.now().toString();
  const signature = generateSignature(videoUuid, timestamp);

  const url = new URL(baseUrl);
  url.searchParams.set("videoUuid", videoUuid);
  url.searchParams.set("ts", timestamp);
  url.searchParams.set("sig", signature);

  return url.toString();
}

/**
 * Verify callback signature
 */
export function verifyCallbackSignature(
  videoUuid: string,
  timestamp: string,
  signature: string
): { valid: boolean; error?: string } {
  // Check if timestamp is expired
  const ts = Number.parseInt(timestamp);
  if (Number.isNaN(ts) || Date.now() - ts > SIGNATURE_EXPIRY_MS) {
    return { valid: false, error: "Signature expired" };
  }

  // Verify signature
  const expectedSig = generateSignature(videoUuid, timestamp);
  if (signature.length !== expectedSig.length) {
    return { valid: false, error: "Invalid signature" };
  }
  const valid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );

  if (!valid) {
    return { valid: false, error: "Invalid signature" };
  }

  return { valid: true };
}

function generateSignature(videoUuid: string, timestamp: string): string {
  const data = `${videoUuid}:${timestamp}`;
  return crypto
    .createHmac("sha256", getCallbackSecret())
    .update(data)
    .digest("hex");
}
