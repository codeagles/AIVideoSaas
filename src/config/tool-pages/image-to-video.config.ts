import { ToolPageConfig } from "./types";

/**
 * Image to Video 工具页面配置
 */
export const imageToVideoConfig: ToolPageConfig = {
  // SEO 配置
  seo: {
    title: "Image to Video - Transform Photos into AI Videos",
    description: "Convert your images into stunning videos using AI. Upload any photo and watch it come to life with smooth, realistic motion powered by Sora 2, Veo 3.1, and more.",
    keywords: [
      "image to video",
      "photo animation",
      "ai video generator",
      "picture to video",
      "image animation",
      "sora 2",
      "veo 3.1",
    ],
    ogImage: "/og-image-to-video.jpg",
  },

  // 生成器配置
  generator: {
    mode: "image-to-video",
    uiMode: "compact",

    defaults: {
      model: "wan2.6",
      duration: 10,
      aspectRatio: "16:9",
      outputNumber: 1,
    },

    models: {
      available: ["wan2.6", "seedance-1.5-pro", "sora-2", "veo-3.1"],
      default: "wan2.6",
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

      durations: [5, 10, 15],
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
      "Multiple AI models for different animation styles",
      "Full HD output up to 1080p resolution",
      "Fast generation in 2-5 minutes",
      "Commercial use rights included",
    ],

    supportedModels: [
      { name: "Wan 2.6", provider: "Alibaba", color: "#8b5cf6" },
      { name: "Seedance 1.5", provider: "ByteDance", color: "#ec4899" },
      { name: "Sora 2", provider: "OpenAI", color: "#000000" },
      { name: "Veo 3.1", provider: "Google", color: "#4285f4" },
      { name: "Kling 2", provider: "Kuaishou", color: "#f59e0b" },
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
