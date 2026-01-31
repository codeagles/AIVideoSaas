/**
 * VideoGeneratorInput Component Types
 *
 * This file contains all TypeScript type definitions for the VideoGeneratorInput component.
 * These types define the data structure that users need to provide when integrating the component.
 *
 * @example
 * ```tsx
 * import type { VideoModel, ImageModel, GeneratorConfig } from "./types";
 * ```
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Generation type - video or image
 */
export type GenerationType = "video" | "image";

/**
 * Model badge types for highlighting special features
 */
export type ModelBadge = "New" | "Hot" | "Audio" | "Beta" | "Pro";

/**
 * Upload type determines how many image slots are shown
 * - single: One optional image upload
 * - start-end: Two slots (Start frame, End frame)
 * - characters: Three slots (Image1, Image2, Image3)
 */
export type UploadType = "single" | "start-end" | "characters";

/**
 * Mode icon type for visual representation
 */
export type ModeIconType = "text" | "image" | "reference" | "frames";

// ============================================================================
// Data Models
// ============================================================================

/**
 * Video generation model configuration
 *
 * @example
 * ```ts
 * const model: VideoModel = {
 *   id: "sora-2",
 *   name: "Sora 2",
 *   icon: "S",
 *   badge: "New",
 *   color: "#000000",
 *   description: "OpenAI's advanced video generation model",
 *   maxDuration: "15 sec",
 *   creditCost: 7,
 * };
 * ```
 */
export interface VideoModel {
  /** Unique identifier for the model */
  id: string;
  /** Display name */
  name: string;
  /** Model brand logo/icon URL or single character (e.g., "https://example.com/logo.png" or "S") - optional */
  icon?: string;
  /** Optional badge to highlight features */
  badge?: ModelBadge;
  /** Brand color (hex format) - optional */
  color?: string;
  /** Brief description of the model's capabilities - optional */
  description?: string;
  /** Maximum video duration supported - optional */
  maxDuration?: string;
  /** Base credit cost for this model (number for calculation) */
  creditCost: number;
  /** Display text for credits (e.g., "8+") - optional, auto-generated from creditCost if not provided */
  creditDisplay?: string;
  /** Whether the model is enabled (default: true) */
  enabled?: boolean;
  /** Whether this model requires Pro subscription */
  isPro?: boolean;
  /** Custom metadata for your application */
  metadata?: Record<string, unknown>;

  // === Model-specific parameter constraints ===

  /**
   * Supported duration options for this model.
   * If specified, only these durations will be available when this model is selected.
   * @example ["10s", "15s"]
   */
  durations?: string[];

  /**
   * Supported aspect ratio options for this model.
   * If specified, only these aspect ratios will be available when this model is selected.
   * @example ["16:9", "9:16"]
   */
  aspectRatios?: string[];

  /**
   * Supported resolution options for this model.
   * If specified, only these resolutions will be available when this model is selected.
   * @example ["720P", "1080P"]
   */
  resolutions?: string[];

  /**
   * Maximum number of images allowed for this model.
   * @example 1
   */
  maxImages?: number;

  /**
   * Minimum number of images required for this model.
   * If set, image upload becomes mandatory.
   * @example 1
   */
  minImages?: number;

  /**
   * Whether this model requires image upload (cannot work with text-only).
   * @default false
   */
  requiresImage?: boolean;

  /**
   * Supported quality options for this model.
   * @example ["standard", "high"]
   */
  qualities?: string[];

  /**
   * Quality-duration constraints for models with quality-duration coupling.
   * Maps duration to allowed quality values.
   * @example { "15s": ["high"], "25s": ["standard"] }
   */
  qualityDurationConstraints?: Record<string, string[]>;

  /**
   * Supported output number options for this model.
   * If not specified, defaults to 1.
   * @example [{ value: 1 }, { value: 2, isPro: true }]
   */
  outputNumbers?: OutputNumberOption[];

  /**
   * Whether this model supports audio input.
   * @default false
   */
  supportsAudio?: boolean;

  /**
   * Audio constraints for models that support audio.
   */
  audioConstraints?: {
    /** Minimum duration in seconds */
    minDuration?: number;
    /** Maximum duration in seconds */
    maxDuration?: number;
    /** Maximum file size in MB */
    maxSizeMB?: number;
    /** Supported formats */
    formats?: string[];
  };

