# 积分计算系统使用说明

本文档说明了如何使用积分计算系统，实现前端动态显示和后端一致性。

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层                                │
├─────────────────────────────────────────────────────────────┤
│  VideoGeneratorInput 组件                                    │
│  ↓                                                          │
│  useCreditCalculator() Hook                                  │
│  ↓                                                          │
│  calculateVideoCredits() 统一计算函数                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        计算层                                │
├─────────────────────────────────────────────────────────────┤
│  calculateVideoCredits() - 主入口                           │
│  ├─ calculateSora2Credits()                                  │
│  ├─ calculateWan26Credits()                                  │
│  ├─ calculateVeo31Credits()                                  │
│  └─ calculateSeedanceCredits() - 按秒计费                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        后端层                                │
├─────────────────────────────────────────────────────────────┤
│  credits.ts - 积分配置                                        │
│  video.ts - 服务层验证                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 前端使用

### 1. 基础使用

组件会自动计算积分，无需额外配置：

```tsx
import { VideoGeneratorInput } from "@/components/video-generator";

function App() {
  return (
    <VideoGeneratorInput
      onSubmit={(data) => {
        console.log("需要积分:", data.estimatedCredits);
        // 发送到后端 API
      }}
    />
  );
}
```

### 2. 自定义计算

如果需要自定义积分计算逻辑：

```tsx
import { VideoGeneratorInput } from "@/components/video-generator";
import { calculateVideoCredits } from "@/lib/credit-calculator";

function App() {
  const handleCalculate = (params) => {
    // 自定义计算逻辑
    let credits = calculateVideoCredits(params);

    // 添加 VIP 折扣
    if (user.isVIP) {
      credits = Math.round(credits * 0.8);
    }

    return credits;
  };

  return (
    <VideoGeneratorInput
      calculateCredits={handleCalculate}
      onSubmit={handleSubmit}
    />
  );
}
```

### 3. 独立使用计算器

```tsx
import { calculateVideoCredits } from "@/lib/credit-calculator";

// 计算指定配置的积分
const credits = calculateVideoCredits({
  model: wan26Model,
  duration: "10s",
  resolution: "1080P",
  outputNumber: 1,
});

console.log(credits); // 522
```

---

## 添加新模型

### 1. 定义模型配置

在 `src/components/video-generator/defaults.ts` 中添加：

```typescript
export const DEFAULT_VIDEO_MODELS: VideoModel[] = [
  // ... 其他模型
  {
    id: "new-model",
    name: "New Model",
    creditCost: 100, // 基础积分
    durations: ["5s", "10s"],
    resolutions: ["720P", "1080P"],
    // ... 其他配置
  },
];
```

### 2. 添加计算逻辑

在 `src/lib/credit-calculator.ts` 中添加：

```typescript
function calculateNewModelCredits(params: CreditCalculationParams): number {
  const duration = parseDuration(params.duration) || 5;
  const resolution = parseResolution(params.resolution);

  let credits = 100 + (duration - 5) * 20; // 基础 + 每秒

  if (resolution >= 1080) {
    credits = Math.round(credits * 1.5); // 高清乘数
  }

  return credits * params.outputNumber;
}

// 在主函数中添加 case
export function calculateVideoCredits(params: CreditCalculationParams): number {
  const { model } = params;

  switch (model.id) {
    // ... 其他 case
    case "new-model":
      return calculateNewModelCredits(params);

    default:
      return model.creditCost * params.outputNumber;
  }
}
```

### 3. 更新后端配置

在 `src/config/credits.ts` 中添加模型配置（用于 API 验证）：

```typescript
models: {
  "new-model": {
    id: "new-model",
    name: "New Model",
    provider: "evolink" as const,
    supportImageToVideo: true,
    maxDuration: 10,
    durations: [5, 10],
    aspectRatios: ["16:9", "9:16"],
    creditCost: {
      base: 100,
      perExtraSecond: 20,
      highQualityMultiplier: 1.5,
    },
  },
}
```

---

## 积分计算规则

> **定价策略**: 基于 Evolink 实际成本，1:1 换算，向上取整

