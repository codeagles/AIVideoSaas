import { NextRequest } from "next/server";

import { creditService } from "@/services/credit";

import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const balance = await creditService.getBalance(user.id);
    return apiSuccess(balance);
  } catch (error) {
    return handleApiError(error);
  }
}