  /**
   * Image constraints for this model.
   */
  imageConstraints?: {
    /** Minimum width in pixels */
    minWidth?: number;
    /** Maximum width in pixels */
    maxWidth?: number;
    /** Minimum height in pixels */
    minHeight?: number;
    /** Maximum height in pixels */
    maxHeight?: number;
    /** Maximum file size in MB */
    maxSizeMB?: number;
    /** Supported formats */
    formats?: string[];
  };

  /**
   * Reference video constraints for models that accept video input (e.g., wan2.6 in reference-to-video mode).
   */
  videoInputConstraints?: {
    /** Minimum number of reference videos */
    minVideos?: number;
    /** Maximum number of reference videos */
    maxVideos?: number;
    /** Minimum duration in seconds */
    minDuration?: number;
    /** Maximum duration in seconds */
    maxDuration?: number;
    /** Maximum file size in MB */
    maxSizeMB?: number;
    /** Supported formats */
    formats?: string[];
  };

  /**
   * Whether this model accepts video input instead of images (e.g., reference video models).
   * @default false
   */
  acceptsVideoInput?: boolean;

  /**
   * Tooltip/hint text to show in UI for this model.
   */
  hint?: string;
}

/**
 * Image generation model configuration
 *
 * @example
 * ```ts
 * const model: ImageModel = {
 *   id: "flux-pro",
 *   name: "FLUX 1.1 Pro",
 *   icon: "F",
 *   badge: "Hot",
 *   color: "#6366f1",
 *   description: "Professional-grade image generation",
 *   creditCost: 4,
 * };
 * ```
 */
export interface ImageModel {
  /** Unique identifier for the model */
  id: string;
  /** Display name */
  name: string;
  /** Model brand logo/icon URL or single character - optional */
  icon?: string;
  /** Optional badge */
  badge?: ModelBadge;
  /** Brand color (hex format) - optional */
  color?: string;
  /** Brief description - optional */
  description?: string;
  /** Base credit cost for this model (number for calculation) */
  creditCost: number;
  /** Display text for credits (e.g., "4+") - optional */
  creditDisplay?: string;
  /** Whether the model is enabled */
  enabled?: boolean;
  /** Whether this model requires Pro subscription */
  isPro?: boolean;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Generation mode configuration
 *
 * Modes can define which models they support and override default parameter options.
 * This allows for dynamic filtering based on the selected mode.
 *
 * @example
 * ```ts
 * const mode: GeneratorMode = {
 *   id: "text-image-to-video",
 *   name: "Text/Image to Video",
 *   icon: "text",
 *   uploadType: "single",
 *   // Optional: restrict to specific models
 *   supportedModels: ["sora-2", "wan2.6", "veo-3.1"],
 *   // Optional: override default durations for this mode
 *   durations: ["4s", "5s", "8s"],
 * };
 * ```
 */
export interface GeneratorMode {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Icon type for visual representation */
  icon: ModeIconType;
  /** Upload configuration */
  uploadType?: UploadType;
  /** Brief description (optional) */
  description?: string;
  /** Whether the mode is enabled */
  enabled?: boolean;

  // === Mode-specific constraints ===

  /**
   * List of supported model IDs for this mode.
   * If not specified, all models are available.
   * When mode changes, the model selector will only show these models.
   */
  supportedModels?: string[];

  /**
   * Override duration options for this mode.
   * If not specified, uses the global durations from config.
   */
  durations?: string[];

  /**
   * Override resolution options for this mode.
   * If not specified, uses the global resolutions from config.
   */
  resolutions?: string[];

