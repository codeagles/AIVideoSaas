# API 集成指南

本文档详细描述项目中使用的外部 API 集成方案，包括 AI 视频生成 API 和 Creem 支付 API。

---

## 目录

1. [AI 视频 API 概览](#1-ai-视频-api-概览)
2. [evolink.ai API 集成](#2-evolinkai-api-集成)
3. [kie.ai API 集成](#3-kieai-api-集成)
4. [Creem 支付 API 集成](#4-creem-支付-api-集成)
5. [统一 API 抽象层设计](#5-统一-api-抽象层设计)

---

## 1. AI 视频 API 概览

### 1.1 API 提供商对比

| 特性 | evolink.ai | kie.ai |
|------|------------|--------|
| **主要模型** | Sora 2 | Sora 2 Pro |
| **API 风格** | REST | REST |
| **认证方式** | Bearer Token | Bearer Token |
| **Callback 支持** | ✅ 支持 | ✅ 支持 |
| **视频时长** | 10s / 15s | 10s / 15s |
| **画质选项** | 标准 | Standard / High |
| **水印移除** | ✅ 支持 | ✅ 支持 |
| **图生视频** | ✅ 支持 (1张) | ❌ 仅文生视频 |

### 1.2 通用流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  创建任务    │ ──► │  等待生成    │ ──► │  获取结果    │
│ POST /create │     │ Callback    │     │ 视频 URL    │
└─────────────┘     │ 或 轮询      │     └─────────────┘
                    └─────────────┘
```

### 1.3 环境变量

```bash
# evolink.ai
EVOLINK_API_KEY=your_evolink_api_key
EVOLINK_BASE_URL=https://api.evolink.ai/v1

# kie.ai
KIE_API_KEY=your_kie_api_key
KIE_BASE_URL=https://api.kie.ai/api/v1

# 通用
AI_CALLBACK_URL=https://yourdomain.com/api/v1/video/callback
AI_CALLBACK_SECRET=your_callback_secret
```

---

## 2. evolink.ai API 集成

### 2.1 API 基本信息

| 项目 | 值 |
|------|-----|
| **Base URL** | `https://api.evolink.ai/v1` |
| **认证方式** | `Authorization: Bearer YOUR_API_KEY` |
| **Content-Type** | `application/json` |

### 2.2 创建视频生成任务

**Endpoint**: `POST /videos/generations`

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | ✅ | 模型名称：`sora-2`, `sora-2-preview`, `sora-2-pro` |
| `prompt` | string | ✅ | 视频描述文本，最大 5000 tokens |
| `aspect_ratio` | string | ❌ | `16:9` (横版) 或 `9:16` (竖版)，默认 `16:9` |
| `duration` | integer | ❌ | 视频时长：`10` 或 `15` 秒，默认 `10` |
| `image_urls` | array | ❌ | 参考图片 URL 数组（最多 1 张），用于图生视频 |
| `remove_watermark` | boolean | ❌ | 是否移除水印，默认 `true` |
| `callback_url` | string | ❌ | 任务完成回调 URL |

#### 请求示例

```typescript
// 文生视频
const response = await fetch("https://api.evolink.ai/v1/videos/generations", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.EVOLINK_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "sora-2",
    prompt: "A serene mountain lake at sunrise, mist rising from the water",
    aspect_ratio: "16:9",
    duration: 10,
    remove_watermark: true,
    callback_url: "https://yourdomain.com/api/v1/video/callback/evolink"
  }),
});

// 图生视频
const response = await fetch("https://api.evolink.ai/v1/videos/generations", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.EVOLINK_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "sora-2",
    prompt: "The scene comes alive with gentle movement",
    image_urls: ["https://your-storage.com/image.jpg"],
    duration: 10,
    callback_url: "https://yourdomain.com/api/v1/video/callback/evolink"
  }),
});
```

#### 响应示例

```json
{
  "created": 1757169743,
  "id": "task-unified-1757169743-7cvnl5zw",
  "model": "sora-2",
  "status": "pending",
  "progress": 0,
  "task_info": {
    "can_cancel": true,
    "estimated_time": 300,
    "video_duration": 9
  },
  "usage": {
    "billing_rule": "per_call",
    "credits_reserved": 7
  }
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 任务 ID，用于查询状态 |
| `status` | string | 状态：`pending`, `processing`, `completed`, `failed`, `cancelled` |
| `progress` | integer | 进度百分比 0-100 |
| `task_info.estimated_time` | integer | 预计完成时间（秒） |
| `task_info.video_duration` | integer | 实际视频时长 |
| `usage.credits_reserved` | integer | 预留积分 |

### 2.3 查询任务状态

**Endpoint**: `GET /videos/generations/{task_id}`

#### 请求示例

```typescript
const response = await fetch(
  `https://api.evolink.ai/v1/videos/generations/${taskId}`,
  {
    headers: {
      "Authorization": `Bearer ${process.env.EVOLINK_API_KEY}`,
    },
  }
);
```

#### 完成状态响应

```json
{
  "id": "task-unified-1757169743-7cvnl5zw",
  "status": "completed",
  "progress": 100,
  "data": {
    "video_url": "https://cdn.evolink.ai/videos/xxx.mp4",
    "thumbnail_url": "https://cdn.evolink.ai/thumbnails/xxx.jpg",
    "duration": 10,
    "resolution": "1080p"
  },
  "task_info": {
    "actual_time": 245
  }
}
```

### 2.4 Callback 回调格式

当任务完成（成功/失败/取消）时，evolink 会向 `callback_url` 发送 POST 请求。

**回调特性**:
- 超时时间：10 秒
- 重试次数：3 次
- 需要返回 2xx 状态码确认接收

**回调 Payload 示例（成功）**:

```json
{
  "id": "task-unified-1757169743-7cvnl5zw",
  "status": "completed",
  "progress": 100,
  "data": {
    "video_url": "https://cdn.evolink.ai/videos/xxx.mp4",
    "thumbnail_url": "https://cdn.evolink.ai/thumbnails/xxx.jpg"
  }
}
```

**回调 Payload 示例（失败）**:

```json
{
  "id": "task-unified-1757169743-7cvnl5zw",
  "status": "failed",
  "error": {
    "code": "CONTENT_MODERATION",
    "message": "Content violates usage policy"
  }
}
```

### 2.5 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数无效 |
| 401 | 认证失败，检查 API Key |
| 402 | 余额不足 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |

### 2.6 注意事项

- 生成的视频链接有效期为 **24 小时**，需及时下载到自有存储
- 内容审核较严格，包含真人的图片可能失败
- 图生视频时，图片需为公开可访问的 URL

---

## 3. kie.ai API 集成

### 3.1 API 基本信息

| 项目 | 值 |
|------|-----|
| **Base URL** | `https://api.kie.ai/api/v1` |
| **认证方式** | `Authorization: Bearer YOUR_API_KEY` |
| **Content-Type** | `application/json` |

### 3.2 创建视频生成任务

**Endpoint**: `POST /jobs/createTask`

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | ✅ | 模型名称：`sora-2-pro-text-to-video` |
| `input` | object | ✅ | 输入参数对象 |
| `callBackUrl` | string | ❌ | 任务完成回调 URL |

#### input 对象参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | ✅ | 视频描述文本，最大 10000 字符 |
| `aspect_ratio` | string | ❌ | `portrait` (竖版) 或 `landscape` (横版)，默认 `landscape` |
| `n_frames` | string | ❌ | 视频时长：`"10"` 或 `"15"` 秒，默认 `"10"` |
| `size` | string | ❌ | 画质：`standard` 或 `high`，默认 `high` |
| `remove_watermark` | boolean | ❌ | 是否移除水印，默认 `true` |

#### 请求示例

```typescript
const response = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.KIE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "sora-2-pro-text-to-video",
    input: {
      prompt: "A futuristic city with flying cars and neon lights",
      aspect_ratio: "landscape",
      n_frames: "10",
      size: "high",
      remove_watermark: true
    },
    callBackUrl: "https://yourdomain.com/api/v1/video/callback/kie"
  }),
});
```

#### 响应示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "281e5b0a-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

### 3.3 查询任务状态

**Endpoint**: `GET /jobs/recordInfo?taskId={taskId}`

#### 请求示例

```typescript
const response = await fetch(
  `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
  {
    headers: {
      "Authorization": `Bearer ${process.env.KIE_API_KEY}`,
    },
  }
);
```

#### 响应示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "281e5b0a-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "model": "sora-2-pro-text-to-video",
    "state": "success",
    "param": "{\"model\":\"sora-2-pro-text-to-video\",\"input\":{...}}",
    "resultJson": "{\"resultUrls\":[\"https://file.xxx.com/video.mp4\"]}",
    "failCode": null,
    "failMsg": null,
    "costTime": 180000,
    "completeTime": 1757584344490,
    "createTime": 1757584164490
  }
}
```

#### 状态字段说明

| 状态值 | 说明 |
|--------|------|
| `waiting` | 等待处理 |
| `success` | 生成成功 |
| `fail` | 生成失败 |

#### 结果解析

```typescript
// 解析 resultJson
const result = JSON.parse(data.resultJson);
const videoUrl = result.resultUrls[0]; // 视频 URL
```

### 3.4 Callback 回调格式

kie.ai 的回调内容与查询任务状态 API 响应格式完全一致。

**回调 Payload 示例**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "281e5b0a-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "model": "sora-2-pro-text-to-video",
    "state": "success",
    "param": "{...}",
    "resultJson": "{\"resultUrls\":[\"https://file.xxx.com/video.mp4\"]}",
    "costTime": 180000,
    "completeTime": 1757584344490,
    "createTime": 1757584164490
  }
}
```

### 3.5 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数无效 |
| 401 | 认证失败，检查 API Key |
| 402 | 余额不足 |
| 404 | 资源不存在 |
| 422 | 参数验证失败 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |

---

## 4. Creem 支付 API 集成

### 4.1 概述

Creem 提供了专门的 Better Auth 插件，可以与现有认证系统无缝集成。

### 4.2 安装

```bash
pnpm add @creem_io/better-auth
```

### 4.3 服务端配置

**文件**: `packages/auth/index.ts`

```typescript
import { betterAuth } from "better-auth";
import { creem } from "@creem_io/better-auth";

export const auth = betterAuth({
  database: {
    // 现有数据库配置
  },
  plugins: [
    // 现有插件...
    creem({
      apiKey: process.env.CREEM_API_KEY!,
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET,
      testMode: process.env.NODE_ENV !== "production",
      persistSubscriptions: true, // 持久化订阅状态到数据库

      // 授权访问时的回调
      onGrantAccess: async ({ customer, product, metadata }) => {
        // 在这里充值积分
        console.log("Access granted:", { customer, product });

        // 根据产品 ID 充值对应积分
        const creditsMap: Record<string, number> = {
          "prod_starter": 100,
          "prod_pro": 500,
          "prod_business": 2000,
        };

        const credits = creditsMap[product.id] || 0;
        if (credits > 0) {
          await creditService.recharge({
            userId: customer.userId,
            credits,
            orderNo: metadata?.orderId || `creem_${Date.now()}`,
            remark: `Creem payment: ${product.name}`,
          });
        }
      },

      // 撤销访问时的回调
      onRevokeAccess: async ({ customer, product, metadata }) => {
        console.log("Access revoked:", { customer, product });
        // 可选：处理订阅取消逻辑
      },
    }),
  ],
});
```

### 4.4 客户端配置

**文件**: `apps/nextjs/src/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";
import { creemClient } from "@creem_io/better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    creemClient(),
  ],
});

