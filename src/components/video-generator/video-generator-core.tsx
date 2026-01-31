/**
 * VideoGeneratorCore Component
 *
 * 统一的生成器核心组件，为 Full 和 Compact UI 模式提供共享的渲染逻辑
 *
 * @module video-generator-core
 */

"use client";

import * as React from "react";
import { cn } from "@/components/ui";

// 类型导入
import type {
  VideoModel,
  ImageModel,
  GeneratorMode,
  ImageStyle,
  PromptTemplate,
  SubmitData,
  OutputNumberOption,
  UploadedImage,
  UploadSlot,
} from "./types";

// Hooks 导入
import { useGeneratorState, useGeneratorValidation } from "./generator-hooks";

// Credit Calculator
import { calculateVideoCredits } from "@/lib/credit-calculator";

// ============================================================================
// Types
// ============================================================================

/**
 * VideoGeneratorCore 配置
 */
export interface VideoGeneratorCoreConfig {
  // 模型配置
  videoModels: VideoModel[];
  imageModels: ImageModel[];
  videoModes: GeneratorMode[];
  imageModes: GeneratorMode[];
  imageStyles?: ImageStyle[];
  promptTemplates?: PromptTemplate[];

  // 参数配置
  aspectRatios?: {
    video?: string[];
    image?: string[];
  };
  durations?: string[];
  resolutions?: string[];
  outputNumbers?: {
    video?: OutputNumberOption[];
    image?: OutputNumberOption[];
  };

  // 默认值
  defaults?: {
    generationType?: "video" | "image";
    videoModel?: string;
    imageModel?: string;
    videoMode?: string;
    imageMode?: string;
    videoAspectRatio?: string;
    imageAspectRatio?: string;
    duration?: string;
    resolution?: string;
    videoOutputNumber?: number;
    imageOutputNumber?: number;
    imageStyle?: string;
  };
}

/**
 * VideoGeneratorCore Props
 */
export interface VideoGeneratorCoreProps {
  // === 配置 ===
  config: VideoGeneratorCoreConfig;

  // === UI 模式 ===
  /**
   * UI 显示模式
   * - full: 完整模式，包含所有控件和提示建议
   * - compact: 紧凑模式，仅显示核心控件
   */
  uiMode: "full" | "compact";

  /**
   * 功能显示控制
   */
  features?: {
    showGenerationTypeSwitch?: boolean;
    showModeSelector?: boolean;
    showModelSelector?: boolean;
    showImageUpload?: boolean;
    showPromptInput?: boolean;
    showStyleSelector?: boolean; // 图片生成时
    showSettings?: boolean; // 快速设置（宽高比、时长、分辨率）
    showAdvancedSettings?: boolean; // 高级设置（输出数量、音频）
    showPromptSuggestions?: boolean;
  };

  // === 用户状态 ===
  isPro?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  maxPromptLength?: number;

  // === 积分计算 ===
  estimatedCredits?: number;
  calculateCredits?: (params: {
    type: "video" | "image";
    model: string;
    outputNumber: number;
    duration?: string;
    resolution?: string;
  }) => number;

  // === 回调 ===
  onSubmit?: (data: SubmitData) => void;
  onChange?: (data: Partial<SubmitData>) => void;
  onGenerationTypeChange?: (type: "video" | "image") => void;
  onModelChange?: (modelId: string, type: "video" | "image") => void;
  onModeChange?: (modeId: string) => void;
  onPromptChange?: (prompt: string) => void;
  onImageUpload?: (files: File[], slot: string) => void;
  onImageRemove?: (slot: string) => void;
  onProFeatureClick?: (feature: string) => void;

  // === 验证 ===
  validatePrompt?: (prompt: string) => string | null;
  validateImages?: (files: File[]) => string | null;

  // === 多语言 ===
  texts?: {
    videoPlaceholder?: string;
    imagePlaceholder?: string;
    aiVideo?: string;
    aiImage?: string;
    credits?: string;
    videoModels?: string;
    imageModels?: string;
    selectStyle?: string;
    aspectRatio?: string;
    videoLength?: string;
    resolution?: string;
    outputNumber?: string;
    numberOfImages?: string;
    promptTooLong?: string;
    start?: string;
    end?: string;
    optional?: string;
    generate?: string;
    generating?: string;
    placeholder?: string;
    settings?: string;
    duration?: string;
    generateAudio?: string;
    generateAudioDesc?: string;
  };

  // === 样式 ===
  className?: string;

  // === Children ===
  children?: React.ReactNode;
}

// ============================================================================
// 默认文本
// ============================================================================

