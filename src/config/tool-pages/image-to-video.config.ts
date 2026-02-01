import { ToolPageConfig } from "./types";

/**
 * Image to Video 工具页面配置
 */
export const imageToVideoConfig: ToolPageConfig = {
  // SEO 配置
  seo: {
    title: "Image to Video - Transform Photos into AI Videos",
    description: "Convert your images into stunning videos using AI Seedance 1.5 Pro. Upload any photo and watch it come to life with smooth, realistic motion.",
    keywords: [
      "image to video",
      "photo animation",
      "ai video generator",
      "picture to video",
      "image animation",
      "seedance",
    ],
    ogImage: "/og-image-to-video.jpg",
  },

  // 生成器配置
  generator: {
    mode: "image-to-video",
    uiMode: "compact",

    defaults: {
      model: "seedance-1.5-pro",
      duration: 10,
      aspectRatio: "16:9",
      outputNumber: 1,
    },

    models: {
      available: ["seedance-1.5-pro"],
      default: "seedance-1.5-pro",
    },

    features: {
      showImageUpload: true,
      showPromptInput: true,
      showModeSelector: false,
    },

    promptPlaceholder: "Describe the video you want to create from this image...",

    settings: {
      showDuration: true,
      showAspectRatio: true,
      showQuality: false,
      showOutputNumber: false,
      showAudioGeneration: false,

      durations: [4, 5, 6, 8, 10, 12],
      aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
    },
  },

  // Landing Page 配置
  landing: {
    hero: {
      title: "Transform Your Images into Stunning Videos",
      description: "Upload any photo and watch AI bring it to life with smooth, realistic motion. Perfect for social media, marketing, and creative projects.",
      ctaText: "Get Started Free",
      ctaSubtext: "50 free credits to try",
    },

    examples: [
      {
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
        title: "Photo to Living Scene",
        prompt: "A girl walking on the beach, hair flowing in the wind, golden sunset",
      },
      {
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
        title: "Product Animation",
        prompt: "Smartphone rotating on white background with floating particles",
      },
      {
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
        title: "Abstract Art Animation",
        prompt: "Swirling colors and shapes morphing smoothly, psychedelic style",
      },
    ],

    features: [
      "Upload any photo (JPG, PNG, WEBP up to 10MB)",
      "AI model for different animation styles",
      "Full HD output up to 1080p resolution",
      "Fast generation in 2-5 minutes",
      "Commercial use rights included",
    ],

    supportedModels: [
      { name: "Seedance 1.5", provider: "ByteDance", color: "#ec4899" },
    ],

    stats: {
      videosGenerated: "500K+",
      usersCount: "50K+",
      avgRating: 4.8,
    },
  },

  // 多语言 key 前缀
  i18nPrefix: "ToolPage.ImageToVideo",
};
