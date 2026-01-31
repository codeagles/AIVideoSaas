/**
 * ============================================
 * 管理员权限检查
 * ============================================
 *
 * 检查用户是否具有管理员权限
 * 用于保护管理后台页面
 *
 * 支持自动设置管理员：
 * 如果用户邮箱匹配 ADMIN_EMAIL 环境变量，
 * 会自动将其设置为管理员
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { env } from "./env.mjs";
import type { Locale } from "@/config/i18n-config";

/**
 * 要求用户具有管理员权限
 *
 * 如果用户邮箱匹配 ADMIN_EMAIL，会自动设置为管理员
 *
 * @param redirectTo - 未授权时重定向的路径
 * @returns 当前用户信息
 * @throws 如果未登录或不是管理员，则重定向
 */
export async function requireAdmin(redirectTo?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(redirectTo || "/login");
  }

  // 自动设置管理员：如果邮箱匹配 ADMIN_EMAIL 且还不是管理员
  const adminEmail = env.ADMIN_EMAIL;
  if (
    adminEmail &&
    session.user.email?.toLowerCase() === adminEmail.toLowerCase() &&
    !session.user.isAdmin
  ) {
    // 设置为管理员
    await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.id, session.user.id));

    console.log(`✅ Auto-set admin for: ${session.user.email}`);

    // 重新获取 session 以获取更新后的 isAdmin 状态
    const updatedSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (updatedSession?.user?.isAdmin) {
      return updatedSession.user;
    }
  }

  if (!session.user.isAdmin) {
    redirect(redirectTo || "/");
  }

  return session.user;
}

/**
 * 检查用户是否是管理员
 *
 * @returns 是否是管理员
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return !!session?.user?.isAdmin;
}

/**
 * 为给定路径生成本地化的登录重定向路径
 */
export function getLoginRedirect(locale: Locale = "en"): string {
  return `/${locale}/login`;
}
