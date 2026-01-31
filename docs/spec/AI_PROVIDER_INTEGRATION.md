# AI Provider 接入规范

> **AI 辅助开发参考文档** | 最后更新: 2026-01-26

---

## 📋 文档说明

本文档定义了 VideoFly 平台接入 AI 视频生成提供商的**架构规范、数据结构和方法约定**。

**使用方法**：
1. 向 AI 提供本文档 + 供应商 API 文档
2. AI 根据规范生成符合架构的代码

**文档原则**：
- ✅ 关注架构、结构和规范
- ✅ 具体代码实现由 AI 根据当前代码库生成
- ✅ 避免代码变化导致文档过时

---

## 🏗️ 三层映射架构

```
┌─────────────────────────────────────────────────────────────┐
│  第1层：用户层（前端 UI）                                      │
│  用户看到的统一模型 ID: "sora-2", "wan2.6", "veo-3.1"      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  第2层：映射层（model-mapping.ts）                            │
│  • 内部模型 ID → 供应商模型 ID                                │
│  • 统一参数 → 供应商参数                                      │
│  • 动态模型选择（基于参数）                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  第3层：Provider 层（providers/*.ts）                         │
│  • AIVideoProvider 接口实现                                   │
│  • API 调用、状态查询、回调解析                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  供应商 API（Evolink / KIE / 新供应商）                       │
└─────────────────────────────────────────────────────────────┘
```

**架构优势**：
- **解耦**: 用户层不感知具体供应商
- **灵活**: 可通过环境变量切换供应商
- **扩展**: 新增供应商/模型无需修改前端
- **维护**: 映射配置集中管理

---

## 📦 核心文件与职责

| 文件 | 职责 | 关键内容 |
|------|------|----------|
| `src/ai/types.ts` | 类型定义 | `AIVideoProvider` 接口、参数结构 |
| `src/ai/model-mapping.ts` | 映射配置 | `MODEL_MAPPINGS`、参数转换函数 |
| `src/ai/providers/*.ts` | Provider 实现 | 各供应商的 API 调用逻辑 |
| `src/ai/index.ts` | Provider 工厂 | `getProvider()` 工厂方法 |
| `src/services/video.ts` | 业务服务 | 调用 Provider 生成视频 |
| `src/config/credits.ts` | 计费配置 | 模型积分计算规则 |

---

## 🎯 接入新 Provider 流程

### 第1步：分析供应商 API

需要收集的信息：

| 信息项 | 说明 | 示例 |
|--------|------|------|
| **API 基地址** | API endpoint 前缀 | `https://api.example.com/v1` |
| **认证方式** | API Key 传递方式 | `Authorization: Bearer {key}` |
| **创建任务端点** | POST 路径 | `/videos/generations` |
| **查询状态端点** | GET 路径 | `/tasks/{task_id}` |
| **请求格式** | Content-Type | `application/json` |
| **响应格式** | 返回数据结构 | `{ task_id, status, video_url }` |
| **模型 ID** | 各模型的标识 | `model-v1`, `model-v2` |
| **参数映射** | 供应商参数名 | `prompt`, `aspect_ratio`, `duration` |
| **特殊端点** | 某些模型的独立端点 | `/api/v1/special-model/generate` |
| **回调格式** | Webhook 数据结构 | `{ task_id, status, result }` |

### 第2步：实现 Provider 类

**文件位置**: `src/ai/providers/{provider-name}.ts`

**类结构**：
```
{ProviderName}Provider implements AIVideoProvider
├── name: string                    # Provider 标识（如 "evolink"）
├── supportImageToVideo: boolean    # 是否支持图生视频
├── apiKey: string                  # API 密钥
├── baseUrl: string                 # API 基地址
├── constructor(apiKey)             # 初始化
├── createTask(params)              # 创建生成任务
├── getTaskStatus(taskId)           # 查询任务状态
└── parseCallback(payload)          # 解析回调数据
```

