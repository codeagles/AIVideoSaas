/**
 * 工具页面配置类型定义
 */

// ============================================================================
// 页面 SEO 配置
// ============================================================================

export interface PageSEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

// ============================================================================
// 生成器配置
// ============================================================================

export interface GeneratorConfig {
  // 生成模式
  mode: "text-to-video" | "image-to-video" | "reference-to-video" | "image-to-image";

  // UI 形态
  uiMode: "full" | "compact";

  // 默认选择的值
  defaults: {
    model?: string;
    duration?: number;
    aspectRatio?: string;
    outputNumber?: number;
  };

  // 模型配置
  models: {
    available: string[]; // 可用的模型 ID 列表
    default?: string;    // 默认模型
  };

  // 功能显示控制
  features: {
    showImageUpload: boolean;
    showPromptInput: boolean;
    showModeSelector?: boolean; // 是否显示模式选择器
  };

  // Prompt 占位符
  promptPlaceholder?: string;

  // 参数设置控制
  settings: {
    showDuration: boolean;
    showAspectRatio: boolean;
    showQuality: boolean;
    showOutputNumber: boolean;
    showAudioGeneration?: boolean;

    // 可选值
    durations?: number[];
    aspectRatios?: string[];
    qualities?: string[];
    outputNumbers?: number[];
  };
}

// ============================================================================
// Landing Page 配置
// ============================================================================

export interface ToolLandingConfig {
  // Hero 区域
  hero: {
    title: string;
    description: string;
    ctaText: string;
    ctaSubtext?: string;
  };

  // 示例视频
  examples: Array<{
    thumbnail: string;
    title: string;
    prompt: string;
    videoUrl?: string; // 可选的实际视频 URL
  }>;

  // 特性列表
  features: string[];

  // 支持的模型展示
  supportedModels: Array<{
    name: string;
    provider: string;
    color: string;
  }>;

  // 统计数据（可选）
  stats?: {
    videosGenerated?: string;
    usersCount?: string;
    avgRating?: number;
  };
}

// ============================================================================
// 完整工具页面配置
// ============================================================================

export interface ToolPageConfig {
  // 页面 SEO 信息
  seo: PageSEOConfig;

  // 生成器配置
  generator: GeneratorConfig;

  // Landing Page 配置（未登录时显示）
  landing: ToolLandingConfig;

  // 多语言 key 前缀
  i18nPrefix: string;
}

// ============================================================================
// 模型特定配置（用于扩展）
// ============================================================================

export interface ModelPresetConfig {
  id: string;
  name: string;
  provider: string;
  creditCost: number;

  // 支持的功能
  supports: {
    textToVideo: boolean;
    imageToVideo: boolean;
    referenceVideo: boolean;
  };

  // 参数限制
  limits: {
    maxDuration?: number;
    maxResolution?: string;
    minImages?: number;
    maxImages?: number;
  };

  // 可用参数
  available: {
    durations?: number[];
    aspectRatios?: string[];
    qualities?: string[];
  };
}
