/**
 * Video Credit Calculator
 *
 * 统一的视频生成积分计算逻辑
 * 前端和后端使用相同的计算规则，确保一致性
 */

import type { VideoModel } from "@/components/video-generator";

// ============================================================================
// Types
// ============================================================================

export interface CreditCalculationParams {
  model: VideoModel;
  duration?: string; // "5s", "10s", etc.
  resolution?: string; // "480P", "720P", "1080P"
  quality?: string; // "standard", "high"
  outputNumber: number;
  generateAudio?: boolean;
}

// ============================================================================
// Parser Functions
// ============================================================================

/** 解析时长字符串 "5s" -> 5 */
export function parseDuration(duration?: string): number {
  if (!duration) return 0;
  const match = duration.match(/^(\d+)s?$/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

/** 解析分辨率 "720P" -> 720 */
export function parseResolution(resolution?: string): number {
  if (!resolution) return 720;
  const match = resolution.match(/^(\d+)P?$/i);
  return match ? Number.parseInt(match[1], 10) : 720;
}

/** 判断是否为高质量 */
export function isHighQuality(resolution?: string, quality?: string): boolean {
  const res = parseResolution(resolution);
  return res >= 1080 || quality === "high";
}

// ============================================================================
// Model-specific Calculators
// ============================================================================

/**
 * Sora 2 Lite 积分计算（基于 Evolink 1:1 成本）
 * 有水印: 10s = 1.6 Credits, 15s = 2.6 Credits
 * 无水印: 10s = 2.6 Credits, 15s = 3.6 Credits
 *
 * 计算公式: 向上取整(基础价)
 */
function calculateSora2Credits(params: CreditCalculationParams): number {
  const duration = parseDuration(params.duration);
  const removeWatermark = true; // 默认无水印 (remove_watermark=true)

  // Evolink 成本
  let credits = 0;
  if (duration === 15) {
    credits = removeWatermark ? 3.6 : 2.6;
  } else {
    // 默认 10s
    credits = removeWatermark ? 2.6 : 1.6;
  }

  // 向上取整
  return Math.ceil(credits) * params.outputNumber;
}

/**
 * Wan 2.6 积分计算（基于 Evolink 1:1 成本）
 * 720p 5s = 25 Credits, 每秒 = 5 Credits
 * 1080p × 1.67 倍
 *
 * 计算公式: duration × 5 + quality_bonus
 */
function calculateWan26Credits(params: CreditCalculationParams): number {
  const duration = parseDuration(params.duration) || 5;
  const isHighRes = parseResolution(params.resolution) >= 1080;

  // Evolink 成本: 每秒 5 Credits
  let credits = duration * 5;

  // 1080p 乘数
  if (isHighRes) {
    credits = credits * 1.67;
  }

  // 向上取整
  return Math.ceil(credits) * params.outputNumber;
}

/**
 * Veo 3.1 Fast Lite 积分计算（基于 Evolink 1:1 成本）
 * 固定价格 9.6 Credits → 10 积分 (720p/1080p)
 * 4K = 28.8 Credits → 29 积分
 *
 * 计算公式: 固定价格
 */
function calculateVeo31Credits(params: CreditCalculationParams): number {
  const is4K = parseResolution(params.resolution) >= 2160;

  // Evolink 成本
  const credits = is4K ? 28.8 : 9.6;

  // 向上取整
  return Math.ceil(credits) * params.outputNumber;
}

/**
 * Seedance 1.5 Pro 积分计算（基于 Evolink 1:1 成本，按秒计费）
 * 默认有音频 (generateAudio = true)
 *
 * Evolink 成本（Credits/秒）:
 * - 480p  无音频: 0.818 → 1 积分/秒
 * - 480p  有音频: 1.636 → 2 积分/秒
 * - 720p  无音频: 1.778 → 2 积分/秒
 * - 720p  有音频: 3.557 → 4 积分/秒
 * - 1080p 无音频: 3.966 → 4 积分/秒
 * - 1080p 有音频: 7.932 → 8 积分/秒
 *
 * 计算公式: duration × perSecond × qualityMultiplier
 */
function calculateSeedanceCredits(params: CreditCalculationParams): number {
  const duration = parseDuration(params.duration) || 4;
  const resolution = parseResolution(params.resolution);
  const hasAudio = params.generateAudio ?? true; // 默认有音频

  // 基础每秒积分（720p 有音频）
  let perSecond = 4;

  // 根据分辨率调整
  if (resolution < 480) {
    // 480p
    perSecond = hasAudio ? 2 : 1;
  } else if (resolution >= 1080) {
    // 1080p = 720p × 2
    perSecond = hasAudio ? 8 : 4;
  } else {
    // 720p
    perSecond = hasAudio ? 4 : 2;
  }

  return Math.ceil(duration * perSecond) * params.outputNumber;
}

// ============================================================================
// Main Calculator
// ============================================================================

/**
 * 计算视频生成所需积分
 *
 * @example
 * ```ts
 * const credits = calculateVideoCredits({
 *   model: sora2Model,
 *   duration: "15s",
 *   resolution: "720P",
 *   outputNumber: 1,
 * });
 * // returns 20
 * ```
 */
export function calculateVideoCredits(params: CreditCalculationParams): number {
  const { model } = params;

  // 根据模型 ID 使用不同的计算逻辑
  switch (model.id) {
    case "sora-2":
      return calculateSora2Credits(params);

    case "wan2.6":
      return calculateWan26Credits(params);

    case "veo-3.1":
      return calculateVeo31Credits(params);

    case "seedance-1.5-pro":
      return calculateSeedanceCredits(params);

    default:
      // 默认计算：基础积分 × 输出数量
      return model.creditCost * params.outputNumber;
  }
}

// ============================================================================
// React Hook
// ============================================================================

/**
 * 用于 React 组件的积分计算 Hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const credits = useCreditCalculator({
 *     model: selectedModel,
 *     duration: selectedDuration,
 *     resolution: selectedResolution,
 *     outputNumber: selectedOutputNumber,
 *   });
 *
 *   return <div>{credits} 积分</div>;
 * }
 * ```
 */
export function useCreditCalculator(params: Omit<CreditCalculationParams, "model"> & { model: VideoModel | null }): number {
  const { model, ...rest } = params;

  if (!model) return 0;

  return calculateVideoCredits({
    model,
    ...rest,
    outputNumber: rest.outputNumber ?? 1,
  });
}

// ============================================================================
// Display Helpers
// ============================================================================

/**
 * 格式化积分显示
 * @example
 * formatCredits(100) // "100 积分"
 * formatCredits(100, { compact: true }) // "100"
 */
export function formatCredits(
  credits: number,
  options?: { compact?: boolean; suffix?: string }
): string {
  const { compact = false, suffix = "积分" } = options || {};
  return compact ? String(credits) : `${credits} ${suffix}`;
}

/**
 * 获取积分范围显示（用于模型卡片）
 * @example
 * getCreditRangeText(model) // "10-24 积分"
 */
export function getCreditRangeText(model: VideoModel): string {
  const minCredits = calculateVideoCredits({
    model,
    outputNumber: 1,
  });

  // 计算最大积分（假设最大时长/输出数量）
  let maxCredits = minCredits;

  if (model.id === "sora-2") {
    maxCredits = calculateVideoCredits({
      model,
      duration: "15s",
      outputNumber: 1,
    });
  } else if (model.id === "wan2.6") {
    maxCredits = calculateVideoCredits({
      model,
      duration: "15s",
      resolution: "1080P",
      outputNumber: 1,
    });
  } else if (model.id === "veo-3.1") {
    maxCredits = 60; // 固定价格
  } else if (model.id === "seedance-1.5-pro") {
    maxCredits = calculateVideoCredits({
      model,
      duration: "12s",
      resolution: "1080P",
      outputNumber: 1,
    });
  }

  if (minCredits === maxCredits) {
    return formatCredits(minCredits);
  }

  return `${minCredits}-${maxCredits} ${model.creditDisplay || "积分"}`;
}
