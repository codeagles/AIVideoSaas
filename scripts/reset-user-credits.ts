#!/usr/bin/env tsx
/**
 * ============================================
 * 清空用户积分（慎用！）
 * ============================================
 *
 * 用法:
 *   pnpm script:reset-credits <email> [--confirm]
 *
 * 示例:
 *   pnpm script:reset-credits user@example.com --confirm
 *
 * ⚠️  警告：此操作不可逆！会清空用户的所有积分包和积分记录。
 */

import { db } from "@/db";
import { users, creditPackages, creditTransactions } from "@/db/schema";
import { eq, and, sql, isNull, gt } from "drizzle-orm";
import { CreditPackageStatus } from "@/db/schema";

const email = process.argv[2];
const confirmFlag = process.argv[3];

if (!email) {
  console.error("❌ Usage: pnpm script:reset-credits <email> [--confirm]");
  console.error("   Example: pnpm script:reset-credits user@example.com --confirm");
  console.error("");
  console.error("   ⚠️  WARNING: This operation is irreversible!");
  console.error("   Add --confirm flag to proceed.");
  process.exit(1);
}

async function run() {
  try {
    // 1. 查找用户
    const userList = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userList.length === 0) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
      return;
    }

    const user = userList[0];

    // 2. 查询当前积分状态
    const packages = await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.userId, user.id));

    const totalCredits = packages.reduce((sum, p) => sum + p.remainingCredits, 0);

    console.log(`\n⚠️  DANGER ZONE ⚠️`);
    console.log(`User: ${user.email} (ID: ${user.id})`);
    console.log(`Current packages: ${packages.length}`);
    console.log(`Remaining credits: ${totalCredits}`);
    console.log();

    // 3. 确认操作
    if (confirmFlag !== "--confirm") {
      console.log("❌ Aborted: Please add --confirm flag to proceed.");
      console.log("   Example: pnpm script:reset-credits user@example.com --confirm");
      process.exit(1);
      return;
    }

    console.log("⏳ Proceeding with credit reset...");
    console.log();

    // 4. 删除积分包
    const deletedPackages = await db
      .delete(creditPackages)
      .where(eq(creditPackages.userId, user.id))
      .returning();

    console.log(`✅ Deleted ${deletedPackages.length} credit packages`);

    // 5. 删除交易记录
    const deletedTransactions = await db
      .delete(creditTransactions)
      .where(eq(creditTransactions.userId, user.id))
      .returning();

    console.log(`✅ Deleted ${deletedTransactions.length} credit transactions`);

    console.log();
    console.log("─".repeat(50));
    console.log(`🎉 Credit reset completed for ${email}`);
    console.log("   User now has 0 credits.");
    console.log();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

run().then(() => process.exit(0));
