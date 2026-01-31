/**
 * Video Generator Hooks
 *
 * 共享的生成器状态管理逻辑，供 VideoGeneratorInput 和 CompactGenerator 使用
 *
 * @module generator-hooks
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type {
  GenerationType,
  VideoModel,
  ImageModel,
  GeneratorMode,
  UploadedImage,
  UploadSlot,
  OutputNumberOption,
} from "./types";

// ============================================================================
// Types
// ============================================================================

/**
 * 生成器状态接口
 */
export interface GeneratorState {
  // 基础状态
  generationType: GenerationType;
  prompt: string;
  uploadedImages: UploadedImage[];

  // 视频模型和模式
  selectedVideoModel: VideoModel | null;
  selectedVideoMode: GeneratorMode | null;

  // 图片模型和模式
  selectedImageModel: ImageModel | null;
  selectedImageMode: GeneratorMode | null;

  // 视频参数
  videoAspectRatio: string;
  duration: string;
  resolution: string;
  videoOutputNumber: number;

  // 图片参数
  imageAspectRatio: string;
  imageOutputNumber: number;

  // 高级设置
  generateAudio: boolean;
}

/**
 * 生成器配置接口
 */
export interface GeneratorHooksConfig {
  // 可用模型列表
  videoModels: VideoModel[];
  imageModels: ImageModel[];
  videoModes: GeneratorMode[];
  imageModes: GeneratorMode[];

  // 全局配置选项
  videoAspectRatios: string[];
  imageAspectRatios: string[];
  durations: string[];
  resolutions: string[];
  videoOutputNumbers: OutputNumberOption[];
  imageOutputNumbers: OutputNumberOption[];

  // 默认值
  defaults?: {
    generationType?: GenerationType;
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
  };
}

/**
 * 状态变更回调
 */
export interface GeneratorCallbacks {
  onGenerationTypeChange?: (type: GenerationType) => void;
  onModelChange?: (modelId: string, type: GenerationType) => void;
  onModeChange?: (modeId: string) => void;
  onPromptChange?: (prompt: string) => void;
  onImageUpload?: (files: File[], slot: string) => void;
  onImageRemove?: (slot: string) => void;
  onProFeatureClick?: (feature: string) => void;
}

// ============================================================================
// useGeneratorState Hook
// ============================================================================

/**
 * 统一的生成器状态管理 Hook
 *
 * 管理所有生成器状态，包括：
 * - 生成类型切换（视频/图片）
 * - 模型和模式选择
 * - 参数设置（时长、分辨率、宽高比等）
 * - 图片上传管理
 * - 自动处理模式/模型切换时的参数兼容性
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   actions,
 *   computed,
 *   handlers
 * } = useGeneratorState(config, callbacks);
 * ```
 */