// 导出 Creem 相关方法
export const { creem } = authClient;
```

### 4.5 客户端 API 使用

#### 创建结账会话

```typescript
import { creem } from "~/lib/auth-client";

// 创建支付
const handleCheckout = async (productId: string) => {
  const { data, error } = await creem.createCheckout({
    productId,
    successUrl: "/dashboard?payment=success",
    cancelUrl: "/pricing",
    discountCode: "LAUNCH50", // 可选优惠码
  });

  if (error) {
    console.error("Checkout error:", error);
    return;
  }

  // 重定向到支付页面
  window.location.href = data.checkoutUrl;
};
```

#### 打开客户门户

```typescript
const handleManageSubscription = async () => {
  const { data, error } = await creem.createPortal();

  if (data?.portalUrl) {
    window.location.href = data.portalUrl;
  }
};
```

#### 检查订阅状态

```typescript
const checkAccess = async () => {
  const { data } = await creem.hasAccessGranted();

  if (data?.hasAccess) {
    console.log("User has active subscription");
    console.log("Product:", data.product);
    console.log("Subscription:", data.subscription);
  }
};
```

#### 取消订阅

```typescript
const handleCancel = async () => {
  const { error } = await creem.cancelSubscription();

  if (!error) {
    console.log("Subscription cancelled");
  }
};
```

### 4.6 Webhook 处理

Better Auth Creem 插件会自动处理 Webhook，无需手动配置路由。插件内部会：

1. 验证 Webhook 签名
2. 解析事件类型
3. 调用 `onGrantAccess` 或 `onRevokeAccess` 回调
4. 更新数据库中的订阅状态

### 4.7 环境变量

```bash
# Creem 配置
CREEM_API_KEY=creem_live_xxxxxxxx
CREEM_WEBHOOK_SECRET=whsec_xxxxxxxx

