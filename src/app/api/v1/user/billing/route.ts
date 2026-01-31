import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { db } from "@/db";
import { creditPackages } from "@/db/schema";
import { sql, eq, and } from "drizzle-orm";
import type { CreditTransType } from "@/db/schema";

/**
 * GET /api/v1/user/billing
 *
 * Get user's purchase history (credit packages)
 * Query params:
 * - limit: number of items per page (default: 20)
 * - cursor: pagination cursor (creditPackages.id)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");

    // Get ORDER_PAY type value
    const orderPayType: CreditTransType = "ORDER_PAY";

    // Build base query - use raw SQL for complex query with enum
    const packages = await db.execute(sql`
      SELECT
        id,
        user_id as "userId",
        initial_credits as "initialCredits",
        remaining_credits as "remainingCredits",
        trans_type as "transType",
        order_no as "orderNo",
        status,
        expired_at as "expiredAt",
        created_at as "createdAt"
      FROM credit_packages
      WHERE user_id = ${user.id}
        AND trans_type = ${orderPayType}
        ${cursor ? sql`AND id < ${Number.parseInt(cursor)}` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit + 1}
    `);

    // Check if there's more data
    const hasMore = packages.length > limit;
    const results = hasMore ? packages.slice(0, limit) : packages;

    // Get next cursor
    const nextCursor = hasMore && results.length > 0
      ? String(results[results.length - 1].id)
      : null;

    // Transform to invoice format
    const invoices = results.map((pkg: any) => {
      const initialCredits = pkg.initialCredits as number;
      const itemDescription = initialCredits === 100
        ? "100 Credits"
        : initialCredits === 500
        ? "500 Credits"
        : initialCredits === 1000
        ? "1000 Credits"
        : initialCredits === 5000
        ? "5000 Credits"
        : `${initialCredits} Credits`;

      // Calculate amount based on credits (rough estimate)
      const amount = initialCredits * 0.1; // $0.01 per credit as example

      return {
        id: String(pkg.id),
        amount: amount,
        currency: "USD",
        status: (pkg.status as string).toLowerCase(),
        items: [
          {
            type: "credits",
            description: itemDescription,
            quantity: initialCredits,
          },
        ],
        createdAt: new Date(pkg.createdAt as string),
      };
    });

    return apiSuccess({
      user: {
        email: user.email,
        id: user.id,
        createdAt: user.createdAt,
      },
      invoices,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