export function useGeneratorState(
  config: GeneratorHooksConfig,
  callbacks?: GeneratorCallbacks
) {
  const {
    videoModels,
    imageModels,
    videoModes,
    imageModes,
    videoAspectRatios,
    imageAspectRatios,
    durations,
    resolutions,
    videoOutputNumbers,
    imageOutputNumbers,
    defaults = {},
  } = config;

  // ============================================================================
  // State Initialization
  // ============================================================================

  const [generationType, setGenerationType] = useState<GenerationType>(
    defaults.generationType ?? (videoModels.length > 0 ? "video" : "image")
  );

  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // 视频模型和模式
  const [selectedVideoModel, setSelectedVideoModel] = useState<VideoModel | null>(
    () => videoModels.find((m) => m.id === defaults.videoModel) ?? videoModels[0] ?? null
  );
  const [selectedVideoMode, setSelectedVideoMode] = useState<GeneratorMode | null>(
    () => videoModes.find((m) => m.id === defaults.videoMode) ?? videoModes[0] ?? null
  );

  // 图片模型和模式
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModel | null>(
    () => imageModels.find((m) => m.id === defaults.imageModel) ?? imageModels[0] ?? null
  );
  const [selectedImageMode, setSelectedImageMode] = useState<GeneratorMode | null>(
    () => imageModes.find((m) => m.id === defaults.imageMode) ?? imageModes[0] ?? null
  );

  // 视频参数
  const [videoAspectRatio, setVideoAspectRatio] = useState(
    defaults.videoAspectRatio ?? videoAspectRatios[0] ?? "16:9"
  );
  const [duration, setDuration] = useState(defaults.duration ?? durations[0] ?? "5s");
  const [resolution, setResolution] = useState(defaults.resolution ?? resolutions[0] ?? "720P");
  const [videoOutputNumber, setVideoOutputNumber] = useState(
    defaults.videoOutputNumber ?? videoOutputNumbers[0]?.value ?? 1
  );

  // 图片参数
  const [imageAspectRatio, setImageAspectRatio] = useState(
    defaults.imageAspectRatio ?? imageAspectRatios[0] ?? "1:1"
  );
  const [imageOutputNumber, setImageOutputNumber] = useState(
    defaults.imageOutputNumber ?? imageOutputNumbers[0]?.value ?? 1
  );

  // 高级设置
  const [generateAudio, setGenerateAudio] = useState(true);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadSlot = useRef<string>("default");

  // ============================================================================
  // Computed Values
  // ============================================================================

  // 当前模式和模型
  const currentMode = generationType === "video" ? selectedVideoMode : selectedImageMode;
  const currentModel = generationType === "video" ? selectedVideoModel : selectedImageModel;

  // 根据模式过滤可用模型
  const availableVideoModels = useMemo(() => {
    if (!selectedVideoMode?.supportedModels || selectedVideoMode.supportedModels.length === 0) {
      return videoModels;
    }
    return videoModels.filter((m) => selectedVideoMode.supportedModels!.includes(m.id));
  }, [videoModels, selectedVideoMode]);

  const availableImageModels = useMemo(() => {
    if (!selectedImageMode?.supportedModels || selectedImageMode.supportedModels.length === 0) {
      return imageModels;
    }
    return imageModels.filter((m) => selectedImageMode.supportedModels!.includes(m.id));
  }, [imageModels, selectedImageMode]);

  const availableModels = generationType === "video" ? availableVideoModels : availableImageModels;

  // 获取有效选项（优先级：模型 > 模式 > 全局配置）
  const effectiveDurations = useMemo(() => {
    if (generationType === "video" && selectedVideoModel?.durations && selectedVideoModel.durations.length > 0) {
      return selectedVideoModel.durations;
    }
    if (generationType === "video" && selectedVideoMode?.durations && selectedVideoMode.durations.length > 0) {
      return selectedVideoMode.durations;
    }
    return durations;
  }, [generationType, selectedVideoModel, selectedVideoMode, durations]);

  const effectiveResolutions = useMemo(() => {
    if (generationType === "video" && selectedVideoModel?.resolutions && selectedVideoModel.resolutions.length > 0) {
      return selectedVideoModel.resolutions;
    }
    if (generationType === "video" && selectedVideoMode?.resolutions && selectedVideoMode.resolutions.length > 0) {
      return selectedVideoMode.resolutions;
    }
    return resolutions;
  }, [generationType, selectedVideoModel, selectedVideoMode, resolutions]);

  const effectiveVideoAspectRatios = useMemo(() => {
    if (selectedVideoModel?.aspectRatios && selectedVideoModel.aspectRatios.length > 0) {
      return selectedVideoModel.aspectRatios;
    }
    if (selectedVideoMode?.aspectRatios && selectedVideoMode.aspectRatios.length > 0) {
      return selectedVideoMode.aspectRatios;
    }
    return videoAspectRatios;
  }, [selectedVideoModel, selectedVideoMode, videoAspectRatios]);

  const effectiveImageAspectRatios = useMemo(() => {
    if (selectedImageMode?.aspectRatios && selectedImageMode.aspectRatios.length > 0) {
      return selectedImageMode.aspectRatios;
    }
    return imageAspectRatios;
  }, [selectedImageMode, imageAspectRatios]);

  const effectiveVideoOutputNumbers = useMemo(() => {
    if (selectedVideoModel?.outputNumbers && selectedVideoModel.outputNumbers.length > 0) {
      return selectedVideoModel.outputNumbers;
    }
    return videoOutputNumbers;
  }, [selectedVideoModel, videoOutputNumbers]);

  // 当前选中的宽高比和输出数量
  const currentAspectRatio = generationType === "video" ? videoAspectRatio : imageAspectRatio;
  const currentOutputNumber = generationType === "video" ? videoOutputNumber : imageOutputNumber;

  // 检查是否显示控制项
  const showDurationControl = effectiveDurations.length > 0;
  const showResolutionControl = effectiveResolutions.length > 0;

  // 检查模型是否支持音频
  const modelSupportsAudio = generationType === "video" &&
    (selectedVideoModel as VideoModel | null)?.supportsAudio === true;

  // 检查模型是否需要图片上传
  const modelRequiresImage = generationType === "video" &&
    ((selectedVideoModel as VideoModel | null)?.requiresImage === true ||
      ((selectedVideoModel as VideoModel | null)?.minImages ?? 0) > 0);

  const minRequiredImages = generationType === "video"
    ? (selectedVideoModel as VideoModel | null)?.minImages ?? 0
    : 0;

  // 获取上传槽位
  const getUploadSlots = useCallback((): UploadSlot[] => {
    const mode = generationType === "video" ? selectedVideoMode : selectedImageMode;

    if (mode?.uploadType === "start-end") {
      return [
        { id: "start", label: "Start", subLabel: "", required: true },
        { id: "end", label: "End", subLabel: "(Opt)", required: false },
      ];
    } else if (mode?.uploadType === "characters") {
      return [
        { id: "char1", label: "Image1", subLabel: "", required: true },
        { id: "char2", label: "Image2", subLabel: "(Opt)", required: false },
        { id: "char3", label: "Image3", subLabel: "(Opt)", required: false },
      ];
    }
    return [{ id: "default", label: "", subLabel: "", required: false }];
  }, [generationType, selectedVideoMode, selectedImageMode]);

  const uploadSlots = getUploadSlots();

  // ============================================================================
  // Auto-switch Effects
  // ============================================================================

  // 自动切换视频模型（当模式变化导致当前模型不可用时）
  useEffect(() => {
    if (selectedVideoModel && availableVideoModels.length > 0) {
      const isCurrentModelAvailable = availableVideoModels.some((m) => m.id === selectedVideoModel.id);
      if (!isCurrentModelAvailable) {
        const newModel = availableVideoModels[0] ?? null;
        setSelectedVideoModel(newModel);
        callbacks?.onModelChange?.(newModel?.id ?? "", "video");
      }
    }
  }, [availableVideoModels, selectedVideoModel, callbacks]);

  // 自动切换图片模型
  useEffect(() => {
    if (selectedImageModel && availableImageModels.length > 0) {
      const isCurrentModelAvailable = availableImageModels.some((m) => m.id === selectedImageModel.id);
      if (!isCurrentModelAvailable) {
        const newModel = availableImageModels[0] ?? null;
        setSelectedImageModel(newModel);
        callbacks?.onModelChange?.(newModel?.id ?? "", "image");
      }
    }
  }, [availableImageModels, selectedImageModel, callbacks]);

  // 自动切换时长
  useEffect(() => {
    if (effectiveDurations.length > 0 && !effectiveDurations.includes(duration)) {
      setDuration(effectiveDurations[0]!);
    }
  }, [effectiveDurations, duration]);

  // 自动切换分辨率
  useEffect(() => {
    if (effectiveResolutions.length > 0 && !effectiveResolutions.includes(resolution)) {
      setResolution(effectiveResolutions[0]!);
    }
  }, [effectiveResolutions, resolution]);

  // 自动切换视频宽高比
  useEffect(() => {
    if (effectiveVideoAspectRatios.length > 0 && !effectiveVideoAspectRatios.includes(videoAspectRatio)) {
      setVideoAspectRatio(effectiveVideoAspectRatios[0]!);
    }
  }, [effectiveVideoAspectRatios, videoAspectRatio]);

  // 自动切换图片宽高比
  useEffect(() => {
    if (effectiveImageAspectRatios.length > 0 && !effectiveImageAspectRatios.includes(imageAspectRatio)) {
      setImageAspectRatio(effectiveImageAspectRatios[0]!);
    }
  }, [effectiveImageAspectRatios, imageAspectRatio]);

  // 自动切换视频输出数量
  useEffect(() => {
    if (effectiveVideoOutputNumbers.length > 0) {
      const isCurrentAvailable = effectiveVideoOutputNumbers.some((opt) => opt.value === videoOutputNumber);
      if (!isCurrentAvailable) {
        setVideoOutputNumber(effectiveVideoOutputNumbers[0]?.value ?? 1);
      }
    }
  }, [effectiveVideoOutputNumbers, videoOutputNumber]);

  // ============================================================================
  // Actions
  // ============================================================================

  const setGenerationTypeSafe = useCallback((type: GenerationType) => {
    setGenerationType(type);
    setUploadedImages([]);
    callbacks?.onGenerationTypeChange?.(type);
  }, [callbacks]);

  const setPromptSafe = useCallback((value: string) => {
    setPrompt(value);
    callbacks?.onPromptChange?.(value);
  }, [callbacks]);

  const setVideoModelSafe = useCallback((model: VideoModel | null) => {
    setSelectedVideoModel(model);
    if (model) {
      callbacks?.onModelChange?.(model.id, "video");
    }
  }, [callbacks]);

  const setImageModelSafe = useCallback((model: ImageModel | null) => {
    setSelectedImageModel(model);
    if (model) {
      callbacks?.onModelChange?.(model.id, "image");
    }
  }, [callbacks]);

  const setVideoModeSafe = useCallback((mode: GeneratorMode | null) => {
    setSelectedVideoMode(mode);
    setUploadedImages([]);
    if (mode) {
      callbacks?.onModeChange?.(mode.id);
    }
  }, [callbacks]);

  const setImageModeSafe = useCallback((mode: GeneratorMode | null) => {
    setSelectedImageMode(mode);
    setUploadedImages([]);
    if (mode) {
      callbacks?.onModeChange?.(mode.id);
    }
  }, [callbacks]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: UploadedImage = {
          file,
          preview: reader.result as string,
          slot: currentUploadSlot.current,
        };

        setUploadedImages((prev) => {
          const filtered = prev.filter((img) => img.slot !== currentUploadSlot.current);
          callbacks?.onImageUpload?.([file], currentUploadSlot.current);
          return [...filtered, newImage];
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [callbacks]);

  const handleUploadClick = useCallback((slotId: string) => {
    currentUploadSlot.current = slotId;
    fileInputRef.current?.click();
  }, []);

  const handleRemoveImage = useCallback((slotId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.slot !== slotId));
    callbacks?.onImageRemove?.(slotId);
  }, [callbacks]);

  const getImageForSlot = useCallback((slotId: string) => {
    return uploadedImages.find((img) => img.slot === slotId);
  }, [uploadedImages]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    state: {
      generationType,
      prompt,
      uploadedImages,
      selectedVideoModel,
      selectedVideoMode,
      selectedImageModel,
      selectedImageMode,
      videoAspectRatio,
      duration,
      resolution,
      videoOutputNumber,
      imageAspectRatio,
      imageOutputNumber,
      generateAudio,
    },

    // Computed
    computed: {
      currentMode,
      currentModel,
      availableModels,
      effectiveDurations,
      effectiveResolutions,
      effectiveVideoAspectRatios,
      effectiveImageAspectRatios,
      effectiveVideoOutputNumbers,
      currentAspectRatio,
      currentOutputNumber,
      showDurationControl,
      showResolutionControl,
      modelSupportsAudio,
      modelRequiresImage,
      minRequiredImages,
      uploadSlots,
    },

    // Actions
    actions: {
      setGenerationType: setGenerationTypeSafe,
      setPrompt: setPromptSafe,
      setVideoModel: setVideoModelSafe,
      setImageModel: setImageModelSafe,
      setVideoMode: setVideoModeSafe,
      setImageMode: setImageModeSafe,
      setVideoAspectRatio,
      setImageAspectRatio,
      setDuration,
      setResolution,
      setVideoOutputNumber,
      setImageOutputNumber,
      setGenerateAudio,
      setUploadedImages,
    },

    // Handlers
    handlers: {
      handleImageUpload,
      handleUploadClick,
      handleRemoveImage,
      getImageForSlot,
    },

    // Refs
    refs: {
      fileInputRef,
    },
  };
}

