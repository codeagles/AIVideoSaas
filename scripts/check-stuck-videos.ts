#!/usr/bin/env tsx

/**
 * 检查卡住的视频任务
 */

import "dotenv/config";

import { db } from "@/db";
import { videos } from "@/db/schema";
import { desc, eq, or, sql } from "drizzle-orm";

async function checkStuckVideos() {
  console.log("🔍 检查卡住的视频任务...\n");

  // 查找所有非完成状态的视频
  const stuckVideos = await db.select()
  .from(videos)
  .where(or(
    eq(videos.status, 'PENDING'),
    eq(videos.status, 'GENERATING'),
    eq(videos.status, 'UPLOADING')
  ))
  .orderBy(sql`"videos"."created_at" DESC`)
  .limit(20);

  if (stuckVideos.length === 0) {
    console.log("✅ 没有卡住的视频任务");
    process.exit(0);
  }

  console.log(`📊 发现 ${stuckVideos.length} 个未完成的视频:\n`);

  stuckVideos.forEach((video: any, index) => {
    const createdAt = video.created_at || video.createdAt;
    const duration = createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000 / 60) : 0;
    const externalTaskId = video.external_task_id || video.externalTaskId;
    const errorMessage = video.error_message || video.errorMessage;

    console.log(`${index + 1}. ${video.uuid}`);
    console.log(`   状态: ${video.status}`);
    console.log(`   Provider: ${video.provider || 'N/A'}`);
    console.log(`   任务ID: ${externalTaskId || 'N/A'}`);
    console.log(`   创建时间: ${createdAt || 'N/A'}`);
    console.log(`   更新时间: ${video.updated_at || video.updatedAt || 'N/A'}`);
    console.log(`   已用时: ${duration} 分钟`);
    if (errorMessage) {
      console.log(`   错误: ${errorMessage}`);
    }
    console.log('');
  });

  // 统计各状态数量
  const statusCounts = stuckVideos.reduce((acc, video) => {
    acc[video.status] = (acc[video.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("📈 状态统计:");
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`);
  });
}

checkStuckVideos()
  .then(() => {
    console.log("\n✅ 检查完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 错误:", error);
    process.exit(1);
  });