const DEFAULT_TEXTS = {
  videoPlaceholder: "Describe the video you want to create...",
  imagePlaceholder: "Describe the image you want to create...",
  aiVideo: "AI Video",
  aiImage: "AI Image",
  credits: "credits",
  videoModels: "Video Models",
  imageModels: "Image Models",
  selectStyle: "Select Style",
  aspectRatio: "Aspect Ratio",
  videoLength: "Video Length",
  resolution: "Resolution",
  outputNumber: "Output Number",
  numberOfImages: "Number of Images",
  promptTooLong: "Prompt too long",
  start: "Start",
  end: "End",
  optional: "(Opt)",
  generate: "Generate",
  generating: "Generating...",
  placeholder: "Describe what you want to create...",
  settings: "Settings",
  duration: "Duration",
  generateAudio: "Generate Audio",
  generateAudioDesc: "Add natural-sounding audio",
};

// ============================================================================
// VideoGeneratorCore Component
// ============================================================================

/**
 * VideoGeneratorCore - 统一的生成器核心组件
 *
 * 此组件提供：
 * 1. 完整的状态管理（通过 useGeneratorState hook）
 * 2. 表单验证（通过 useGeneratorValidation hook）
 * 3. 积分计算
 * 4. 提交数据处理
 *
 * UI 渲染由子组件负责，此组件仅提供数据和逻辑
 */