# 产品 ID（在 Creem 后台创建）
NEXT_PUBLIC_CREEM_PRODUCT_STARTER=prod_starter
NEXT_PUBLIC_CREEM_PRODUCT_PRO=prod_pro
NEXT_PUBLIC_CREEM_PRODUCT_BUSINESS=prod_business
```

### 4.8 数据库 Schema 扩展

Creem 插件会自动创建必要的表，但可以自定义：

```prisma
// 可选：自定义订阅表（如果 persistSubscriptions: true）
model CreemSubscription {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  productId       String    @map("product_id")
  subscriptionId  String    @unique @map("subscription_id")
  status          String    // active, cancelled, expired
  currentPeriodEnd DateTime? @map("current_period_end")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  user            BetterAuthUser @relation(fields: [userId], references: [id])

  @@map("creem_subscriptions")
}
```

---

## 5. 统一 API 抽象层设计

### 5.1 设计目标

为了支持多个 AI 视频提供商，我们需要设计一个统一的抽象层：

```
┌─────────────────────────────────────────────────┐
│               VideoService (统一接口)            │
├─────────────────────────────────────────────────┤
│  generate()  │  getStatus()  │  handleCallback() │
└───────┬──────┴───────┬───────┴────────┬─────────┘
        │              │                │
┌───────▼──────┐ ┌─────▼─────┐ ┌────────▼────────┐
│ EvolinkClient │ │ KieClient │ │ Future Provider │
└──────────────┘ └───────────┘ └─────────────────┘
```

### 5.2 接口定义

**文件**: `packages/common/src/ai/types.ts`

```typescript
// 统一的视频生成参数
export interface VideoGenerationParams {
  prompt: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  duration?: 10 | 15;
  quality?: "standard" | "high";
  imageUrl?: string;
  removeWatermark?: boolean;
  callbackUrl?: string;
}