**方法规范**：

#### `createTask(params)`
- **输入**: `VideoGenerationParams` (统一参数格式)
- **输出**: `VideoTaskResponse` (包含 taskId, status, raw)
- **职责**:
  1. 调用 `getProviderModelId()` 获取供应商模型 ID
  2. 调用 `transformParamsForProvider()` 转换参数
  3. 发送 POST 请求到供应商 API
  4. 返回统一格式的任务响应

#### `getTaskStatus(taskId)`
- **输入**: taskId (string)
- **输出**: `VideoTaskResponse` (包含 status, videoUrl, error)
- **职责**:
  1. 发送 GET 请求查询任务状态
  2. **必须处理**特殊 HTTP 状态码：
     - `404/410` → 返回 `status: "failed"` (任务不存在)
     - `429` → 抛出友好错误 (速率限制)
     - `401/403` → 抛出友好错误 (认证失败)
  3. 映射供应商状态到统一状态
  4. 提取 videoUrl、thumbnailUrl

#### `parseCallback(payload)`
- **输入**: Webhook 回调数据 (any)
- **输出**: `VideoTaskResponse`
- **职责**:
  1. 解析供应商回调格式
  2. 提取 taskId、status、videoUrl
  3. 映射到统一响应格式

### 第3步：添加 Provider 类型

**需要修改的文件**：
1. `src/ai/model-mapping.ts` - 添加到 `ProviderType`
2. `src/ai/types.ts` - 添加到 `VideoTaskResponse["provider"]`
3. `src/ai/index.ts` - 在 `getProvider()` 工厂方法中注册

**类型定义位置**：
```typescript
// src/ai/model-mapping.ts
export type ProviderType = "evolink" | "kie" | "new-provider";

// src/ai/types.ts
export interface VideoTaskResponse {
  provider: "evolink" | "kie" | "new-provider";
}
```

### 第4步：配置环境变量

在 `.env.local` 添加：
```bash
{PROVIDER_NAME}_API_KEY=your_api_key_here
```

**命名规范**: 全大写 + `_API_KEY` 后缀

### 第5步：添加模型映射配置

在 `src/ai/model-mapping.ts` 的 `MODEL_MAPPINGS` 中添加配置。

---

---

## 🔧 参数转换规范

### 统一参数 vs 供应商参数

**统一参数** (VideoGenerationParams):
| 参数 | 类型 | 说明 |
|------|------|------|
| `model` | string | 内部模型 ID（如 "sora-2"） |
| `prompt` | string | 文本提示词 |
| `aspectRatio` | string | 宽高比（"16:9", "9:16"） |
| `duration` | number | 时长（秒） |
| `quality` | string | 质量（"standard", "high", "720p", "1080p"） |
| `imageUrl` | string | 单图 URL（图生视频） |
| `imageUrls` | string[] | 多图 URL 数组 |
| `mode` | string | 生成模式（如 "reference-to-video"） |
| `callbackUrl` | string | 回调 URL |
| `removeWatermark` | boolean | 是否去水印 |

**供应商参数转换示例**:

| 统一参数 | Evolink | KIE | 说明 |
|---------|---------|-----|------|
| `prompt` | `prompt` | `input.prompt` | KIE 需嵌套在 input 中 |
| `aspectRatio` | `aspect_ratio` | `input.aspect_ratio` | 都用下划线 |
| `duration` | `10` (number) | `"10"` (string) | KIE 必须是字符串 |
| `quality` | `"720p"` | 混合 | 见下表 |
| `imageUrl` | `image_urls[]` | `image_urls[]` / `input_urls[]` | Seedance 用 input_urls |
| `callbackUrl` | `callback_url` | `callBackUrl` | KIE 用驼峰 |

### 质量参数转换规则