export function VideoGeneratorCore({
  config,
  uiMode,
  features = {},
  isPro = false,
  isLoading = false,
  disabled = false,
  maxPromptLength = 2000,
  estimatedCredits,
  calculateCredits,
  onSubmit,
  onChange,
  onGenerationTypeChange,
  onModelChange,
  onModeChange,
  onPromptChange,
  onImageUpload,
  onImageRemove,
  onProFeatureClick,
  validatePrompt,
  validateImages,
  texts: userTexts,
  className,
  children,
}: VideoGeneratorCoreProps) {
  // 合并文本
  const texts = { ...DEFAULT_TEXTS, ...userTexts };

  // 准备 hooks 配置
  const hooksConfig = React.useMemo(() => ({
    videoModels: config.videoModels ?? [],
    imageModels: config.imageModels ?? [],
    videoModes: config.videoModes ?? [],
    imageModes: config.imageModes ?? [],
    videoAspectRatios: config.aspectRatios?.video ?? [],
    imageAspectRatios: config.aspectRatios?.image ?? [],
    durations: config.durations ?? [],
    resolutions: config.resolutions ?? [],
    videoOutputNumbers: config.outputNumbers?.video ?? [],
    imageOutputNumbers: config.outputNumbers?.image ?? [],
    defaults: config.defaults,
  }), [config]);

  // 使用状态管理 hook
  const {
    state,
    computed,
    actions,
    handlers,
    refs,
  } = useGeneratorState(hooksConfig, {
    onGenerationTypeChange,
    onModelChange,
    onModeChange,
    onPromptChange,
    onImageUpload,
    onImageRemove,
    onProFeatureClick,
  });

  // 使用验证 hook
  const validation = useGeneratorValidation(
    {
      prompt: state.prompt,
      uploadedImages: state.uploadedImages,
      currentModel: computed.currentModel,
      modelRequiresImage: computed.modelRequiresImage,
      minRequiredImages: computed.minRequiredImages,
    },
    {
      maxPromptLength,
      validatePrompt,
      validateImages,
    }
  );

  // 计算积分
  const calculatedCredits = React.useMemo(() => {
    if (calculateCredits && computed.currentModel) {
      return calculateCredits({
        type: state.generationType,
        model: computed.currentModel.id,
        outputNumber: computed.currentOutputNumber,
        duration: state.generationType === "video" ? state.duration : undefined,
        resolution: state.generationType === "video" ? state.resolution : undefined,
      });
    }
    if (estimatedCredits !== undefined) {
      return estimatedCredits;
    }

    // 使用视频积分计算器
    if (state.generationType === "video" && computed.currentModel) {
      return calculateVideoCredits({
        model: computed.currentModel as VideoModel,
        duration: state.duration,
        resolution: state.resolution,
        outputNumber: computed.currentOutputNumber,
        generateAudio: state.generateAudio,
      });
    }

    // 默认计算：基础积分 * 输出数量
    if (computed.currentModel) {
      return computed.currentModel.creditCost * computed.currentOutputNumber;
    }
    return 0;
  }, [
    calculateCredits,
    estimatedCredits,
    computed.currentModel,
    state.generationType,
    computed.currentOutputNumber,
    state.duration,
    state.resolution,
    state.generateAudio,
  ]);

  // 处理提交
  const handleSubmit = React.useCallback(() => {
    if (!validation.canSubmit || !computed.currentModel || !computed.currentMode) return;

    const data: SubmitData = {
      type: state.generationType,
      prompt: state.prompt,
      images: state.uploadedImages.length > 0 ? state.uploadedImages.map((img) => img.file) : undefined,
      imageSlots: state.uploadedImages.length > 0
        ? state.uploadedImages.map((img) => ({ slot: img.slot, file: img.file }))
        : undefined,
      model: computed.currentModel.id,
      mode: computed.currentMode.id,
      aspectRatio: computed.currentAspectRatio,
      duration: state.generationType === "video" ? state.duration : undefined,
      resolution: state.generationType === "video" ? state.resolution : undefined,
      outputNumber: computed.currentOutputNumber,
      generateAudio: computed.modelSupportsAudio ? state.generateAudio : undefined,
      estimatedCredits: calculatedCredits,
    };

    onSubmit?.(data);
  }, [
    validation.canSubmit,
    computed.currentModel,
    computed.currentMode,
    computed.currentAspectRatio,
    computed.currentOutputNumber,
    computed.modelSupportsAudio,
    state,
    calculatedCredits,
    onSubmit,
  ]);

  // 处理回车提交
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // 处理输出数量变更
  const handleOutputNumberChange = React.useCallback((option: OutputNumberOption) => {
    if (option.isPro && !isPro) {
      onProFeatureClick?.(`output_number_${option.value}`);
      return;
    }
    if (state.generationType === "video") {
      actions.setVideoOutputNumber(option.value);
    } else {
      actions.setImageOutputNumber(option.value);
    }
    onChange?.({ outputNumber: option.value });
  }, [isPro, onProFeatureClick, state.generationType, actions, onChange]);

  // 处理宽高比变更
  const handleAspectRatioChange = React.useCallback((ratio: string) => {
    if (state.generationType === "video") {
      actions.setVideoAspectRatio(ratio);
    } else {
      actions.setImageAspectRatio(ratio);
    }
    onChange?.({ aspectRatio: ratio });
  }, [state.generationType, actions, onChange]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue = React.useMemo(() => ({
    // Config
    config,
    uiMode,
    features,
    texts,

    // User state
    isPro,
    isLoading,
    disabled,

    // State
    state,

    // Computed
    computed,

    // Validation
    validation,

    // Actions
    actions,

    // Handlers
    handlers: {
      ...handlers,
      handleSubmit,
      handleKeyDown,
      handleOutputNumberChange,
      handleAspectRatioChange,
    },

    // Refs
    refs,

    // Derived
    calculatedCredits,
  }), [
    config,
    uiMode,
    features,
    texts,
    isPro,
    isLoading,
    disabled,
    state,
    computed,
    validation,
    actions,
    handlers,
    handleSubmit,
    handleKeyDown,
    handleOutputNumberChange,
    handleAspectRatioChange,
    refs,
    calculatedCredits,
  ]);

  // 渲染子组件
  return (
    <VideoGeneratorCoreContext.Provider value={contextValue}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </VideoGeneratorCoreContext.Provider>
  );
}

// ============================================================================
// Context
// ============================================================================

/**
 * VideoGeneratorCore Context
 *
 * 子组件通过此 context 获取生成器状态和操作方法
 */
export interface VideoGeneratorCoreContextValue {
  // Config
  config: VideoGeneratorCoreConfig;
  uiMode: "full" | "compact";
  features: NonNullable<VideoGeneratorCoreProps["features"]>;
  texts: typeof DEFAULT_TEXTS;

  // User state
  isPro: boolean;
  isLoading: boolean;
  disabled: boolean;

  // State
  state: ReturnType<typeof useGeneratorState>["state"];

  // Computed
  computed: ReturnType<typeof useGeneratorState>["computed"];

  // Validation
  validation: ReturnType<typeof useGeneratorValidation>;

  // Actions
  actions: ReturnType<typeof useGeneratorState>["actions"];

  // Handlers
  handlers: ReturnType<typeof useGeneratorState>["handlers"] & {
    handleSubmit: () => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    handleOutputNumberChange: (option: OutputNumberOption) => void;
    handleAspectRatioChange: (ratio: string) => void;
  };

  // Refs
  refs: ReturnType<typeof useGeneratorState>["refs"];

  // Derived
  calculatedCredits: number;
}

export const VideoGeneratorCoreContext = React.createContext<VideoGeneratorCoreContextValue | null>(null);

/**
 * useVideoGeneratorCore Hook
 *
 * 子组件使用此 hook 获取生成器 context
 */
export function useVideoGeneratorCore() {
  const context = React.useContext(VideoGeneratorCoreContext);
  if (!context) {
    throw new Error("useVideoGeneratorCore must be used within VideoGeneratorCore");
  }
  return context;
}

// ============================================================================
// 导出
// ============================================================================

export default VideoGeneratorCore;