// 统一的任务响应
export interface VideoTaskResponse {
  taskId: string;
  provider: "evolink" | "kie";
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  estimatedTime?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: {
    code: string;
    message: string;
  };
  raw?: any; // 原始响应数据
}

// Provider 接口
export interface AIVideoProvider {
  name: string;
  createTask(params: VideoGenerationParams): Promise<VideoTaskResponse>;
  getTaskStatus(taskId: string): Promise<VideoTaskResponse>;
  parseCallback(payload: any): VideoTaskResponse;
}
```

### 5.3 Provider 实现

**文件**: `packages/common/src/ai/providers/evolink.ts`

```typescript
import type { AIVideoProvider, VideoGenerationParams, VideoTaskResponse } from "../types";

export class EvolinkProvider implements AIVideoProvider {
  name = "evolink";
  private apiKey: string;
  private baseUrl = "https://api.evolink.ai/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createTask(params: VideoGenerationParams): Promise<VideoTaskResponse> {
    const response = await fetch(`${this.baseUrl}/videos/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sora-2",
        prompt: params.prompt,
        aspect_ratio: params.aspectRatio || "16:9",
        duration: params.duration || 10,
        image_urls: params.imageUrl ? [params.imageUrl] : undefined,
        remove_watermark: params.removeWatermark ?? true,
        callback_url: params.callbackUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create task");
    }

    const data = await response.json();

    return {
      taskId: data.id,
      provider: "evolink",
      status: this.mapStatus(data.status),
      progress: data.progress,
      estimatedTime: data.task_info?.estimated_time,
      raw: data,
    };
  }

  async getTaskStatus(taskId: string): Promise<VideoTaskResponse> {
    const response = await fetch(`${this.baseUrl}/videos/generations/${taskId}`, {
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get task status");
    }

    const data = await response.json();

    return {
      taskId: data.id,
      provider: "evolink",
      status: this.mapStatus(data.status),
      progress: data.progress,
      videoUrl: data.data?.video_url,
      thumbnailUrl: data.data?.thumbnail_url,
      error: data.error ? {
        code: data.error.code,
        message: data.error.message,
      } : undefined,
      raw: data,
    };
  }

  parseCallback(payload: any): VideoTaskResponse {
    return {
      taskId: payload.id,
      provider: "evolink",
      status: this.mapStatus(payload.status),
      progress: payload.progress,
      videoUrl: payload.data?.video_url,
      thumbnailUrl: payload.data?.thumbnail_url,
      error: payload.error,
      raw: payload,
    };
  }

  private mapStatus(status: string): VideoTaskResponse["status"] {
    const statusMap: Record<string, VideoTaskResponse["status"]> = {
      pending: "pending",
      processing: "processing",
      completed: "completed",
      failed: "failed",
      cancelled: "failed",
    };
    return statusMap[status] || "pending";
  }
}
```

**文件**: `packages/common/src/ai/providers/kie.ts`

```typescript
import type { AIVideoProvider, VideoGenerationParams, VideoTaskResponse } from "../types";

export class KieProvider implements AIVideoProvider {
  name = "kie";
  private apiKey: string;
  private baseUrl = "https://api.kie.ai/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createTask(params: VideoGenerationParams): Promise<VideoTaskResponse> {
    const response = await fetch(`${this.baseUrl}/jobs/createTask`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sora-2-pro-text-to-video",
        input: {
          prompt: params.prompt,
          aspect_ratio: params.aspectRatio === "9:16" ? "portrait" : "landscape",
          n_frames: String(params.duration || 10),
          size: params.quality || "high",
          remove_watermark: params.removeWatermark ?? true,
        },
        callBackUrl: params.callbackUrl,
      }),
    });

    const result = await response.json();

    if (result.code !== 200) {
      throw new Error(result.msg || "Failed to create task");
    }

    return {
      taskId: result.data.taskId,
      provider: "kie",
      status: "pending",
      raw: result,
    };
  }

  async getTaskStatus(taskId: string): Promise<VideoTaskResponse> {
    const response = await fetch(
      `${this.baseUrl}/jobs/recordInfo?taskId=${taskId}`,
      {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      }
    );

    const result = await response.json();

    if (result.code !== 200) {
      throw new Error(result.msg || "Failed to get task status");
    }

    const data = result.data;
    let videoUrl: string | undefined;

    if (data.state === "success" && data.resultJson) {
      const resultData = JSON.parse(data.resultJson);
      videoUrl = resultData.resultUrls?.[0];
    }

    return {
      taskId: data.taskId,
      provider: "kie",
      status: this.mapStatus(data.state),
      videoUrl,
      error: data.failCode ? {
        code: data.failCode,
        message: data.failMsg || "Unknown error",
      } : undefined,
      raw: data,
    };
  }

  parseCallback(payload: any): VideoTaskResponse {
    const data = payload.data || payload;
    let videoUrl: string | undefined;

    if (data.state === "success" && data.resultJson) {
      const resultData = JSON.parse(data.resultJson);
      videoUrl = resultData.resultUrls?.[0];
    }

    return {
      taskId: data.taskId,
      provider: "kie",
      status: this.mapStatus(data.state),
      videoUrl,
      error: data.failCode ? {
        code: data.failCode,
        message: data.failMsg,
      } : undefined,
      raw: data,
    };
  }

  private mapStatus(state: string): VideoTaskResponse["status"] {
    const statusMap: Record<string, VideoTaskResponse["status"]> = {
      waiting: "pending",
      success: "completed",
      fail: "failed",
    };
    return statusMap[state] || "pending";
  }
}
```

### 5.4 Provider 工厂

**文件**: `packages/common/src/ai/index.ts`

```typescript
import type { AIVideoProvider } from "./types";
import { EvolinkProvider } from "./providers/evolink";
import { KieProvider } from "./providers/kie";

export type ProviderType = "evolink" | "kie";

const providers: Map<ProviderType, AIVideoProvider> = new Map();

export function getProvider(type: ProviderType): AIVideoProvider {
  if (providers.has(type)) {
    return providers.get(type)!;
  }

  let provider: AIVideoProvider;

  switch (type) {
    case "evolink":
      provider = new EvolinkProvider(process.env.EVOLINK_API_KEY!);
      break;
    case "kie":
      provider = new KieProvider(process.env.KIE_API_KEY!);
      break;
    default:
      throw new Error(`Unknown provider: ${type}`);
  }

  providers.set(type, provider);
  return provider;
}

// 获取默认 Provider
export function getDefaultProvider(): AIVideoProvider {
  const defaultType = (process.env.DEFAULT_AI_PROVIDER as ProviderType) || "evolink";
  return getProvider(defaultType);
}

// 导出类型
export * from "./types";
```

### 5.5 统一回调处理

**文件**: `apps/nextjs/src/app/api/v1/video/callback/[provider]/route.ts`

```typescript
import { NextRequest } from "next/server";
import { getProvider, type ProviderType } from "@saasfly/common/ai";
import { videoService } from "@saasfly/common/services/video";
import { apiSuccess, apiError } from "@/app/api/_lib/response";

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const providerType = params.provider as ProviderType;
    const provider = getProvider(providerType);

    const payload = await request.json();
    const result = provider.parseCallback(payload);

    await videoService.handleCallback({
      taskId: result.taskId,
      provider: result.provider,
      status: result.status,
      videoUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      error: result.error,
    });

    return apiSuccess({ received: true });
  } catch (error) {
    console.error("Callback error:", error);
    return apiError("Callback processing failed", 500);
  }
}
```

---

## 附录

### A. 完整环境变量列表

```bash
# ============================================
# AI Video Providers
# ============================================

# evolink.ai
EVOLINK_API_KEY=your_evolink_api_key

# kie.ai
KIE_API_KEY=your_kie_api_key

# 默认 Provider
DEFAULT_AI_PROVIDER=evolink

# Callback
AI_CALLBACK_URL=https://yourdomain.com/api/v1/video/callback
AI_CALLBACK_SECRET=your_callback_secret

# ============================================
# Creem Payment
# ============================================

CREEM_API_KEY=creem_live_xxxxxxxx
CREEM_WEBHOOK_SECRET=whsec_xxxxxxxx

# 产品 ID
NEXT_PUBLIC_CREEM_PRODUCT_STARTER=prod_starter
NEXT_PUBLIC_CREEM_PRODUCT_PRO=prod_pro
NEXT_PUBLIC_CREEM_PRODUCT_BUSINESS=prod_business
```

### B. 模型参数对照表

| 参数 | evolink | kie |
|------|---------|-----|
| **模型名** | `sora-2` | `sora-2-pro-text-to-video` |
| **横版** | `16:9` | `landscape` |
| **竖版** | `9:16` | `portrait` |
| **10秒** | `10` (integer) | `"10"` (string) |
| **15秒** | `15` (integer) | `"15"` (string) |
| **标准画质** | - | `standard` |
| **高画质** | - | `high` |
| **图生视频** | ✅ `image_urls` | ❌ 不支持 |

### C. 积分消耗建议

| 模型 | 时长 | 画质 | 建议积分 |
|------|------|------|----------|
| Sora 2 (evolink) | 10s | - | 15 |
| Sora 2 (evolink) | 15s | - | 22 |
| Sora 2 Pro (kie) | 10s | standard | 18 |
| Sora 2 Pro (kie) | 10s | high | 25 |
| Sora 2 Pro (kie) | 15s | standard | 27 |
| Sora 2 Pro (kie) | 15s | high | 38 |

---

## 更新日志

| 日期 | 版本 | 说明 |
|------|------|------|
| 2025-01-15 | 1.0 | 初始版本，包含 evolink、kie、Creem 集成 |
