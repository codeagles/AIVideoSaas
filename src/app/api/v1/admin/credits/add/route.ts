/**
 * ============================================
 * Admin API - 添加积分（仅用于测试）
 * ============================================
 *
 * POST /api/v1/admin/credits/add
 *
 * 请求体:
 * {
 *   "userId": "user-id",      // 可选，默认为当前用户
 *   "credits": 100,           // 积分数量
 *   "expiryDays": 365,        // 可选，过期天数（默认365）
 *   "remark": "测试充值"       // 可选，备注
 * }
 *
 * 注意：
 * - 仅用于开发/测试环境
 * - 生产环境应禁用此接口
 * - 需要 ADMIN 权限
 */

import { requireAdmin } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { creditService } from "@/services/credit";
import { CreditTransType } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);

    const body = await request.json();
    const { userId, credits, expiryDays, remark } = body;

    // 验证必填字段
    if (typeof credits !== "number" || credits <= 0) {
      return apiSuccess({ error: "Invalid credits value" }, 400);
    }

    // 使用当前用户或指定的用户
    const targetUserId = userId || admin.id;

    // 添加积分
    const result = await creditService.recharge({
      userId: targetUserId,
      credits,
      orderNo: `ADMIN_${Date.now()}`,
      transType: CreditTransType.SYSTEM_ADJUST,
      expiryDays: expiryDays || 365,
      remark: remark || `Admin added ${credits} credits`,
    });

    return apiSuccess({
      packageId: result.packageId,
      userId: targetUserId,
      credits,
      message: `Successfully added ${credits} credits to user ${targetUserId}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
