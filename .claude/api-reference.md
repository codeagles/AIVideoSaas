# VideoFly API Reference

Base URL: `/api/v1`

## Authentication

All endpoints (except callbacks) require authentication via Better Auth session cookie.

## User API

### GET /user/me

Get current authenticated user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://..."
  }
}
```

## Credit API

### GET /credit/balance

Get user's credit balance.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCredits": 100,
    "usedCredits": 25,
    "frozenCredits": 15,
    "availableCredits": 60,
    "expiringSoon": 20
  }
}
```

### GET /credit/history

Get credit transaction history.

**Query Parameters:**
- `limit` (optional): Number of records (default: 20)
- `cursor` (optional): Pagination cursor

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "credits": -15,
        "balance_after": 85,
        "trans_type": "VIDEO_GENERATE",
        "video_uuid": "vid_abc123",
        "remark": "Video generation",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "nextCursor": "cursor_string"
  }
}
```

## Video API

### POST /video/generate

Start a new video generation task.

**Request Body:**
```json
{
  "prompt": "A cat playing piano",
  "model": "sora-2",
  "duration": 10,
  "aspectRatio": "16:9",
  "quality": "standard",
  "imageUrl": "https://..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | string | Yes | Video description |
| model | string | Yes | `sora-2` or `sora-2-pro` |
| duration | number | Yes | `10` or `15` seconds |
| aspectRatio | string | No | `16:9` or `9:16` |
| quality | string | No | `standard` or `high` |
| imageUrl | string | No | Reference image URL |

**Response:**
```json
{
  "success": true,
  "data": {
    "videoUuid": "vid_abc123xyz",
    "taskId": "task_provider_123",
    "provider": "evolink",
    "status": "PENDING",
    "creditsUsed": 15
  }
}
```

### GET /video/list

List user's videos.

**Query Parameters:**
- `limit` (optional): Number of records (default: 20)
- `cursor` (optional): Pagination cursor
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "uuid": "vid_abc123",
        "prompt": "A cat playing piano",
        "model": "sora-2",
        "status": "COMPLETED",
        "video_url": "https://...",
        "thumbnail_url": "https://...",
        "duration": 10,
        "aspect_ratio": "16:9",
        "credits_used": 15,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "nextCursor": "cursor_string"
  }
}
```

### GET /video/[uuid]

Get single video details.

**Response:**
```json
{
  "success": true,
  "data": {
    "uuid": "vid_abc123",
    "prompt": "A cat playing piano",
    "model": "sora-2",
    "status": "COMPLETED",
    "video_url": "https://...",
    "thumbnail_url": "https://...",
    "parameters": {
      "duration": 10,
      "aspectRatio": "16:9"
    },
    "credits_used": 15,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### DELETE /video/[uuid]

Soft delete a video.

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

### GET /video/[uuid]/status

Poll video generation status. Also triggers status refresh from AI provider.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "GENERATING",
    "progress": 50,
    "videoUrl": null,
    "error": null
  }
}
```

**Status Values:**
- `PENDING` - Waiting in queue
- `GENERATING` - AI is generating
- `UPLOADING` - Uploading to storage
- `COMPLETED` - Ready to view
- `FAILED` - Generation failed

### POST /video/callback/[provider]

AI provider webhook endpoint. Called by AI providers when generation completes.

**Path Parameters:**
- `provider`: `evolink` or `kie`

**Query Parameters:**
- `uuid`: Video UUID
- `ts`: Timestamp
- `sig`: HMAC signature

**Request Body:** Provider-specific payload

**Response:**
```json
{
  "success": true
}
```

## Upload API

### POST /upload/presign

Get presigned URL for image upload.

**Request Body:**
```json
{
  "filename": "reference.jpg",
  "contentType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://r2.../presigned-url",
    "publicUrl": "https://cdn.../uploads/user123/abc.jpg",
    "key": "uploads/user123/abc.jpg",
    "expiresIn": 3600
  }
}
```

## Config API

### GET /config/models

Get available video generation models.

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "sora-2",
        "name": "Sora 2",
        "description": "OpenAI's video model",
        "provider": "evolink",
        "creditCost": 15,
        "supportImageToVideo": true,
        "durations": [10, 15],
        "aspectRatios": ["16:9", "9:16"]
      }
    ]
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": { ... }
  }
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error
