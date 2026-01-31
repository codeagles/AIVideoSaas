#!/usr/bin/env tsx
/**
 * ============================================
 * 查询用户积分详情
 * ============================================
 *
 * 用法:
 *   pnpm script:check-credits <email>
 *
 * 示例:
 *   pnpm script:check-credits user@example.com
 */

import { db } from "@/db";
import { users, creditPackages, creditTransactions } from "@/db/schema";
import { eq, and, sql, isNull, gt } from "drizzle-orm";
import { CreditPackageStatus } from "@/db/schema";

const email = process.argv[2];

if (!email) {
  console.error("❌ Usage: pnpm script:check-credits <email>");
  console.error("   Example: pnpm script:check-credits user@example.com");
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
    console.log(`\n👤 User: ${user.email} (ID: ${user.id})`);
    console.log(`   Is Admin: ${user.isAdmin ? "Yes" : "No"}`);
    console.log(`   Created: ${user.createdAt.toISOString().substring(0, 10)}\n`);

    // 2. 查询所有积分包
    const packages = await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.userId, user.id))
      .orderBy(creditPackages.createdAt);

    console.log(`📦 Credit Packages (${packages.length} total):`);
    console.log("─".repeat(80));

    let totalCredits = 0;
    let totalUsed = 0;
    let totalFrozen = 0;
    let availableCredits = 0;

    const now = new Date();

    for (const pkg of packages) {
      const isExpired = pkg.expiredAt && pkg.expiredAt < now;
      const isDepleted = pkg.status === CreditPackageStatus.DEPLETED;
      const status = isExpired ? "EXPIRED" : pkg.status;

      totalCredits += pkg.initialCredits;
      const used = pkg.initialCredits - pkg.remainingCredits - pkg.frozenCredits;
      totalUsed += used;
      totalFrozen += pkg.frozenCredits;

      if (!isExpired && pkg.status === CreditPackageStatus.ACTIVE) {
        availableCredits += pkg.remainingCredits;
      }

      console.log(`📦 Package #${pkg.id}`);
      console.log(`   Type: ${pkg.transType}`);
      console.log(`   Initial: ${pkg.initialCredits} | Remaining: ${pkg.remainingCredits} | Frozen: ${pkg.frozenCredits}`);
      console.log(`   Status: ${status}`);
      console.log(
        `   Expires: ${pkg.expiredAt ? pkg.expiredAt.toISOString().substring(0, 10) : "Never"}`
      );
      console.log(`   Order: ${pkg.orderNo || "N/A"}`);
      console.log(`   Created: ${pkg.createdAt.toISOString().substring(0, 10)}`);
      console.log();
    }

    console.log("─".repeat(80));
    console.log("📊 Summary:");
    console.log(`   Total Credits: ${totalCredits}`);
    console.log(`   Used Credits: ${totalUsed}`);
    console.log(`   Frozen Credits: ${totalFrozen}`);
    console.log(`   Available Credits: ${availableCredits}`);
    console.log();

    // 3. 最近交易记录（最近10条）
    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, user.id))
      .orderBy(creditTransactions.createdAt)
      .limit(10);

    if (transactions.length > 0) {
      console.log("📜 Recent Transactions:");
      console.log("─".repeat(80));
      for (const tx of transactions) {
        const sign = tx.credits >= 0 ? "+" : "";
        console.log(
          `   ${tx.createdAt.toISOString().substring(0, 19)} | ${tx.transType} | ${sign}${tx.credits} credits | Balance: ${tx.balanceAfter}`
        );
        if (tx.remark) {
          console.log(`      → ${tx.remark}`);
        }
      }
      console.log();
    }

    console.log("─".repeat(80));
    console.log(`✅ Check completed for ${email}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

run().then(() => process.exit(0));
