import { ToolPageConfig } from "./types";

/**
 * Reference to Video 工具页面配置
 */
export const referenceToVideoConfig: ToolPageConfig = {
  // SEO 配置
  seo: {
    title: "Reference to Video - Transform Videos with AI",
    description: "Upload a reference video and transform it into something new with AI. Change style, add effects, or create variations while maintaining the essence of your original video.",
    keywords: [
      "reference to video",
      "video to video",
      "ai video transformation",
      "video restyle",
      "video variation",
      "video editing ai",
    ],
    ogImage: "/og-reference-to-video.jpg",
  },

  // 生成器配置
  generator: {
    mode: "reference-to-video",
    uiMode: "compact",

    defaults: {
      model: "wan2.6",
      duration: 10,
      aspectRatio: "same-as-original",
      outputNumber: 1,
    },

    models: {
      available: ["wan2.6"],
      default: "wan2.6",
    },

    features: {
      showImageUpload: true, // 用于上传参考视频帧
      showPromptInput: true,
      showModeSelector: false,
    },

    promptPlaceholder: "Describe how you want to transform the video... e.g., 'Change to anime style, add snow effect'",

    settings: {
      showDuration: false, // 使用原始视频时长
      showAspectRatio: true, // 可以保持原始或修改
      showQuality: false,
      showOutputNumber: false,
      showAudioGeneration: false,

      aspectRatios: ["same-as-original", "16:9", "9:16", "1:1", "4:3"],
    },
  },

  // Landing Page 配置
  landing: {
    hero: {
      title: "Transform Your Videos with AI Magic",
      description: "Upload a reference video and let AI create stunning variations, style transfers, or seamless edits while preserving the core content.",
      ctaText: "Try It Now",
      ctaSubtext: "50 free credits to start",
    },

    examples: [
      {
        thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&q=80",
        title: "Style Transfer",
        prompt: "Transform video into anime style with vibrant colors",
      },
      {
        thumbnail: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&q=80",
        title: "Add Weather Effects",
        prompt: "Add rain and fog atmosphere to the scene",
      },
      {
        thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
        title: "Change Season",
        prompt: "Convert summer scene to winter with snow",
      },
    ],

    features: [
      "Upload reference videos (MP4, MOV, AVI up to 100MB)",
      "AI-powered style transfer and transformation",
      "Maintain original video timing and flow",
      "Create multiple variations from one reference",
      "Support for various artistic styles and effects",
    ],

    supportedModels: [
      { name: "Wan 2.6", provider: "Alibaba", color: "#8b5cf6" },
      { name: "Seedance 1.5", provider: "ByteDance", color: "#ec4899" },
    ],

    stats: {
      videosGenerated: "100K+",
      usersCount: "15K+",
      avgRating: 4.7,
    },
  },

  // 多语言 key 前缀
  i18nPrefix: "ToolPage.ReferenceToVideo",
};