| 统一值 | Evolink | KIE Sora 2 | KIE 其他 | 说明 |
|--------|---------|-----------|----------|------|
| `"standard"` | `"720p"` | `"standard"` | `"720p"` | Sora 用特殊值 |
| `"high"` | `"1080p"` | `"high"` | `"1080p"` | Sora 用特殊值 |
| `"480P"` | `"480p"` | `"standard"` | `"480p"` | 需大小写转换 |
| `"720P"` | `"720p"` | `"standard"` | `"720p"` | 需大小写转换 |
| `"1080P"` | `"1080p"` | `"high"` | `"1080p"` | 需大小写转换 |

**转换函数**: `normalizeQuality(value, provider, internalModelId)`
- 位置: `src/ai/model-mapping.ts`
- 职责: 统一不同质量枚举到供应商格式

### 参数转换策略

**1. 命名风格转换**:
- 统一参数: camelCase (`aspectRatio`, `callbackUrl`)
- 供应商: 混合（snake_case / camelCase）

**2. 数据类型转换**:
- `duration`: number (统一) → string (某些供应商)
- `imageUrl`: string (单图) → `imageUrls[]` (数组)

**3. 结构嵌套**:
- 某些供应商需要参数嵌套在 `input` 对象中
- 示例: KIE 需要 `{ input: { prompt: "..." } }`

**4. 模型特定参数**:
- 不同模型对同一参数可能有不同命名
- 示例: Sora 2 用 `size` 表示质量，其他模型用 `resolution`

**转换函数**: `transformParamsForProvider(internalModelId, provider, params)`
- 位置: `src/ai/model-mapping.ts`
- 职责: 根据供应商和模型转换参数格式

---

## 🔌 模型映射配置结构

### MODEL_MAPPINGS 数据结构

```typescript
MODEL_MAPPINGS: Record<string, ModelMapping>
```

**ModelMapping 结构**:
```
{
  internalId: string           # 内部统一 ID（如 "sora-2"）
  displayName: string          # 显示名称（如 "Sora 2"）
  providers: {
    [providerName]: {
      providerModelId: string | function   # 供应商模型 ID
      apiEndpoint?: string                 # 可选：特殊端点
      supported: boolean                   # 是否支持
      transformParams?: function           # 自定义转换函数
    }
  }
}
```

### providerModelId 的两种形式

**1. 静态字符串** (模型 ID 固定):
```typescript
providerModelId: "sora-2"
```

**2. 动态函数** (根据参数选择模型):
```typescript
providerModelId: (params) => {
  // 根据参数动态返回不同的模型 ID
  if (params.mode === "reference-to-video") {
    return "model-reference-video";
  }
  return params.imageUrl
    ? "model-image-to-video"
    : "model-text-to-video";
}
```

**使用场景**:
- 文生视频 vs 图生视频使用不同模型 ID
- 不同质量使用不同模型（如 Veo 3.1 的 veo3 vs veo3_fast）
- 不同模式使用不同模型（如 Wan 2.6 的 reference-video）

### apiEndpoint 的使用

**默认端点**: 大多数模型使用供应商的标准端点
**特殊端点**: 某些模型需要独立端点（如 KIE Veo 3.1）

示例:
```typescript
apiEndpoint: "/api/v1/veo/generate"  # Veo 3.1 独立端点
```

Provider 实现中需处理:
```typescript
const apiEndpoint = providerConfig?.apiEndpoint || "/api/v1/jobs/createTask";
const response = await fetch(`${this.baseUrl}${apiEndpoint}`, ...);
```

---

## ✅ 当前已接入模型对照

> **唯一事实源**: `src/ai/model-mapping.ts`
> 下面是当前项目已接入模型的完整对照关系（含动态选择规则和参考文档）。

### 模型映射总览

