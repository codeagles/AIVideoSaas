#!/usr/bin/env node

/**
 * 直接从数据库和 evolink API 恢复视频
 */

const postgres = require("postgres");
const dotenv = require("dotenv");

// 加载环境变量
dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
const EVOLINK_API_KEY = process.env.EVOLINK_API_KEY;

async function checkEvolinkTask(taskId) {
  const response = await fetch(
    `https://api.evolink.ai/v1/tasks/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${EVOLINK_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

async function updateVideoStatus(sql, videoUuid, status, videoUrl, thumbnailUrl, errorMessage) {
  await sql`
    UPDATE videos
    SET
      status = ${status},
      video_url = ${videoUrl || null},
      thumbnail_url = ${thumbnailUrl || null},
      error_message = ${errorMessage || null},
      updated_at = NOW(),
      completed_at = NOW()
    WHERE uuid = ${videoUuid}
  `;
}

async function main() {
  console.log("🔍 恢复卡住的视频...\n");

  const sql = postgres(DATABASE_URL);

  try {
    // 查找卡住的视频
    const stuckVideos = await sql`
      SELECT uuid, status, provider, external_task_id
      FROM videos
      WHERE status IN ('PENDING', 'GENERATING', 'UPLOADING')
      ORDER BY created_at DESC
      LIMIT 20
    `;

    if (stuckVideos.length === 0) {
      console.log("✅ 没有卡住的视频");
      return;
    }

    console.log(`📊 发现 ${stuckVideos.length} 个未完成的视频\n`);

    for (const video of stuckVideos) {
      console.log(`📋 检查视频: ${video.uuid}`);
      console.log(`   当前状态: ${video.status}`);
      console.log(`   任务ID: ${video.external_task_id || "N/A"}`);

      if (!video.external_task_id) {
        console.log(`   ⏭️  跳过（无任务ID）\n`);
        continue;
      }

      try {
        // 查询 evolink 状态
        const task = await checkEvolinkTask(video.external_task_id);
        console.log(`   Evolink 状态: ${task.status}`);

        if (task.status === "completed" && task.results && task.results[0]) {
          console.log(`   ✅ 任务已完成！`);
          console.log(`   视频URL: ${task.results[0]}`);

          // 更新数据库
          await updateVideoStatus(
            sql,
            video.uuid,
            "COMPLETED",
            task.results[0],
            task.data?.thumbnail_url,
            null
          );

          console.log(`   💾 已更新数据库为 COMPLETED\n`);
        } else if (task.status === "failed") {
          console.log(`   ❌ 任务已失败`);

          const errorMsg = task.error?.message || "Task failed";

          await updateVideoStatus(
            sql,
            video.uuid,
            "FAILED",
            null,
            null,
            errorMsg
          );

          console.log(`   💾 已更新数据库为 FAILED\n`);
        } else {
          console.log(`   ⏳ 任务仍在处理中...\n`);
        }
      } catch (error) {
        console.error(`   ❌ 查询失败: ${error.message}\n`);
      }
    }

    console.log("✅ 恢复完成");
    await sql.end();
  } catch (error) {
    console.error("❌ 错误:", error);
    await sql.end();
    throw error;
  }
}

main().catch(console.error);