### Sora 2 Lite
- 10s 有水印 = 2 积分 (1.6 Credits → 2)
- 10s 无水印 = 3 积分 (2.6 Credits → 3)
- 15s 有水印 = 3 积分 (2.6 Credits → 3)
- 15s 无水印 = 4 积分 (3.6 Credits → 4)

### Wan 2.6
- 720p: 5s = 25 积分, 10s = 50 积分
- 每秒 5 Credits (duration × 5)
- 1080p × 1.67 倍:
  - 5s = 41.75 → 42 积分
  - 10s = 83.5 → 84 积分

### Veo 3.1 Fast Lite
- 720p/1080p = 10 积分 (9.6 Credits → 10)
- 4K = 29 积分 (28.8 Credits → 29)

### Seedance 1.5 Pro（按秒计费，默认有音频）
- 480p 无音频: 0.818 Credits/秒 → 1 积分/秒
- 480p 有音频: 1.636 Credits/秒 → 2 积分/秒
- 720p 无音频: 1.778 Credits/秒 → 2 积分/秒
- 720p 有音频: 3.557 Credits/秒 → 4 积分/秒
- 1080p 无音频: 3.966 Credits/秒 → 4 积分/秒
- 1080p 有音频: 7.932 Credits/秒 → 8 积分/秒

示例（有音频）:
- 720p 5s = 5 × 4 = 20 积分
- 720p 10s = 10 × 4 = 40 积分
- 1080p 5s = 5 × 8 = 40 积分

---

## API 参考

### calculateVideoCredits()

```typescript
function calculateVideoCredits(params: {
  model: VideoModel;
  duration?: string;      // "5s", "10s", etc.
  resolution?: string;    // "480P", "720P", "1080P"
  quality?: string;       // "standard", "high"
  outputNumber: number;   // 1, 2, 3, 4...
  generateAudio?: boolean; // true, false
}): number
```

### useCreditCalculator()

```typescript
function useCreditCalculator(params: {
  model: VideoModel | null;
  duration?: string;
  resolution?: string;
  outputNumber?: number;
  generateAudio?: boolean;
}): number
```

### getCreditRangeText()

```typescript
function getCreditRangeText(model: VideoModel): string
// 返回: "10-24 积分" 或 "60 积分"
```

---

## 实时积分显示

组件会在用户更改以下选项时实时更新积分：

- ✅ 模型选择
- ✅ 时长选择
- ✅ 分辨率选择
- ✅ 输出数量
- ✅ 音频生成开关

积分显示在提交按钮旁边：

```
┌─────────────────────────────────────────┐
│ [提示输入框...]        [图片上传]         │
│                                         │
│ [AI视频] [模式] [模型▼] [设置]          │
│                                         │
│                        60 积分  [发送→] │
└─────────────────────────────────────────┘
```

---

## 扩展性

### 支持新的计费模式

1. **固定价格**: 直接返回固定值
2. **按时长**: `base + (duration - baseDuration) * perSecond`
3. **按秒计费**: `duration * perSecond`
4. **阶梯价格**: 根据区间计算
5. **组合计费**: 多个因素相乘

### 示例：阶梯价格

```typescript
function calculateTieredCredits(params: CreditCalculationParams): number {
  const duration = parseDuration(params.duration);

  if (duration <= 5) return 50;
  if (duration <= 10) return 50 + (duration - 5) * 15;
  return 50 + 5 * 15 + (duration - 10) * 10;
}
```

### 示例：会员折扣

```typescript
function calculateWithDiscount(params: CreditCalculationParams, user: User): number {
  let credits = calculateVideoCredits(params);

  if (user.isPro) {
    credits = Math.round(credits * 0.8); // 8折
  } else if (user.isPremium) {
    credits = Math.round(credits * 0.9); // 9折
  }

  return credits;
}
```

---

## 注意事项

1. **前后端一致**: 确保 `credit-calculator.ts` 和 `credits.ts` 的计算逻辑一致
2. **取整处理**: 所有积分计算结果都应取整
3. **边界情况**: 处理 undefined/null 值，提供默认值
4. **性能优化**: 使用 `useMemo` 避免重复计算
5. **类型安全**: 使用 TypeScript 类型确保参数正确