// ============================================================================
// useGeneratorValidation Hook
// ============================================================================

/**
 * 生成器验证 Hook
 *
 * 提供表单验证逻辑
 */
export interface GeneratorValidationConfig {
  maxPromptLength?: number;
  validatePrompt?: (prompt: string) => string | null;
  validateImages?: (files: File[]) => string | null;
}

export function useGeneratorValidation(
  params: {
    prompt: string;
    uploadedImages: UploadedImage[];
    currentModel: VideoModel | ImageModel | null;
    modelRequiresImage: boolean;
    minRequiredImages: number;
  },
  config: GeneratorValidationConfig = {}
) {
  const {
    maxPromptLength = 2000,
    validatePrompt,
    validateImages,
  } = config;

  const { prompt, uploadedImages, currentModel, modelRequiresImage, minRequiredImages } = params;

  const promptError = useMemo(() => {
    if (prompt.length > maxPromptLength) {
      return "Prompt too long";
    }
    if (validatePrompt) {
      return validatePrompt(prompt);
    }
    return null;
  }, [prompt, maxPromptLength, validatePrompt]);

  const imageError = useMemo(() => {
    if (validateImages && uploadedImages.length > 0) {
      return validateImages(uploadedImages.map((img) => img.file));
    }
    return null;
  }, [uploadedImages, validateImages]);

  const canSubmit = useMemo(() => {
    const hasContent = prompt.trim() || uploadedImages.length > 0;
    const hasModel = currentModel !== null;
    const meetsImageRequirement = !modelRequiresImage || uploadedImages.length >= minRequiredImages;
    const hasNoErrors = !promptError && !imageError;

    return hasContent && hasModel && meetsImageRequirement && hasNoErrors;
  }, [prompt, uploadedImages, currentModel, modelRequiresImage, minRequiredImages, promptError, imageError]);

  const showCharCount = prompt.length > maxPromptLength * 0.8;
  const isOverLimit = prompt.length > maxPromptLength;

  return {
    promptError,
    imageError,
    canSubmit,
    showCharCount,
    isOverLimit,
    charCount: `${prompt.length}/${maxPromptLength}`,
  };
}
