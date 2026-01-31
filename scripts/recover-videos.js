#!/usr/bin/env node

/**
 * 恢复卡住的视频
 */

const API_BASE = "https://videofly.app/api/v1/video";
const SECRET = process.env.CALLBACK_HMAC_SECRET || "your_callback_secret_for_hmac";

async function checkStuckVideos() {
  console.log("🔍 检查卡住的视频状态...\n");

  const response = await fetch(`${API_BASE}/recover?secret=${SECRET}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.total === 0) {
    console.log("✅ 没有卡住的视频");
    return [];
  }

  console.log(`📊 发现 ${data.total} 个未完成的视频:\n`);

  data.results.forEach((video, index) => {
    console.log(`${index + 1}. ${video.uuid}`);
    console.log(`   数据库状态: ${video.status}`);
    console.log(`   Evolink 状态: ${video.evolinkStatus}`);
    console.log(`   操作: ${video.action}`);
    if (video.videoUrl) {
      console.log(`   视频URL: ${video.videoUrl}`);
    }
    console.log("");
  });

  return data.results;
}

async function recoverVideo(video) {
  if (video.action !== "ready_to_complete") {
    console.log(`⏭️  跳过 ${video.uuid} (${video.action})`);
    return false;
  }

  console.log(`🔧 恢复视频: ${video.uuid}`);

  const response = await fetch(`${API_BASE}/recover?secret=${SECRET}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      videoUuid: video.uuid,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
    }),
  });

  if (!response.ok) {
    console.error(`   ❌ 失败: HTTP ${response.status}`);
    return false;
  }

  const result = await response.json();
  console.log(`   ✅ 成功`);
  return true;
}

async function main() {
  try {
    // 检查状态
    const stuckVideos = await checkStuckVideos();

    if (!stuckVideos || stuckVideos.length === 0) {
      return;
    }

    // 筛选需要恢复的视频
    const videosToRecover = stuckVideos.filter((v) => v.action === "ready_to_complete");

    if (videosToRecover.length === 0) {
      console.log("\n⚠️  没有需要恢复的视频");
      return;
    }

    console.log(`\n🔄 准备恢复 ${videosToRecover.length} 个视频...\n`);

    // 逐个恢复
    let successCount = 0;
    for (const video of videosToRecover) {
      const success = await recoverVideo(video);
      if (success) successCount++;
    }

    console.log(`\n✅ 恢复完成: ${successCount}/${videosToRecover.length} 个视频已恢复`);
  } catch (error) {
    console.error("❌ 错误:", error);
    process.exit(1);
  }
}

main();
