# VideoFly Project Context

## Quick Reference

### Package Imports

```typescript
// Database
import { db, VideoStatus, CreditTransType } from "@videofly/db";

// Services
import { creditService } from "@videofly/common/services/credit";
import { videoService } from "@videofly/common/services/video";

// AI Providers
import { getProvider, getDefaultProvider } from "@videofly/common/ai";

// Config
import { getModelConfig, calculateModelCredits } from "@videofly/common/config/credits";

// Storage
import { getStorage } from "@videofly/common/storage";

// Auth
import { auth } from "@videofly/auth";

// UI Components
import { Button } from "@videofly/ui/button";
import { toast } from "@videofly/ui/use-toast";

// Video Generator
import { VideoGeneratorInput, type SubmitData } from "@videofly/video-generator";
```

### API Response Format

All REST API endpoints use consistent response format:

```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { message: "...", details?: any } }
```

### API Auth Helper

```typescript
import { requireAuth } from "~/lib/api/auth";
import { apiSuccess, handleApiError } from "~/lib/api/response";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    // ... business logic
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Video Generation Flow

```
1. User submits prompt → POST /api/v1/video/generate
2. System freezes credits
3. AI provider receives task
4. Provider calls webhook → POST /api/v1/video/callback/[provider]
5. System downloads video, uploads to R2
6. Credits settled, video marked COMPLETED
```

### Credit Operations

```typescript
// Freeze credits before task
const { holdId } = await creditService.freeze({
  userId,
  credits: 15,
  videoUuid,
});

// On success - settle
await creditService.settle(holdId, actualCredits);

// On failure - release
await creditService.release(holdId);
```

## Common Tasks

### Add New AI Provider

1. Create provider file: `packages/common/src/ai/providers/[name].ts`
2. Implement `AIVideoProvider` interface
3. Register in `packages/common/src/ai/index.ts`
4. Add model config in `packages/common/src/config/credits.ts`

### Add New API Endpoint

1. Create route: `apps/nextjs/src/app/api/v1/[path]/route.ts`
2. Use `requireAuth()` for protected routes
3. Return `apiSuccess()` or `handleApiError()`

### Add New Credit Package

Edit `packages/common/src/config/credits.ts`:
```typescript
export const CREDIT_PACKAGES: CreditPackageConfig[] = [
  { id: "new_pack", name: "...", credits: 100, ... }
];
```

## Environment Setup

Required environment variables for development:

```bash
DATABASE_URL=postgresql://localhost:5432/videofly
BETTER_AUTH_SECRET=dev-secret-min-32-chars
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=videofly
AI_CALLBACK_URL=http://localhost:3000/api/v1/video/callback
AI_CALLBACK_SECRET=dev-callback-secret
```

## Debugging

### Check Video Status
```bash
curl http://localhost:3000/api/v1/video/[uuid]/status
```

### Check Credit Balance
```bash
curl http://localhost:3000/api/v1/credit/balance \
  -H "Cookie: better-auth.session_token=..."
```

### Test Callback (Mock)
```bash
curl -X POST http://localhost:3000/api/v1/video/callback/evolink \
  -H "Content-Type: application/json" \
  -d '{"task_id": "...", "status": "completed", "video_url": "..."}'
```