| 统一模型 ID | Evolink 模型 ID | KIE 模型 ID | 特殊端点 | 参考文档 |
|-------------|----------------|-------------|----------|----------|
| **sora-2** | `sora-2` | `sora-2-text-to-video`<br/>`sora-2-image-to-video` | ❌ 默认端点 | KIE: [文生](../API_KIE/sora-2-text-to-video.md) \| [图生](../API_KIE/sora-2-image-to-video.md)<br/>Evolink: [PRICING.md](./PRICING.md) |
| **wan2.6** | `wan2.6-text-to-video`<br/>`wan2.6-image-to-video`<br/>`wan2.6-reference-video` | `wan/2-6-text-to-video`<br/>`wan/2-6-image-to-video`<br/>`wan/2-6-video-to-video` | ❌ 默认端点 | KIE: [文生](../API_KIE/wan/2-6-text-to-video.md) \| [图生](../API_KIE/wan/2-6-image-to-video.md) \| [参考视频](../API_KIE/wan/2-6-video-to-video.md)<br/>Evolink: [PRICING.md](./PRICING.md) |
| **veo-3.1** | `veo3.1-fast` | `veo3_fast` \| `veo3` | ✅ **KIE**: `/api/v1/veo/generate` | KIE: [veo-3.1.md](../API_KIE/veo-3-1.md)<br/>Evolink: [PRICING.md](./PRICING.md) |
| **seedance-1.5-pro** | `seedance-1.5-pro` | `bytedance/seedance-1.5-pro` | ❌ 默认端点 | KIE: [seedance-1.5-pro.md](../API_KIE/bytedance/seedance-1.5-pro.md)<br/>Evolink: [PRICING.md](./PRICING.md) |

### 动态模型选择规则

#### Sora 2
- **KIE**: 根据 `imageUrl` 或 `imageUrls` 是否存在自动选择
  - 有图片 → `sora-2-image-to-video`
  - 无图片 → `sora-2-text-to-video`
- **Evolink**: 固定使用 `sora-2`

#### Wan 2.6
- **Evolink**: 三种模式
  - `mode === "reference-to-video"` → `wan2.6-reference-video`
  - 有 `imageUrl` 或 `imageUrls` → `wan2.6-image-to-video`
  - 否则 → `wan2.6-text-to-video`
- **KIE**: 三种模式（对应 Evolink）
  - `mode === "reference-to-video"` → `wan/2-6-video-to-video`
  - 有图片 → `wan/2-6-image-to-video`
  - 否则 → `wan/2-6-text-to-video`

#### Veo 3.1
- **Evolink**: 固定使用 `veo3.1-fast`
- **KIE**: 根据 `quality` 动态选择
  - `quality === "high"` 或 `"1080p"` 或 `"4k"` → `veo3`（质量版）
  - 否则 → `veo3_fast`（快速版）
- **特殊端点**: KIE 使用 `/api/v1/veo/generate`（独立于标准端点）

#### Seedance 1.5 Pro
- **Evolink**: 固定使用 `seedance-1.5-pro`
- **KIE**: 固定使用 `bytedance/seedance-1.5-pro`

### API 端点对照

| Provider | 标准端点 | Veo 3.1 端点 |
|----------|---------|-------------|
| **Evolink** | `/v1/videos/generations` | `/v1/videos/generations`（相同） |
| **KIE** | `/api/v1/jobs/createTask` | `/api/v1/veo/generate` ⚠️ **不同** |

### Evolink 外部链接

> Evolink 详情页集中在 `docs/spec/PRICING.md`，方便统一维护价格与规格。

- Sora 2: https://evolink.ai/zh/sora-2
- Wan 2.6: https://evolink.ai/zh/wan-2-6
- Veo 3.1 Fast Lite: https://evolink.ai/zh/veo-3-1?model=veo-3-1-fast-lite
- Seedance 1.5 Pro: https://evolink.ai/zh/seedance-1-5-pro

### 参数差异速查

