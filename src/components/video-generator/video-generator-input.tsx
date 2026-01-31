"use client";

/**
 * VideoGeneratorInput Component
 *
 * A fully configurable AI video/image generation input component.
 * All data can be customized through props - no hardcoded dependencies.
 *
 * @example Basic usage with defaults
 * ```tsx
 * <VideoGeneratorInput
 *   credits={30}
 *   onSubmit={(data) => console.log(data)}
 * />
 * ```
 *
 * @example Custom configuration
 * ```tsx
 * <VideoGeneratorInput
 *   config={{
 *     videoModels: myModels,
 *     imageStyles: myStyles,
 *   }}
 *   defaults={{
 *     generationType: "image",
 *     imageModel: "midjourney",
 *   }}
 *   credits={user.credits}
 *   onSubmit={handleGenerate}
 * />
 * ```
 */

import * as React from "react";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Send,
  RefreshCw,
  Clock,
  Copy,
  Image as ImageIcon,
  Video,
  X,
  Check,
  Sparkles,
  ZoomIn,
  Loader2,
  MoreHorizontal,
  Volume2,
} from "lucide-react";
import { cn } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types and Defaults
import type {
  GenerationType,
  VideoModel,
  ImageModel,
  GeneratorMode,
  ImageStyle,
  PromptTemplate,
  UploadedImage,
  UploadSlot,
  VideoGeneratorInputProps,
  SubmitData,
  OutputNumberOption,
} from "./types";

import {
  DEFAULT_CONFIG,
  DEFAULT_DEFAULTS,
  DEFAULT_TEXTS_EN,
  mergeConfig,
  mergeDefaults,
  getTexts,
} from "./defaults";

// Credit Calculator
import { calculateVideoCredits } from "@/lib/credit-calculator";

// ============================================================================
// Main Component
// ============================================================================

