#!/usr/bin/env node

/**
 * 正确恢复视频：下载 evolink 视频，上传到 R2
 */

const postgres = require("postgres");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
const EVOLINK_API_KEY = process.env.EVOLINK_API_KEY;

// R2 配置
const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT?.replace(/\/$/, "");
const STORAGE_REGION = process.env.STORAGE_REGION || "auto";
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;
const STORAGE_SECRET_KEY = process.env.STORAGE_SECRET_KEY;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET;
const STORAGE_DOMAIN = process.env.STORAGE_DOMAIN?.replace(/\/$/, "");

async function checkEvolinkTask(taskId) {
  const response = await fetch(
    `https://api.evolink.ai/v1/tasks/${taskId}`,
    {
      headers: { Authorization: `Bearer ${EVOLINK_API_KEY}` },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
}

async function downloadAndUploadToR2(client, videoUuid, sourceUrl) {
  const endpointWithBucket = `${STORAGE_ENDPOINT}/${STORAGE_BUCKET}`;
  const key = `videos/${videoUuid}/${Date.now()}.mp4`;

  console.log(`   📥 下载视频: ${sourceUrl.substring(0, 60)}...`);

  // 下载视频
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`下载失败: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = "video/mp4";

  console.log(`   📦 视频大小: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

  // 上传到 R2
  console.log(`   ☁️ 上传到 R2: ${key}`);

  const uploadResponse = await client.putObject(key, buffer, contentType);

  if (!uploadResponse.ok) {
    throw new Error(`上传失败: ${uploadResponse.statusText}`);
  }

  const url = STORAGE_DOMAIN
    ? `${STORAGE_DOMAIN}/${key}`
    : `${endpointWithBucket}/${key}`;

  console.log(`   ✅ R2 URL: ${url}`);
  return { url, key };
}

async function updateVideoWithR2Url(sql, videoUuid, r2Url, originalUrl, thumbnailUrl) {
  await sql`
    UPDATE videos
    SET
      status = 'COMPLETED',
      video_url = ${r2Url},
      original_video_url = ${originalUrl},
      thumbnail_url = ${thumbnailUrl || null},
      updated_at = NOW(),
      completed_at = NOW()
    WHERE uuid = ${videoUuid}
  `;
}

async function main() {
  console.log("🔍 正确恢复视频（下载到 R2）...\n");

  const sql = postgres(DATABASE_URL);

  // 动态导入 s3mini
  const { s3mini } = await import("s3mini");

  const endpointWithBucket = `${STORAGE_ENDPOINT}/${STORAGE_BUCKET}`;
  const client = new s3mini({
    endpoint: endpointWithBucket,
    region: STORAGE_REGION,
    accessKeyId: STORAGE_ACCESS_KEY,
    secretAccessKey: STORAGE_SECRET_KEY,
  });

  try {
    // 查找已完成的视频，但 video_url 还是 evolink 临时链接的
    const videos = await sql`
      SELECT uuid, external_task_id, video_url
      FROM videos
      WHERE status = 'COMPLETED'
        AND video_url LIKE '%tempfile.aiquickdraw.com%'
      ORDER BY completed_at DESC
    `;

    if (videos.length === 0) {
      console.log("✅ 没有需要处理的视频");
      await sql.end();
      return;
    }

    console.log(`📊 发现 ${videos.length} 个需要下载到 R2 的视频\n`);

    for (const video of videos) {
      console.log(`📋 处理视频: ${video.uuid}`);
      console.log(`   当前URL: ${video.video_url.substring(0, 60)}...`);

      if (!video.external_task_id) {
        console.log(`   ⏭️  跳过（无任务ID）\n`);
        continue;
      }

      try {
        // 从 evolink 获取最新信息
        const task = await checkEvolinkTask(video.external_task_id);

        if (task.status !== "completed" || !task.results?.[0]) {
          console.log(`   ⚠️  Evolink 任务未完成或无视频\n`);
          continue;
        }

        const evolinkUrl = task.results[0];
        console.log(`   Evolink URL: ${evolinkUrl.substring(0, 60)}...`);

        // 下载并上传到 R2
        const uploaded = await downloadAndUploadToR2(
          client,
          video.uuid,
          evolinkUrl
        );

        // 更新数据库
        await updateVideoWithR2Url(
          sql,
          video.uuid,
          uploaded.url,
          video.video_url,
          task.data?.thumbnail_url
        );

        console.log(`   💾 已更新数据库\n`);
      } catch (error) {
        console.error(`   ❌ 失败: ${error.message}\n`);
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