  /**
   * Override aspect ratio options for this mode.
   * If not specified, uses the global aspect ratios from config.
   */
  aspectRatios?: string[];
}

/**
 * Image style configuration (for image generation)
 *
 * @example
 * ```ts
 * const style: ImageStyle = {
 *   id: "ghibli",
 *   name: "Ghibli",
 *   preview: "https://example.com/ghibli-preview.jpg",
 * };
 * ```
 */
export interface ImageStyle {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Preview image URL (optional) */
  preview?: string;
  /** Whether the style is enabled */
  enabled?: boolean;
}

/**
 * Prompt template for quick suggestions
 *
 * @example
 * ```ts
 * const template: PromptTemplate = {
 *   id: "1",
 *   text: "Cozy Christmas Room",
 *   image: "https://example.com/christmas.jpg",
 * };
 * ```
 */
export interface PromptTemplate {
  /** Unique identifier */
  id: string;
  /** Prompt text */
  text: string;
  /** Thumbnail image URL (optional) */
  image?: string;
  /** Category for grouping (optional) */
  category?: string;
}

/**
 * Uploaded image information (internal use)
 */
export interface UploadedImage {
  /** Original file object */
  file: File;
  /** Base64 preview URL */
  preview: string;
  /** Slot identifier (e.g., "default", "start", "char1") */
  slot: string;
}

/**
 * Upload slot configuration (internal use)
 */
export interface UploadSlot {
  /** Slot identifier */
  id: string;
  /** Primary label */
  label: string;
  /** Secondary label (e.g., "(Opt)") */
  subLabel: string;
  /** Whether this slot is required */
  required: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Complete generator configuration
 * Use this to pass all configuration data to the component
 *
 * @example
 * ```tsx
 * const config: GeneratorConfig = {
 *   videoModels: [...],
 *   imageModels: [...],
 *   videoModes: [...],
 *   imageModes: [...],
 *   imageStyles: [...],
 *   promptTemplates: [...],
 *   aspectRatios: { video: ["16:9", "9:16"], image: ["1:1", "16:9"] },
 *   durations: ["4s", "5s", "8s"],
 *   resolutions: ["720P", "1080P"],
 *   outputNumbers: { video: [1, 2], image: [1, 2, 4] },
 * };
 *
 * <VideoGeneratorInput config={config} />
 * ```
 */
export interface GeneratorConfig {
  /** Available video generation models */
  videoModels?: VideoModel[];
  /** Available image generation models */
  imageModels?: ImageModel[];
  /** Available video generation modes */
  videoModes?: GeneratorMode[];
  /** Available image generation modes */
  imageModes?: GeneratorMode[];
  /** Available image styles */
  imageStyles?: ImageStyle[];
  /** Prompt templates for suggestions */
  promptTemplates?: PromptTemplate[];
  /** Aspect ratio options */
  aspectRatios?: {
    video?: string[];
    image?: string[];
  };
  /** Video duration options */
  durations?: string[];
  /** Video resolution options */
  resolutions?: string[];
  /** Output number options with Pro support */
  outputNumbers?: {
    video?: OutputNumberOption[];
    image?: OutputNumberOption[];
  };
}

/**
 * Output number option with Pro support
 */
export interface OutputNumberOption {
  /** The number value */
  value: number;
  /** Whether this option requires Pro subscription */
  isPro?: boolean;
}

/**
 * Credit calculation function type
 * Returns estimated credits based on current selections
 */
export type CreditCalculator = (params: {
  type: GenerationType;
  model: string;
  outputNumber: number;
  duration?: string;
  resolution?: string;
}) => number;

/**
 * Default values for the generator
 */
export interface GeneratorDefaults {
  /** Default generation type */
  generationType?: GenerationType;
  /** Default video model ID */
  videoModel?: string;
  /** Default image model ID */
  imageModel?: string;
  /** Default video mode ID */
  videoMode?: string;
  /** Default image mode ID */
  imageMode?: string;
  /** Default video aspect ratio */
  videoAspectRatio?: string;
  /** Default image aspect ratio */
  imageAspectRatio?: string;
  /** Default video duration */
  duration?: string;
  /** Default video resolution */
  resolution?: string;
  /** Default video output number */
  videoOutputNumber?: number;
  /** Default image output number */
  imageOutputNumber?: number;
  /** Default image style ID */
  imageStyle?: string;
}

// ============================================================================
// Submit Data
// ============================================================================

/**
 * Data returned when user submits a generation request
 *
 * @example
 * ```tsx
 * const handleSubmit = (data: SubmitData) => {
 *   console.log(data.type);        // "video" | "image"
 *   console.log(data.prompt);      // User's prompt text
 *   console.log(data.model);       // Selected model ID
 *   console.log(data.images);      // Uploaded files (if any)
 *
 *   // Send to your API
 *   fetch("/api/generate", {
 *     method: "POST",
 *     body: JSON.stringify(data),
 *   });
 * };
 * ```
 */
export interface SubmitData {
  /** Generation type */
  type: GenerationType;
  /** User's prompt text */
  prompt: string;
  /** Uploaded image files (if any) */
  images?: File[];
  /** Image URLs (for template images or pre-uploaded images) */
  imageUrls?: string[];
  /** Image slot information for multi-image uploads */
  imageSlots?: Array<{ slot: string; file: File }>;
  /** Selected model ID */
  model: string;
  /** Selected mode ID */
  mode: string;
  /** Selected aspect ratio */
  aspectRatio: string;
  /** Video duration (video only) */
  duration?: string;
  /** Video resolution (video only) */
  resolution?: string;
  /** Video quality (video only, e.g., "standard" or "high") */
  quality?: string;
  /** Number of outputs to generate */
  outputNumber: number;
  /** Image style ID (image only) */
  style?: string;
  /** Whether to generate audio (for models that support it) */
  generateAudio?: boolean;
  /** Estimated credits to be consumed */
  estimatedCredits: number;
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Internationalization texts
 */
export interface GeneratorTexts {
  // Placeholders
  videoPlaceholder?: string;
  imagePlaceholder?: string;