| 统一参数 | Evolink 通用 | KIE Sora 2 | KIE Wan 2.6 | KIE Veo 3.1 | KIE Seedance |
|---------|------------|-----------|------------|------------|-------------|
| `prompt` | `prompt` | `input.prompt` | `input.prompt` | `prompt` ⚠️ | `input.prompt` |
| `aspectRatio` | `aspect_ratio` | `input.aspect_ratio` | `input.aspect_ratio` | `aspect_ratio` ⚠️ | `input.aspect_ratio` |
| `duration` | `10` (number) | `n_frames` (string) ⚠️ | `input.duration` (string) | ❌ 不支持 | `input.duration` (string) |
| `quality` | `quality` | `size` (standard/high) ⚠️ | `input.resolution` (720p/1080p) | ❌ 不支持 | `input.resolution` (720p/1080p) |
| `imageUrl` | `image_urls[]` | `image_urls[]` | `image_urls[]` | `imageUrls[]` ⚠️ | `input_urls[]` ⚠️ |
| `callbackUrl` | `callback_url` | ❌ 不支持 | ❌ 不支持 | `callBackUrl` ⚠️ | ❌ 不支持 |

**注**: ⚠️ 表示该模型有特殊处理

---

### HTTP 状态码处理

| 状态码 | 含义 | 处理方式 | 返回/抛出 |
|--------|------|----------|-----------|
| `404` | 任务不存在 | 返回 failed 状态 | `{ status: "failed", error: {...} }` |
| `410` | 任务已过期 | 返回 failed 状态 | `{ status: "failed", error: {...} }` |
| `429` | 速率限制 | 抛出友好错误 | `throw new Error("Rate limit exceeded...")` |
| `401` | 认证失败 | 抛出友好错误 | `throw new Error("Authentication failed...")` |
| `403` | 权限不足 | 抛出友好错误 | `throw new Error("Authentication failed...")` |
| `其他` | 通用错误 | 抛出原始信息 | `throw new Error(\`API error (${status})\`)` |

**关键原则**:
- ✅ 404/410 **不应抛出错误**，应返回 failed 状态（避免任务丢失）
- ✅ 429 应提示重试
- ✅ 401/403 应提示检查 API Key
- ✅ 保留原始错误信息在 `raw` 字段中

### JSON 解析防崩

**场景**: 供应商返回的 JSON 字段（如 `resultJson`）可能是非法 JSON

**处理策略**:
```typescript
// ✅ 使用 try-catch 保护
try {
  const parsed = JSON.parse(data.resultJson);
  videoUrl = parsed.resultUrls[0];
} catch (error) {
  console.error("Failed to parse resultJson:", error);
  // 不中断流程，返回 undefined
}
```

**多格式支持**: 某些字段可能是数组或 JSON 字符串
```typescript
private pickFirstUrl(value: unknown): string | undefined {
  if (Array.isArray(value)) return value[0];      // 直接是数组
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);           // JSON 字符串
      if (Array.isArray(parsed)) return parsed[0];
    } catch { /* ignore */ }
  }
  return undefined;
}
```

### 状态映射

**统一状态枚举**: `"pending"`, `"processing"`, `"completed"`, `"failed"`

**供应商状态映射**（示例）:
| 供应商状态 | 统一状态 |
|-----------|----------|
| `queued`, `pending` | `pending` |
| `processing`, `generating` | `processing` |
| `completed`, `succeeded`, `done` | `completed` |
| `failed`, `error`, `cancelled` | `failed` |

**映射方法**: `mapStatus(status: string)` 私有方法

---

## 🎯 添加新模型流程

### 添加内部模型（已存在的 Provider）

**场景**: 在现有 Provider（如 Evolink/KIE）下添加新模型

**步骤**:
1. 在 `MODEL_MAPPINGS` 添加模型配置
2. 在 `src/config/credits.ts` 添加计费规则
3. 在 `src/components/video-generator/defaults.ts` 添加前端模型定义

### 模型映射配置

**位置**: `src/ai/model-mapping.ts` 的 `MODEL_MAPPINGS`

