#!/usr/bin/env tsx

/**
 * 检查 evolink 任务状态
 */

import "dotenv/config";

const EVOLINK_API_KEY = process.env.EVOLINK_API_KEY;
const EVOLINK_BASE_URL = "https://api.evolink.ai/v1";

interface EvolinkTaskStatus {
  code: number;
  message: string;
  data: {
    task_id: string;
    status: string;
    // ... other fields
  };
}

async function checkEvolinkTaskStatus(taskId: string): Promise<EvolinkTaskStatus> {
  const response = await fetch(
    `${EVOLINK_BASE_URL}/tasks/${taskId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${EVOLINK_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 404 || response.status === 410) {
      return {
        code: response.status,
        message: "Task not found or expired",
        data: { task_id: taskId, status: "not_found" },
      };
    }
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

async function main() {
  // 从命令行参数获取任务ID
  const taskIds = process.argv.slice(2);

  if (taskIds.length === 0) {
    console.log("❌ 请提供至少一个任务ID");
    console.log("用法: pnpm tsx scripts/check-evolink-status.ts <task_id_1> <task_id_2> ...");
    process.exit(1);
  }

  console.log("🔍 检查 evolink 任务状态...\n");

  for (const taskId of taskIds) {
    try {
      console.log(`📋 检查任务: ${taskId}`);
      const result = await checkEvolinkTaskStatus(taskId);

      console.log(`   完整响应:`, JSON.stringify(result, null, 2));
      console.log('');
    } catch (error) {
      console.error(`   ❌ 错误: ${error instanceof Error ? error.message : error}`);
      console.log('');
    }
  }

  console.log("✅ 检查完成");
}

main().catch(console.error);

