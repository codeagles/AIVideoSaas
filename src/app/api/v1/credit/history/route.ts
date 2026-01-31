import { NextRequest } from "next/server";

import { creditService, type CreditTransType } from "@/services/credit";

import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";

// Map database enum values to frontend expected format
const transTypeMapping: Record<CreditTransType, string> = {
  NEW_USER: "new_user",
  ORDER_PAY: "order_pay",
  SUBSCRIPTION: "subscription",
  VIDEO_CONSUME: "video_generate",
  REFUND: "video_refund",
  EXPIRED: "expired",
  SYSTEM_ADJUST: "admin_adjust",
};

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const offset = Number.parseInt(searchParams.get("cursor") || searchParams.get("offset") || "0");

    const result = await creditService.getHistory(user.id, {
      limit,
      offset,
      transType: searchParams.get("type") as CreditTransType | undefined,
    });

    // Transform transType to frontend-expected format
    const transformedRecords = result.records.map((record) => ({
      id: record.id.toString(), // Ensure ID is string
      userId: record.userId,
      credits: record.credits,
      balanceAfter: record.balanceAfter,
      transType: transTypeMapping[record.transType] ?? record.transType.toLowerCase(),
      videoUuid: record.videoUuid,
      remark: record.remark,
      createdAt: record.createdAt,
    }));

    const hasMore = offset + limit < result.total;
    const nextCursor = hasMore ? (offset + limit).toString() : null;

    return apiSuccess({
      transactions: transformedRecords,
      total: result.total,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
