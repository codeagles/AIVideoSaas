#!/usr/bin/env node
/**
 * Test script to verify global proxy configuration
 * Run with: pnpm script:test-proxy
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

console.log("========================================");
console.log("📡 Testing Global Proxy Configuration");
console.log("========================================\n");

// Check proxy environment variables
console.log("Environment Variables:");
console.log(`  HTTP_PROXY: ${process.env.HTTP_PROXY || "not set"}`);
console.log(`  HTTPS_PROXY: ${process.env.HTTPS_PROXY || "not set"}`);
console.log(`  Effective Proxy: ${PROXY_URL || "none"}\n`);

if (!PROXY_URL) {
  console.log("⚠️  No proxy configured in .env.local");
  console.log("Please add: HTTP_PROXY=http://127.0.0.1:1235");
  process.exit(1);
}

try {
  // Use native fetch with undici proxy (Node.js 18+)
  const undici = await import("undici");
  const proxyAgent = new undici.ProxyAgent(PROXY_URL);
  undici.setGlobalDispatcher(proxyAgent);

  console.log("✅ Global proxy dispatcher configured");
  console.log(`   Proxy: ${PROXY_URL}\n`);

  // Test 1: Fetch IP through proxy
  console.log("Test 1: Fetching http://httpbin.org/ip...");
  try {
    const response1 = await fetch("http://httpbin.org/ip");
    const data1 = await response1.json();
    console.log("✅ Success:", JSON.stringify(data1, null, 2));
  } catch (error) {
    console.log("❌ Failed:", error.message);
    console.log("   Note: Make sure your proxy server at", PROXY_URL, "is running");
  }

  console.log("\nTest 2: Fetching https://api.ipify.org?format=json...");
  try {
    const response2 = await fetch("https://api.ipify.org?format=json");
    const data2 = await response2.json();
    console.log("✅ Success:", JSON.stringify(data2, null, 2));
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  console.log("\n========================================");
  console.log("✅ Proxy configuration test completed");
  console.log("========================================\n");

  console.log("Next steps:");
  console.log("1. Start dev server: pnpm dev");
  console.log("2. Check startup logs for proxy confirmation");
  console.log("3. All fetch requests will use the proxy");

} catch (error) {
  console.error("\n❌ Fatal error:", error.message);
  console.error("\nTroubleshooting:");
  console.error("  1. Check if proxy server is running at", PROXY_URL);
  console.error("  2. Verify proxy accepts HTTP connections");
  console.error("  3. Ensure Node.js version >= 18 (current: " + process.version + ")");
  process.exit(1);
}
