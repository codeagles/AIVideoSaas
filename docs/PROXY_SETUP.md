# Global Proxy Configuration

This project supports configuring a global HTTP/HTTPS proxy for all Node.js fetch requests using the undici library.

## Configuration

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
HTTP_PROXY=http://127.0.0.1:1235
HTTPS_PROXY=http://127.0.0.1:1235
```

Replace `http://127.0.0.1:1235` with your actual proxy server address.

### 2. How It Works

The proxy configuration is automatically loaded in server-side code through:

- **File**: `src/lib/proxy-config.ts`
- **Import**: Added to API routes that need to make external fetch requests
- **Library**: Uses [undici](https://github.com/nodejs/undici) ProxyAgent

### 3. Currently Applied To

- `/api/v1/video/generate` - Video generation API
- Any other API routes that import `@/lib/proxy-config`

## Usage

### Adding Proxy to New API Routes

Simply add this import at the top of your API route file:

```typescript
import "@/lib/proxy-config";
```

Example:

```typescript
// src/app/api/external-api/route.ts
import { NextRequest } from "next/server";
import "@/lib/proxy-config"; // Enable proxy for this route

export async function GET(request: NextRequest) {
  // All fetch calls will now use the configured proxy
  const response = await fetch("https://api.example.com/data");
  return Response.json(await response.json());
}
```

## Testing

Test your proxy configuration:

```bash
pnpm script:test-proxy
```

This will:
1. Load `.env.local` configuration
2. Test the proxy connection
3. Make sample HTTP/HTTPS requests through the proxy

## Troubleshooting

### Proxy Not Working

1. **Check proxy server is running**:
   ```bash
   curl http://127.0.0.1:1235
   ```

2. **Verify environment variables**:
   ```bash
   pnpm script:test-proxy
   ```

3. **Check Next.js logs**:
   Look for `📡 [Proxy] Global proxy configured` message

### Common Issues

| Issue | Solution |
|-------|----------|
| "ECONNREFUSED" | Proxy server not running at the configured address |
| "ETIMEDOUT" | Proxy server not responding or network issue |
| "Proxy authentication failed" | Your proxy requires authentication (not currently supported) |

## Important Notes

- ✅ Works with all server-side `fetch()` calls
- ✅ Works with external API integrations (Evolink, Kie, etc.)
- ✅ Automatic - no code changes needed after initial setup
- ⚠️ Only applies to server-side requests (browser requests not affected)
- ⚠️ Requires Node.js 18+ (undici is built-in)

## Proxy Server Options

Common proxy servers you can use:

1. **Clash** - https://github.com/Dreamacro/clash
2. **V2Ray** - https://www.v2fly.org/
3. **Shadowsocks** with local proxy
4. **System proxy** (on macOS/Linux)
5. **Corporate proxy** (if applicable)

## Example Setup

### Using Clash

```bash
# Install Clash
brew install clash

# Start Clash (default port: 7890)
clash

# Update .env.local
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

### Using V2Ray

```bash
# Start V2Ray (default port: 10808)
v2ray

# Update .env.local
HTTP_PROXY=http://127.0.0.1:10808
HTTPS_PROXY=http://127.0.0.1:10808
```

## Security Considerations

- 🔒 Never commit `.env.local` to version control
- 🔒 Use authenticated proxies in production environments
- 🔒 Regularly rotate proxy credentials
- 🔒 Monitor proxy access logs

## Additional Resources

- [undici Documentation](https://undici.nodejs.org/)
- [Node.js Fetch API](https://nodejs.org/api/globals.html#fetch)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