  // Labels
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

  // Errors
  promptTooLong?: string;

  // Upload slots
  start?: string;
  end?: string;
  optional?: string;
}

/**
 * Main component props
 *
 * @example
 * ```tsx
 * <VideoGeneratorInput
 *   config={myConfig}
 *   defaults={myDefaults}
 *   credits={user.credits}
 *   onSubmit={handleSubmit}
 *   onChange={handleChange}
 * />
 * ```
 */
export interface VideoGeneratorInputProps {
  // === Configuration ===

  /**
   * Generator configuration (models, modes, styles, etc.)
   * If not provided, default configuration will be used
   */
  config?: GeneratorConfig;

  /**
   * Default values for the generator
   */
  defaults?: GeneratorDefaults;

  // === State ===

  /**
   * Whether the user has Pro subscription
   * Pro users can access Pro-only features (e.g., more output numbers, Pro models)
   * @default false
   */
  isPro?: boolean;

  /**
   * Estimated credits to be consumed (displayed in the button)
   * This should be calculated externally based on current selections
   * If not provided, will use model's base creditCost * outputNumber
   */
  estimatedCredits?: number;

  /**
   * Custom credit calculation function
   * If provided, will be called to calculate estimated credits
   * Takes precedence over estimatedCredits prop
   */
  calculateCredits?: CreditCalculator;

  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether a generation is in progress
   * @default false
   */
  isLoading?: boolean;

  /**
   * Loading state text
   */
  loadingText?: string;

  /**
   * Maximum prompt character length
   * @default 2000
   */
  maxPromptLength?: number;

  // === Styling ===

  /**
   * Additional CSS class for the container
   */
  className?: string;

  /**
   * Custom texts for internationalization
   */
  texts?: GeneratorTexts;

  // === Callbacks ===

  /**
   * Called when user submits a generation request
   */
  onSubmit?: (data: SubmitData) => void;

  /**
   * Called when any value changes
   */
  onChange?: (data: Partial<SubmitData>) => void;

  /**
   * Called when generation type changes
   */
  onGenerationTypeChange?: (type: GenerationType) => void;

  /**
   * Called when model changes
   */
  onModelChange?: (modelId: string, type: GenerationType) => void;

  /**
   * Called when mode changes
   */
  onModeChange?: (modeId: string) => void;

  /**
   * Called when images are uploaded
   */
  onImageUpload?: (files: File[], slot: string) => void;

  /**
   * Called when an image is removed
   */
  onImageRemove?: (slot: string) => void;

  /**
   * Called when prompt changes
   */
  onPromptChange?: (prompt: string) => void;

  /**
   * Called when a non-Pro user clicks on a Pro-only feature
   * Use this to show upgrade modal or redirect to pricing page
   */
  onProFeatureClick?: (feature: string) => void;

  // === Validation ===

  /**
   * Custom prompt validation function
   * Return error message string if invalid, null if valid
   */
  validatePrompt?: (prompt: string) => string | null;

  /**
   * Custom image validation function
   * Return error message string if invalid, null if valid
   */
  validateImages?: (files: File[]) => string | null;
}