export function VideoGeneratorInput({
  // Configuration
  config: userConfig,
  defaults: userDefaults,

  // State
  isPro = false,
  estimatedCredits,
  calculateCredits,
  disabled = false,
  isLoading = false,
  loadingText,
  maxPromptLength = 2000,

  // Styling
  className,
  texts: userTexts,

  // Callbacks
  onSubmit,
  onChange,
  onGenerationTypeChange,
  onModelChange,
  onModeChange,
  onImageUpload,
  onImageRemove,
  onPromptChange,
  onProFeatureClick,

  // Validation
  validatePrompt,
  validateImages,
}: VideoGeneratorInputProps) {
  // Merge user config with defaults
  const config = useMemo(() => mergeConfig(userConfig), [userConfig]);
  const defaults = useMemo(() => mergeDefaults(userDefaults), [userDefaults]);
  const texts = useMemo(() => getTexts(undefined, userTexts), [userTexts]);

  // Extract config values
  const videoModels = config.videoModels ?? [];
  const imageModels = config.imageModels ?? [];
  const videoModes = config.videoModes ?? [];
  const imageModes = config.imageModes ?? [];
  const imageStyles = config.imageStyles ?? [];
  const promptTemplates = config.promptTemplates ?? [];
  const videoAspectRatios = config.aspectRatios?.video ?? [];
  const imageAspectRatios = config.aspectRatios?.image ?? [];
  const durations = config.durations ?? [];
  const resolutions = config.resolutions ?? [];
  const videoOutputNumbers = config.outputNumbers?.video ?? [];
  const imageOutputNumbers = config.outputNumbers?.image ?? [];

  // ============================================================================
  // State
  // ============================================================================

  // Generation type state
  const [generationType, setGenerationType] = useState<GenerationType>(
    defaults.generationType ?? "video"
  );

  // Common state
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  // Advanced settings state
  const [generateAudio, setGenerateAudio] = useState(true);

  // Video-specific state
  const [selectedVideoModel, setSelectedVideoModel] = useState<VideoModel | null>(
    () => videoModels.find((m) => m.id === defaults.videoModel) ?? videoModels[0] ?? null
  );
  const [selectedVideoMode, setSelectedVideoMode] = useState<GeneratorMode | null>(
    () => videoModes.find((m) => m.id === defaults.videoMode) ?? videoModes[0] ?? null
  );
  const [videoAspectRatio, setVideoAspectRatio] = useState(
    defaults.videoAspectRatio ?? videoAspectRatios[0] ?? "16:9"
  );
  const [duration, setDuration] = useState(defaults.duration ?? durations[0] ?? "5s");
  const [resolution, setResolution] = useState(defaults.resolution ?? resolutions[0] ?? "720P");
  const [videoOutputNumber, setVideoOutputNumber] = useState(
    defaults.videoOutputNumber ?? videoOutputNumbers[0]?.value ?? 1
  );

  // Image-specific state
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModel | null>(
    () => imageModels.find((m) => m.id === defaults.imageModel) ?? imageModels[0] ?? null
  );
  const [selectedImageMode, setSelectedImageMode] = useState<GeneratorMode | null>(
    () => imageModes.find((m) => m.id === defaults.imageMode) ?? imageModes[0] ?? null
  );
  const [imageAspectRatio, setImageAspectRatio] = useState(
    defaults.imageAspectRatio ?? imageAspectRatios[0] ?? "1:1"
  );
  const [imageOutputNumber, setImageOutputNumber] = useState(
    defaults.imageOutputNumber ?? imageOutputNumbers[0]?.value ?? 1
  );
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle | null>(
    () => imageStyles.find((s) => s.id === defaults.imageStyle) ?? imageStyles[0] ?? null
  );

  // Prompt templates state
  const [visibleTemplates, setVisibleTemplates] = useState<PromptTemplate[]>(
    promptTemplates.slice(0, 5)
  );

  // Auto-set generation type when only one type has models
  useEffect(() => {
    if (videoModels.length > 0 && imageModels.length === 0 && generationType !== "video") {
      setGenerationType("video");
    } else if (imageModels.length > 0 && videoModels.length === 0 && generationType !== "image") {
      setGenerationType("image");
    }
  }, [videoModels.length, imageModels.length, generationType]);

  // Reset duration when model changes if current duration is not supported
  useEffect(() => {
    if (generationType === "video" && selectedVideoModel?.durations) {
      if (!selectedVideoModel.durations.includes(duration)) {
        setDuration(selectedVideoModel.durations[0]);
      }
    }
  }, [selectedVideoModel, duration, generationType]);

  // Reset resolution when model changes if current resolution is not supported
  useEffect(() => {
    if (generationType === "video" && selectedVideoModel?.resolutions) {
      if (!selectedVideoModel.resolutions.includes(resolution)) {
        setResolution(selectedVideoModel.resolutions[0]);
      }
    }
  }, [selectedVideoModel, resolution, generationType]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadSlot = useRef<string>("default");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Model dropdown state
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // ============================================================================
  // Derived Values
  // ============================================================================

  const currentMode = generationType === "video" ? selectedVideoMode : selectedImageMode;
  const currentModes = generationType === "video" ? videoModes : imageModes;

  // Filter models based on current mode's supportedModels
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
  const currentModel = generationType === "video" ? selectedVideoModel : selectedImageModel;

  // Get effective options based on current mode AND model (model takes highest precedence)
  // Priority: Model > Mode > Global Config
  const effectiveDurations = useMemo(() => {
    // 1. Model-level durations (highest priority)
    if (generationType === "video" && selectedVideoModel?.durations && selectedVideoModel.durations.length > 0) {
      return selectedVideoModel.durations;
    }
    // 2. Mode-level durations
    if (generationType === "video" && selectedVideoMode?.durations && selectedVideoMode.durations.length > 0) {
      return selectedVideoMode.durations;
    }
    // 3. Global config durations
    return durations;
  }, [generationType, selectedVideoModel, selectedVideoMode, durations]);

  const effectiveResolutions = useMemo(() => {
    // 1. Model-level resolutions (highest priority)
    if (generationType === "video" && selectedVideoModel?.resolutions && selectedVideoModel.resolutions.length > 0) {
      return selectedVideoModel.resolutions;
    }
    // 2. Mode-level resolutions
    if (generationType === "video" && selectedVideoMode?.resolutions && selectedVideoMode.resolutions.length > 0) {
      return selectedVideoMode.resolutions;
    }
    // 3. Global config resolutions
    return resolutions;
  }, [generationType, selectedVideoModel, selectedVideoMode, resolutions]);

  const effectiveVideoAspectRatios = useMemo(() => {
    // 1. Model-level aspect ratios (highest priority)
    if (selectedVideoModel?.aspectRatios && selectedVideoModel.aspectRatios.length > 0) {
      return selectedVideoModel.aspectRatios;
    }
    // 2. Mode-level aspect ratios
    if (selectedVideoMode?.aspectRatios && selectedVideoMode.aspectRatios.length > 0) {
      return selectedVideoMode.aspectRatios;
    }
    // 3. Global config aspect ratios
    return videoAspectRatios;
  }, [selectedVideoModel, selectedVideoMode, videoAspectRatios]);

  const effectiveImageAspectRatios = useMemo(() => {
    if (selectedImageMode?.aspectRatios && selectedImageMode.aspectRatios.length > 0) {
      return selectedImageMode.aspectRatios;
    }
    return imageAspectRatios;
  }, [selectedImageMode, imageAspectRatios]);

  const currentAspectRatio = generationType === "video" ? videoAspectRatio : imageAspectRatio;
  const currentAspectRatios = generationType === "video" ? effectiveVideoAspectRatios : effectiveImageAspectRatios;
  const currentOutputNumber = generationType === "video" ? videoOutputNumber : imageOutputNumber;

  // Get effective output numbers - model-level takes precedence
  const effectiveVideoOutputNumbers = useMemo(() => {
    // Check if current video model has its own output numbers
    if (selectedVideoModel?.outputNumbers && selectedVideoModel.outputNumbers.length > 0) {
      return selectedVideoModel.outputNumbers;
    }
    return videoOutputNumbers;
  }, [selectedVideoModel, videoOutputNumbers]);

  const effectiveImageOutputNumbers = useMemo(() => {
    // Image models don't have model-level output numbers yet, use global
    return imageOutputNumbers;
  }, [imageOutputNumbers]);

  const currentOutputNumbers = generationType === "video" ? effectiveVideoOutputNumbers : effectiveImageOutputNumbers;

  // Check if resolution control should be shown
  const showResolutionControl = useMemo(() => {
    if (generationType !== "video") return false;
    // Show if model has resolutions defined, or if mode has resolutions, or global has resolutions
    return effectiveResolutions.length > 0;
  }, [generationType, effectiveResolutions]);

  // Check if duration control should be shown
  const showDurationControl = useMemo(() => {
    if (generationType !== "video") return false;
    return effectiveDurations.length > 0;
  }, [generationType, effectiveDurations]);

  // Check if current model supports audio generation
  const modelSupportsAudio = useMemo(() => {
    if (generationType === "video" && selectedVideoModel) {
      return (selectedVideoModel as VideoModel).supportsAudio === true;
    }
    return false;
  }, [generationType, selectedVideoModel]);

  // Get model hint for display
  const currentModelHint = useMemo(() => {
    if (generationType === "video" && selectedVideoModel) {
      return (selectedVideoModel as VideoModel).hint;
    }
    return undefined;
  }, [generationType, selectedVideoModel]);

  // Check if only one generation type is available (based on models)
  const hasVideoModels = videoModels.length > 0;
  const hasImageModels = imageModels.length > 0;
  const showGenerationTypeSwitch = hasVideoModels && hasImageModels;

  // Auto-switch video model when mode changes and current model is not supported
  useEffect(() => {
    if (selectedVideoModel && availableVideoModels.length > 0) {
      const isCurrentModelAvailable = availableVideoModels.some((m) => m.id === selectedVideoModel.id);
      if (!isCurrentModelAvailable) {
        setSelectedVideoModel(availableVideoModels[0] ?? null);
        onModelChange?.(availableVideoModels[0]?.id ?? "", "video");
      }
    }
  }, [availableVideoModels, selectedVideoModel]);

  // Auto-switch image model when mode changes and current model is not supported
  useEffect(() => {
    if (selectedImageModel && availableImageModels.length > 0) {
      const isCurrentModelAvailable = availableImageModels.some((m) => m.id === selectedImageModel.id);
      if (!isCurrentModelAvailable) {
        setSelectedImageModel(availableImageModels[0] ?? null);
        onModelChange?.(availableImageModels[0]?.id ?? "", "image");
      }
    }
  }, [availableImageModels, selectedImageModel]);

  // Auto-switch duration when mode changes and current duration is not available
  useEffect(() => {
    if (effectiveDurations.length > 0 && !effectiveDurations.includes(duration)) {
      setDuration(effectiveDurations[0]!);
      onChange?.({ duration: effectiveDurations[0] });
    }
  }, [effectiveDurations, duration]);

  // Auto-switch resolution when mode changes and current resolution is not available
  useEffect(() => {
    if (effectiveResolutions.length > 0 && !effectiveResolutions.includes(resolution)) {
      setResolution(effectiveResolutions[0]!);
      onChange?.({ resolution: effectiveResolutions[0] });
    }
  }, [effectiveResolutions, resolution]);

  // Auto-switch video aspect ratio when mode changes and current is not available
  useEffect(() => {
    if (effectiveVideoAspectRatios.length > 0 && !effectiveVideoAspectRatios.includes(videoAspectRatio)) {
      setVideoAspectRatio(effectiveVideoAspectRatios[0]!);
      onChange?.({ aspectRatio: effectiveVideoAspectRatios[0] });
    }
  }, [effectiveVideoAspectRatios, videoAspectRatio]);

  // Auto-switch image aspect ratio when mode changes and current is not available
  useEffect(() => {
    if (effectiveImageAspectRatios.length > 0 && !effectiveImageAspectRatios.includes(imageAspectRatio)) {
      setImageAspectRatio(effectiveImageAspectRatios[0]!);
      onChange?.({ aspectRatio: effectiveImageAspectRatios[0] });
    }
  }, [effectiveImageAspectRatios, imageAspectRatio]);

  // Auto-switch video output number when model changes and current is not available
  useEffect(() => {
    if (effectiveVideoOutputNumbers.length > 0) {
      const isCurrentAvailable = effectiveVideoOutputNumbers.some((opt) => opt.value === videoOutputNumber);
      if (!isCurrentAvailable) {
        const newValue = effectiveVideoOutputNumbers[0]?.value ?? 1;
        setVideoOutputNumber(newValue);
        onChange?.({ outputNumber: newValue });
      }
    }
  }, [effectiveVideoOutputNumbers, videoOutputNumber]);

  // Scroll to selected model when dropdown opens
  useEffect(() => {
    if (isModelDropdownOpen && currentModel) {
      // Use setTimeout to ensure Portal content is rendered
      const timeoutId = setTimeout(() => {
        const selectedItem = document.querySelector(
          `[data-model-id="${currentModel.id}"]`
        ) as HTMLElement | null;
        if (selectedItem) {
          // Find the scrollable container (parent with overflow-y-scroll)
          const scrollContainer = selectedItem.closest('[class*="overflow-y"]') as HTMLElement | null;
          if (scrollContainer) {
            // Calculate scroll position to center the item
            const scrollTop = selectedItem.offsetTop - scrollContainer.clientHeight / 2 + selectedItem.clientHeight / 2;
            scrollContainer.scrollTop = Math.max(0, scrollTop);
          }
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isModelDropdownOpen, currentModel]);

  // Calculate estimated credits
  const calculatedCredits = useMemo(() => {
    const resolvedResolution =
      generationType === "video" && showResolutionControl ? resolution : undefined;
    if (calculateCredits && currentModel) {
      return calculateCredits({
        type: generationType,
        model: currentModel.id,
        outputNumber: currentOutputNumber,
        duration: generationType === "video" ? duration : undefined,
        resolution: resolvedResolution,
      });
    }
    if (estimatedCredits !== undefined) {
      return estimatedCredits;
    }

    // Use the unified credit calculator for video generation
    if (generationType === "video" && currentModel) {
      return calculateVideoCredits({
        model: currentModel as VideoModel,
        duration,
        resolution: resolvedResolution,
        outputNumber: currentOutputNumber,
        generateAudio: generateAudio,
      });
    }

    // Default calculation: base creditCost * outputNumber
    if (currentModel) {
      return currentModel.creditCost * currentOutputNumber;
    }
    return 0;
  }, [
    calculateCredits,
    estimatedCredits,
    currentModel,
    generationType,
    currentOutputNumber,
    duration,
    resolution,
    generateAudio,
    showResolutionControl,
  ]);

  // Helper to check if icon is a URL
  const isIconUrl = (icon: string) => {
    return icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("/");
  };

  // Helper to get model icon (defaults to first letter of name)
  const getModelIcon = (model: VideoModel | ImageModel) => {
    return model.icon ?? model.name.charAt(0).toUpperCase();
  };

  // Helper to get model color (defaults to a neutral color)
  const getModelColor = (model: VideoModel | ImageModel) => {
    return model.color ?? "#71717a";
  };

  // Render model icon (supports both URL and single character)
  const renderModelIcon = (model: VideoModel | ImageModel, size: "sm" | "md" = "sm") => {
    const icon = getModelIcon(model);
    const color = getModelColor(model);
    const sizeClass = size === "sm" ? "w-4 h-4 text-xs" : "w-6 h-6 text-xs";

    if (isIconUrl(icon)) {
      return (
        <img
          src={icon}
          alt={model.name}
          className={cn(sizeClass, "rounded object-cover")}
        />
      );
    }

    return (
      <span
        className={cn(sizeClass, "rounded flex items-center justify-center font-bold")}
        style={{ backgroundColor: color, color: "#fff" }}
      >
        {icon}
      </span>
    );
  };

  // ============================================================================
  // Upload Slots
  // ============================================================================

  const getUploadSlots = useCallback((): UploadSlot[] => {
    const mode = generationType === "video" ? selectedVideoMode : selectedImageMode;

    if (mode?.uploadType === "start-end") {
      return [
        { id: "start", label: texts.start ?? "Start", subLabel: "", required: true },
        { id: "end", label: texts.end ?? "End", subLabel: texts.optional ?? "(Opt)", required: false },
      ];
    } else if (mode?.uploadType === "characters") {
      return [
        { id: "char1", label: "Image1", subLabel: "", required: true },
        { id: "char2", label: "Image2", subLabel: texts.optional ?? "(Opt)", required: false },
        { id: "char3", label: "Image3", subLabel: texts.optional ?? "(Opt)", required: false },
      ];
    }
    return [{ id: "default", label: "", subLabel: "", required: false }];
  }, [generationType, selectedVideoMode, selectedImageMode, texts]);

  const uploadSlots = getUploadSlots();
  const isMultiUpload = uploadSlots.length > 1;

  // ============================================================================
  // Validation
  // ============================================================================

  const isOverLimit = prompt.length > maxPromptLength;
  const showCharCount = prompt.length > maxPromptLength * 0.8;

  const promptError = useMemo(() => {
    if (isOverLimit) return texts.promptTooLong ?? "Prompt too long";
    if (validatePrompt) return validatePrompt(prompt);
    return null;
  }, [prompt, isOverLimit, validatePrompt, texts]);

  const imageError = useMemo(() => {
    if (validateImages && uploadedImages.length > 0) {
      return validateImages(uploadedImages.map((img) => img.file));
    }
    return null;
  }, [uploadedImages, validateImages]);

  // Check if current model requires image upload
  const modelRequiresImage = useMemo(() => {
    if (generationType === "video" && selectedVideoModel) {
      const model = selectedVideoModel as VideoModel;
      return model.requiresImage === true || (model.minImages && model.minImages > 0);
    }
    return false;
  }, [generationType, selectedVideoModel]);

  // Get minimum required images for current model
  const minRequiredImages = useMemo(() => {
    if (generationType === "video" && selectedVideoModel) {
      return (selectedVideoModel as VideoModel).minImages ?? 0;
    }
    return 0;
  }, [generationType, selectedVideoModel]);

  const canSubmit =
    (prompt.trim() || uploadedImages.length > 0) &&
    !disabled &&
    !isLoading &&
    !promptError &&
    !imageError &&
    currentModel !== null &&
    // Check if required images are uploaded
    (!modelRequiresImage || uploadedImages.length >= minRequiredImages);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          const updated = [...filtered, newImage];
          onImageUpload?.([file], currentUploadSlot.current);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = (slotId: string) => {
    currentUploadSlot.current = slotId;
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (slotId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.slot !== slotId));
    onImageRemove?.(slotId);
  };

  const getImageForSlot = (slotId: string) => {
    return uploadedImages.find((img) => img.slot === slotId);
  };

  const handleSubmit = () => {
    if (!canSubmit || !currentModel || !currentMode) return;

    // Separate actual files from template URLs
    // If preview starts with http/https, it's a template URL
    const imageUrls = uploadedImages
      .filter(img => img.preview.startsWith("http"))
      .map(img => img.preview);

    // Only send files if they are NOT template URLs (or if we really want to support both)
    // For now, if we have a URL, we prefer sending that to avoid upload
    const imagesToSend = uploadedImages
      .filter(img => !img.preview.startsWith("http"))
      .map(img => img.file);

    const data: SubmitData = {
      type: generationType,
      prompt,
      images: imagesToSend.length > 0 ? imagesToSend : (uploadedImages.length > 0 && imageUrls.length === 0 ? uploadedImages.map(i => i.file) : undefined),
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      imageSlots: uploadedImages.length > 0
        ? uploadedImages.map((img) => ({ slot: img.slot, file: img.file }))
        : undefined,
      model: currentModel.id,
      mode: currentMode.id,
      aspectRatio: currentAspectRatio,
      duration: generationType === "video" ? duration : undefined,
      resolution:
        generationType === "video" && showResolutionControl
          ? resolution
          : undefined,
      outputNumber: currentOutputNumber,
      style: generationType === "image" && selectedStyle ? selectedStyle.id : undefined,
      generateAudio: modelSupportsAudio ? generateAudio : undefined,
      estimatedCredits: calculatedCredits,
    };

    onSubmit?.(data);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    onPromptChange?.(value);
    onChange?.({ prompt: value });
  };

  const handleGenerationTypeChange = (type: GenerationType) => {
    setGenerationType(type);
    setUploadedImages([]);
    onGenerationTypeChange?.(type);
    onChange?.({ type });
  };

  const handleModeChange = (mode: GeneratorMode) => {
    if (generationType === "video") {
      setSelectedVideoMode(mode);
    } else {
      setSelectedImageMode(mode);
    }
    setUploadedImages([]);
    onModeChange?.(mode.id);
    onChange?.({ mode: mode.id });
  };

  const handleModelChangeInternal = (model: VideoModel | ImageModel) => {
    if (generationType === "video") {
      setSelectedVideoModel(model as VideoModel);
    } else {
      setSelectedImageModel(model as ImageModel);
    }
    onModelChange?.(model.id, generationType);
    onChange?.({ model: model.id });
  };

  const handleAspectRatioChange = (ratio: string) => {
    if (generationType === "video") {
      setVideoAspectRatio(ratio);
    } else {
      setImageAspectRatio(ratio);
    }
    onChange?.({ aspectRatio: ratio });
  };

  const handleOutputNumberChange = (option: OutputNumberOption) => {
    // Check if this is a Pro feature and user is not Pro
    if (option.isPro && !isPro) {
      onProFeatureClick?.(`output_number_${option.value}`);
      return;
    }
    if (generationType === "video") {
      setVideoOutputNumber(option.value);
    } else {
      setImageOutputNumber(option.value);
    }
    onChange?.({ outputNumber: option.value });
  };

  const refreshSuggestions = useCallback(() => {
    const shuffled = [...promptTemplates].sort(() => Math.random() - 0.5);
    setVisibleTemplates(shuffled.slice(0, 5));
  }, [promptTemplates]);

  const handlePromptSuggestion = async (template: PromptTemplate) => {
    setPrompt(template.text);
    onPromptChange?.(template.text);
    onChange?.({ prompt: template.text });
    textareaRef.current?.focus();

    // If template has an image, load it into the appropriate upload slot
    if (template.image) {
      try {
        // Fetch the image and convert to File
        const response = await fetch(template.image);
        const blob = await response.blob();
        const fileName = template.image.split("/").pop() || "template-image.jpg";
        const file = new File([blob], fileName, { type: blob.type });

        // Determine the correct slot based on current upload mode
        const slots = getUploadSlots();
        const targetSlot = slots[0]?.id ?? "default";

        const newImage: UploadedImage = {
          file,
          preview: template.image,
          slot: targetSlot,
        };

        setUploadedImages((prev) => {
          const filtered = prev.filter((img) => img.slot !== targetSlot);
          return [...filtered, newImage];
        });
        onImageUpload?.([file], targetSlot);
      } catch (error) {
        console.error("Failed to load template image:", error);
      }
    } else {
      // Template has no image, clear the first slot
      const slots = getUploadSlots();
      const targetSlot = slots[0]?.id ?? "default";
      const existingImage = uploadedImages.find((img) => img.slot === targetSlot);
      if (existingImage) {
        setUploadedImages((prev) => prev.filter((img) => img.slot !== targetSlot));
        onImageRemove?.(targetSlot);
      }
    }
  };

  const getModeIcon = (iconType: string) => {
    switch (iconType) {
      case "text":
        return "⌘";
      case "image":
        return "🖼";
      case "reference":
        return "👤";
      case "frames":
        return "🎞";
      default:
        return "⌘";
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl p-2">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {previewImage && (
            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Main Input Card */}
      <div className="rounded-2xl bg-zinc-900 overflow-hidden">
        {/* Input Area */}
        <div className="p-4 min-h-[140px] flex flex-col">
          <div className="flex gap-3 flex-1">
            {/* Upload Area */}
            <div className="flex-shrink-0 flex gap-2">
              {isMultiUpload ? (
                uploadSlots.map((slot) => {
                  const image = getImageForSlot(slot.id);
                  return (
                    <div key={slot.id} className="flex flex-col items-center gap-1">
                      {image ? (
                        <div className="relative group">
                          {/* Delete button - outside the frame */}
                          <button
                            onClick={() => handleRemoveImage(slot.id)}
                            className="absolute -top-1.5 -right-1.5 z-10 p-1 rounded-full bg-zinc-700 hover:bg-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                          {/* Image frame */}
                          <div className="w-14 h-[75px] rounded-lg p-1 bg-zinc-700/50 border border-zinc-600">
                            <div className="relative w-full h-full rounded overflow-hidden">
                              <img
                                src={image.preview}
                                alt={slot.label}
                                className="w-full h-full object-cover"
                              />
                              {/* Zoom button - centered on hover */}
                              <button
                                onClick={() => setPreviewImage(image.preview)}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUploadClick(slot.id)}
                          className="w-14 h-[75px] rounded-lg border-2 border-dashed border-zinc-700 hover:border-zinc-500 transition-colors flex items-center justify-center text-zinc-500 hover:text-zinc-400"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                      <div className="text-[10px] text-zinc-500 text-center w-14">
                        <div>{slot.label}</div>
                        {slot.subLabel && <div>{slot.subLabel}</div>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center gap-1">
                  {getImageForSlot("default") ? (
                    <div className="relative group">
                      {/* Delete button - outside the frame */}
                      <button
                        onClick={() => handleRemoveImage("default")}
                        className="absolute -top-1.5 -right-1.5 z-10 p-1 rounded-full bg-zinc-700 hover:bg-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                      {/* Image frame */}
                      <div className="w-14 h-[75px] rounded-lg p-1 bg-zinc-700/50 border border-zinc-600">
                        <div className="relative w-full h-full rounded overflow-hidden">
                          <img
                            src={getImageForSlot("default")!.preview}
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                          />
                          {/* Zoom button - centered on hover */}
                          <button
                            onClick={() => setPreviewImage(getImageForSlot("default")!.preview)}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ZoomIn className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUploadClick("default")}
                      className="w-14 h-[75px] rounded-lg border-2 border-dashed border-zinc-700 hover:border-zinc-500 transition-colors flex items-center justify-center text-zinc-500 hover:text-zinc-400"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="flex-1 min-h-[56px] flex flex-col">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  generationType === "video"
                    ? texts.videoPlaceholder
                    : texts.imagePlaceholder
                }
                disabled={disabled || isLoading}
                className={cn(
                  "w-full h-full min-h-[60px] max-h-[200px] bg-transparent placeholder:text-zinc-500 resize-none focus:outline-none text-sm leading-relaxed",
                  promptError ? "text-red-400" : "text-white",
                  (disabled || isLoading) && "opacity-50 cursor-not-allowed"
                )}
                rows={3}
              />
              {/* Character count and error */}
              {(showCharCount || promptError) && (
                <div
                  className={cn(
                    "text-xs mt-1 text-right",
                    promptError ? "text-red-400" : "text-zinc-500"
                  )}
                >
                  {prompt.length}/{maxPromptLength}
                  {promptError && <span className="ml-2">{promptError}</span>}
                </div>
              )}
              {imageError && (
                <div className="text-xs mt-1 text-right text-red-400">{imageError}</div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Generation Type Selector - only show when both types available */}
              {showGenerationTypeSwitch && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm">
                      {generationType === "video" ? (
                        <>
                          <Video className="w-4 h-4 text-red-500" />
                          <span className="text-red-500 font-medium">{texts.aiVideo}</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-500 font-medium">{texts.aiImage}</span>
                        </>
                      )}
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                    <DropdownMenuItem
                      onClick={() => handleGenerationTypeChange("video")}
                      className="text-white hover:bg-zinc-800"
                    >
                      <Video className="w-4 h-4 mr-2 text-red-500" />
                      {texts.aiVideo}
                      {generationType === "video" && (
                        <Check className="w-4 h-4 ml-auto text-green-500" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleGenerationTypeChange("image")}
                      className="text-white hover:bg-zinc-800"
                    >
                      <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />
                      {texts.aiImage}
                      {generationType === "image" && (
                        <Check className="w-4 h-4 ml-auto text-green-500" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mode Selector */}
              {currentModes.length > 0 && currentMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm text-white">
                      <span className="text-zinc-400">{getModeIcon(currentMode.icon)}</span>
                      <span>{currentMode.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                    {currentModes.map((mode) => (
                      <DropdownMenuItem
                        key={mode.id}
                        onClick={() => handleModeChange(mode)}
                        className="text-white hover:bg-zinc-800"
                      >
                        <span className="mr-2">{getModeIcon(mode.icon)}</span>
                        {mode.name}
                        {currentMode.id === mode.id && (
                          <Check className="w-4 h-4 ml-auto text-green-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Model Selector */}
              {currentModel && (
                <DropdownMenu open={isModelDropdownOpen} onOpenChange={setIsModelDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm text-white">
                      {renderModelIcon(currentModel, "sm")}
                      <span>{currentModel.name}</span>
                      {currentModel.isPro && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">PRO</span>
                      )}
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-800 w-80 max-h-[400px] overflow-y-scroll custom-scrollbar">
                    <DropdownMenuLabel className="text-zinc-400 text-xs">
                      {generationType === "video" ? texts.videoModels : texts.imageModels}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    {availableModels.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        data-model-id={model.id}
                        onClick={() => handleModelChangeInternal(model)}
                        className="text-white hover:bg-zinc-800 flex flex-col items-start py-3"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {renderModelIcon(model, "md")}
                            <span className="font-medium">{model.name}</span>
                          </div>
                          {currentModel.id === model.id && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {model.description && (
                          <div className="text-xs text-zinc-500 mt-1 ml-8">{model.description}</div>
                        )}
                        <div className="text-xs text-zinc-400 mt-1 ml-8 flex items-center gap-2">
                          {"maxDuration" in model && (model as VideoModel).maxDuration && (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {(model as VideoModel).maxDuration}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span>{model.creditDisplay ?? `${model.creditCost}+`} {texts.credits?.toLowerCase()}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Style Selector (Image only) */}
              {generationType === "image" && imageStyles.length > 0 && selectedStyle && (
                <Dialog open={isStyleDialogOpen} onOpenChange={setIsStyleDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm text-white">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>{selectedStyle.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">{texts.selectStyle}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                      {imageStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => {
                            setSelectedStyle(style);
                            setIsStyleDialogOpen(false);
                            onChange?.({ style: style.id });
                          }}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all text-center",
                            selectedStyle.id === style.id
                              ? "border-purple-500 bg-purple-500/10"
                              : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
                          )}
                        >
                          <div className="w-full aspect-square rounded-lg bg-zinc-700 mb-2 flex items-center justify-center overflow-hidden">
                            {style.preview ? (
                              <img
                                src={style.preview}
                                alt={style.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Sparkles className="w-8 h-8 text-zinc-500" />
                            )}
                          </div>
                          <span className="text-sm text-white">{style.name}</span>
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Quick Settings */}
              <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm text-zinc-400 hover:text-white">
                    <div
                      className={cn(
                        "border border-current rounded-sm",
                        currentAspectRatio === "16:9" && "w-4 h-2.5",
                        currentAspectRatio === "9:16" && "w-2.5 h-4",
                        currentAspectRatio === "1:1" && "w-3 h-3",
                        currentAspectRatio === "4:3" && "w-3.5 h-2.5",
                        currentAspectRatio === "3:4" && "w-2.5 h-3.5",
                        currentAspectRatio === "3:2" && "w-3.5 h-2.5",
                        currentAspectRatio === "2:3" && "w-2.5 h-3.5",
                        currentAspectRatio === "21:9" && "w-5 h-2"
                      )}
                    />
                    <span>{currentAspectRatio}</span>
                    {generationType === "video" && showDurationControl && (
                      <>
                        <span className="text-zinc-600 mx-1">|</span>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{duration}</span>
                      </>
                    )}
                    {generationType === "video" && showResolutionControl && (
                      <>
                        <span className="text-zinc-600 mx-1">|</span>
                        <span>{resolution}</span>
                      </>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-fit bg-zinc-900 border-zinc-800 p-4" align="start">
                  {/* Aspect Ratio */}
                  <div className="mb-4">
                    <label className="text-xs text-zinc-400 mb-2 block">{texts.aspectRatio}</label>
                    <div className="flex gap-2">
                      {currentAspectRatios.map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => handleAspectRatioChange(ratio)}
                          className={cn(
                            "flex-1 min-w-[52px] px-6 py-2 rounded-lg text-xs flex flex-col items-center gap-1.5 transition-colors",
                            currentAspectRatio === ratio
                              ? "bg-zinc-700 text-white border border-zinc-500"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-transparent"
                          )}
                        >
                          {/* Fixed height container for icon alignment */}
                          <div className="h-6 flex items-center justify-center">
                            <div
                              className={cn(
                                "border border-current rounded-sm",
                                ratio === "16:9" && "w-6 h-3.5",
                                ratio === "9:16" && "w-3.5 h-6",
                                ratio === "1:1" && "w-5 h-5",
                                ratio === "4:3" && "w-5 h-4",
                                ratio === "3:4" && "w-4 h-5",
                                ratio === "3:2" && "w-6 h-4",
                                ratio === "2:3" && "w-4 h-6",
                                ratio === "21:9" && "w-7 h-3"
                              )}
                            />
                          </div>
                          <span>{ratio}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Video Length */}
                  {showDurationControl && (
                    <div className="mb-4">
                      <label className="text-xs text-zinc-400 mb-2 block">{texts.videoLength}</label>
                      <div className="flex gap-2">
                        {effectiveDurations.map((d) => (
                          <button
                            key={d}
                            onClick={() => {
                              setDuration(d);
                              onChange?.({ duration: d });
                            }}
                            className={cn(
                              "flex-1 min-w-[44px] px-6 py-2 rounded-lg text-sm transition-colors",
                              duration === d
                                ? "bg-zinc-700 text-white"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution */}
                  {showResolutionControl && (
                    <div>
                      <label className="text-xs text-zinc-400 mb-2 block">{texts.resolution}</label>
                      <div className="flex gap-2">
                        {effectiveResolutions.map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setResolution(r);
                              onChange?.({ resolution: r });
                            }}
                            className={cn(
                              "flex-1 min-w-[60px] px-6 py-2 rounded-lg text-sm transition-colors",
                              resolution === r
                                ? "bg-zinc-700 text-white"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Advanced Settings (Output Number, Generate Audio) */}
              <Popover open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-zinc-900 border-zinc-800 p-4" align="end">
                  {/* Output Number */}
                  {currentOutputNumbers.length > 0 && (
                    <div className={modelSupportsAudio ? "mb-4" : ""}>
                      <label className="text-xs text-zinc-400 mb-2 block">
                        {generationType === "video" ? texts.outputNumber : texts.numberOfImages}
                      </label>
                      <div className="flex gap-2">
                        {currentOutputNumbers.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleOutputNumberChange(option)}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-sm transition-colors relative",
                              currentOutputNumber === option.value
                                ? "bg-zinc-700 text-white"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
                              option.isPro && !isPro && "opacity-70"
                            )}
                          >
                            <span className="flex items-center justify-center gap-1">
                              {option.value}
                              {option.isPro && !isPro && (
                                <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">PRO</span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generate Audio - only show when model supports it */}
                  {modelSupportsAudio && (
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-zinc-400" />
                          <div>
                            <div className="text-sm text-white">Generate Audio</div>
                            <div className="text-xs text-zinc-500">
                              Add natural-sounding audio
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setGenerateAudio(!generateAudio)}
                          className={cn(
                            "relative w-11 h-6 rounded-full transition-colors",
                            generateAudio ? "bg-red-500" : "bg-zinc-700"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                              generateAudio ? "left-6" : "left-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Credits & Submit */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">
                {calculatedCredits} {texts.credits}
              </span>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  canSubmit
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Suggestions */}
      {promptTemplates.length > 0 && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <button
            onClick={refreshSuggestions}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors text-sm text-zinc-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {visibleTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handlePromptSuggestion(template)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors text-sm text-zinc-300 hover:text-white"
            >
              {template.image && (
                <img src={template.image} alt="" className="w-5 h-5 rounded object-cover" />
              )}
              <span className="max-w-[120px] truncate">{template.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoGeneratorInput;