**配置要点**:
| 字段 | 说明 | 示例 |
|------|------|------|
| `internalId` | 统一模型 ID | `"new-model"` |
| `displayName` | 显示名称 | `"New Model"` |
| `providers.{provider}.providerModelId` | 供应商模型 ID | `"model-v1"` 或函数 |
| `providers.{provider}.supported` | 是否支持 | `true` |
| `providers.{provider}.transformParams` | 参数转换函数 | 复用或自定义 |

### 计费配置

**位置**: `src/config/credits.ts`

**配置结构**:
```typescript
models: {
  "new-model": {
    id: "new-model",
    name: "New Model",
    provider: "evolink" | "kie",
    supportImageToVideo: boolean,
    durations: number[],              # 支持的时长
    aspectRatios: string[],           # 支持的宽高比
    creditCost: {
      base: number,                   # 基础积分
      perExtraSecond?: number,        # 每秒额外积分
      highQualityMultiplier?: number, # 高质量倍数
    },
  },
}
```

### 前端模型定义

**位置**: `src/components/video-generator/defaults.ts`

**配置结构**:
```typescript
{
  id: "new-model",
  name: "New Model",
  description: "Model description",
  creditCost: number,                # 基础积分
  durations: string[],               # ["5s", "10s", "15s"]
  resolutions: string[],             # ["720P", "1080P"]
  aspectRatios: string[],            # ["16:9", "9:16"]
  supportImageToVideo: boolean,
}
```

---

## ⚠️ 特殊场景处理

### 1. 独立端点的模型

**特征**: 某些模型使用与标准端点不同的 API 路径

**示例**: KIE Veo 3.1 使用 `/api/v1/veo/generate`

**配置方式**:
```typescript
providers: {
  kie: {
    apiEndpoint: "/api/v1/veo/generate",  # 特殊端点
    // ...
  }
}
```

**Provider 实现**: 需在 `createTask` 中读取并使用 `apiEndpoint`

### 2. 特殊回调格式

**特征**: Webhook 回调数据格式与其他模型不同

**示例**: KIE Veo 3.1 回调中视频 URL 在 `data.info.resultUrls`

**处理方式**:
- 在 `parseCallback` 中检测特殊格式
- 在 `getTaskStatus` 中使用不同解析逻辑
- 使用辅助方法 `pickFirstUrl()` 处理多种格式

**检测方法**:
```typescript
// 方法1: 根据任务 ID 前缀判断
if (taskId.startsWith("veo_task_")) {
  return this.parseVeoCallback(payload);
}

// 方法2: 根据回调数据结构判断
if (payload.data?.info?.resultUrls) {
  return this.parseSpecialFormat(payload);
}
```

### 3. 动态模型选择

**特征**: 根据参数选择不同的供应商模型 ID

**配置方式**:
```typescript
providerModelId: (params) => {
  // 根据生成模式选择
  if (params.mode === "reference-to-video") {
    return "model-reference-video";
  }

  // 根据是否有图片选择
  if (params.imageUrl || params.imageUrls?.length) {
    return "model-image-to-video";
  }

  // 根据质量选择
  if (params.quality === "high") {
    return "model-hd";
  }

  return "model-default";
}
```

**使用场景**:
- 文生视频 vs 图生视频
- 不同质量版本（veo3 vs veo3_fast）
- 不同生成模式

### 4. 多图片 URL 处理

**特征**: 供应商对单图/多图有不同参数名

**统一参数**:
- `imageUrl`: 单图 URL（向后兼容）
- `imageUrls`: 多图 URL 数组

**转换策略**:
```typescript
// 统一处理为 imageUrls 数组
const imageUrls = Array.isArray(params.imageUrls)
  ? params.imageUrls
  : params.imageUrl
    ? [params.imageUrl]
    : undefined;

// 根据供应商要求传递
if (imageUrls && imageUrls.length > 0) {
  result.image_urls = imageUrls;           // 多图支持
  result.image_url = imageUrls[0];         // 只支持单图
}
```

