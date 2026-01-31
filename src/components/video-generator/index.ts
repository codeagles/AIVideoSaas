/**
 * @videofly/video-generator
 *
 * A fully configurable AI video/image generation input component.
 *
 * @example
 * ```tsx
 * import {
 *   VideoGeneratorInput,
 *   CompactGenerator,
 *   type VideoModel,
 *   type GeneratorConfig,
 *   DEFAULT_VIDEO_MODELS,
 * } from "@/components/video-generator";
 *
 * // Full mode usage
 * <VideoGeneratorInput onSubmit={handleSubmit} />
 *
 * // Compact mode usage (for tool pages)
 * <CompactGenerator
 *   config={toolPageConfig.generator}
 *   onSubmit={handleSubmit}
 * />
 *
 * // Custom configuration
 * <VideoGeneratorInput
 *   config={{ videoModels: myModels }}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */

// ============================================================================
// Main Components
// ============================================================================

// Full mode component (existing)
export { VideoGeneratorInput, default } from "./video-generator-input";

// Compact mode component (new - for tool pages)
export { CompactGenerator } from "./compact-generator";

// Core component (shared logic)
export { VideoGeneratorCore, useVideoGeneratorCore } from "./video-generator-core";

// ============================================================================
// Business Components
// ============================================================================

export { VideoStatusCard } from "./video-status-card";
export { VideoCard } from "./video-card";

// ============================================================================
// Hooks (new - shared state management)
// ============================================================================

export {
  useGeneratorState,
  useGeneratorValidation,
  type GeneratorState,
  type GeneratorHooksConfig,
  type GeneratorCallbacks,
  type GeneratorValidationConfig,
} from "./generator-hooks";

// Types
export type {
  // Core types
  GenerationType,
  ModelBadge,
  UploadType,
  ModeIconType,

  // Data models
  VideoModel,
  ImageModel,
  GeneratorMode,
  ImageStyle,
  PromptTemplate,
  UploadedImage,
  UploadSlot,
  OutputNumberOption,

  // Configuration
  GeneratorConfig,
  GeneratorDefaults,
  GeneratorTexts,

  // Submit data
  SubmitData,

  // Credit calculation
  CreditCalculator,

  // Props
  VideoGeneratorInputProps,
} from "./types";

// Defaults (optional - for customization)
export {
  // Individual defaults
  DEFAULT_VIDEO_MODELS,
  DEFAULT_IMAGE_MODELS,
  DEFAULT_VIDEO_MODES,
  DEFAULT_IMAGE_MODES,
  DEFAULT_IMAGE_STYLES,
  DEFAULT_VIDEO_ASPECT_RATIOS,
  DEFAULT_IMAGE_ASPECT_RATIOS,
  DEFAULT_DURATIONS,
  DEFAULT_RESOLUTIONS,
  DEFAULT_QUALITIES,
  DEFAULT_VIDEO_OUTPUT_NUMBERS,
  DEFAULT_IMAGE_OUTPUT_NUMBERS,
  DEFAULT_PROMPT_TEMPLATES,

  // Combined defaults
  DEFAULT_CONFIG,
  DEFAULT_DEFAULTS,

  // Localization
  DEFAULT_TEXTS_EN,
  DEFAULT_TEXTS_ZH,

  // Helper functions
  mergeConfig,
  mergeDefaults,
  getTexts,
} from "./defaults";
