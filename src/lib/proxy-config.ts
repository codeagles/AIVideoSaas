/**
 * Global Proxy Configuration
 *
 * This file configures undici global proxy for all Node.js fetch requests.
 * It should be imported as early as possible in the application lifecycle.
 *
 * IMPORTANT: Import this in your API routes or server-side code BEFORE making any fetch calls.
 */

const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

if (PROXY_URL) {
  try {
    // Note: In Next.js server context, undici might not be directly importable
    // We'll use a dynamic require/import approach
    let undici;

    // Try CommonJS require first (for server-side compatibility)
    try {
      undici = require("undici");
    } catch (e) {
      // If require fails, undici is built into Node.js 18+
      // Skip proxy setup in this case
      console.log(`ℹ️  [Proxy] Undici not available as package, using built-in fetch`);
    }

    if (undici) {
      const proxyAgent = new undici.ProxyAgent(PROXY_URL);
      undici.setGlobalDispatcher(proxyAgent);
      console.log(`📡 [Proxy] Global proxy configured: ${PROXY_URL}`);
    }
  } catch (error) {
    console.warn(`⚠️  [Proxy] Failed to configure undici proxy:`, error.message);
  }
} else {
  console.log(`ℹ️  [Proxy] No HTTP_PROXY/HTTPS_PROXY environment variable found`);
}

export {};