---

## 🧪 集成测试清单

### Provider 功能测试

- [ ] 创建任务成功（返回 taskId）
- [ ] 查询任务状态正常
- [ ] Webhook 回调解析正确
- [ ] 视频链接提取成功

### 参数转换测试

- [ ] 文生视频（prompt + duration + aspectRatio）
- [ ] 图生视频（prompt + imageUrl）
- [ ] 多图生成（prompt + imageUrls）
- [ ] 质量参数（quality 映射正确）
- [ ] 去水印参数（removeWatermark）
- [ ] 回调 URL（callbackUrl 传递）

### 错误处理测试

- [ ] 404 任务不存在（返回 failed，不抛错）
- [ ] 429 速率限制（友好错误提示）
- [ ] 401/403 认证失败（提示检查 API Key）
- [ ] 非法 JSON 解析（防崩处理）
- [ ] 网络超时（错误提示）

### 多模型测试

- [ ] 各模型的 providerModelId 正确
- [ ] 动态模型选择（基于参数）
- [ ] 特殊端点模型（如 Veo 3.1）
- [ ] 不同模型的参数转换

### 切换供应商测试

```bash
# 环境变量切换
DEFAULT_AI_PROVIDER=new-provider

# 验证：
# - 任务创建使用新 Provider
# - 状态查询使用新 Provider
# - 回调解析使用新 Provider
```

---

## 📚 关键数据结构

### VideoGenerationParams (统一参数)

```typescript
interface VideoGenerationParams {
  model?: string;              # 内部模型 ID
  prompt: string;              # 文本提示词
  aspectRatio?: string;        # 宽高比: "16:9", "9:16"
  duration?: number;           # 时长（秒）
  quality?: string;            # 质量: "standard", "high", "720p", "1080P"
  imageUrl?: string;           # 单图 URL
  imageUrls?: string[];        # 多图 URL
  mode?: string;               # 生成模式
  outputNumber?: number;       # 输出数量
  generateAudio?: boolean;     # 是否生成音频
  removeWatermark?: boolean;   # 是否去水印
  callbackUrl?: string;        # 回调 URL
}
```

### VideoTaskResponse (统一响应)

```typescript
interface VideoTaskResponse {
  taskId: string;              # 任务 ID
  provider: string;            # 供应商名称
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;           # 进度 0-100
  estimatedTime?: number;      # 预计时间（秒）
  videoUrl?: string;           # 视频 URL
  thumbnailUrl?: string;       # 缩略图 URL
  error?: {                    # 错误信息
    code: string;
    message: string;
  };
  raw?: any;                   # 原始响应
}
```

### AIVideoProvider 接口

```typescript
interface AIVideoProvider {
  name: string;                 # Provider 标识
  supportImageToVideo: boolean; # 是否支持图生视频

  createTask(
    params: VideoGenerationParams
  ): Promise<VideoTaskResponse>;

  getTaskStatus(
    taskId: string
  ): Promise<VideoTaskResponse>;

  parseCallback(
    payload: any
  ): VideoTaskResponse;
}
```

---

## 📖 相关文档

| 文档 | 说明 |
|------|------|
| [Evolink Provider](../ai/providers/evolink.ts) | Evolink 实现参考 |
| [KIE Provider](../ai/providers/kie.ts) | KIE 实现参考 |
| [模型映射配置](../ai/model-mapping.ts) | 完整映射配置 |
| [类型定义](../ai/types.ts) | 所有接口定义 |
| [计费配置](../config/credits.ts) | 积分计算规则 |
| [MODEL_MAPPING_COMPLETE](../docs/MODEL_MAPPING_COMPLETE.md) | 详细映射文档 |

---

**文档版本**: v1.1
**最后更新**: 2026-01-26
**维护者**: VideoFly Team
