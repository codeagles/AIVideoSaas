/**
 * ============================================
 * 用户配置文件 - 价格和积分
 * ============================================
 *
 * 📖 使用指南
 * -----------
 * 这个文件包含了所有与价格、积分相关的配置。
 *
 * 🎯 主要配置项：
 * 1. 基础设置 - 新用户赠送、过期规则
 * 2. 订阅产品 - 月付/年付订阅价格和积分
 * 3. 积分包 - 一次性购买积分包
 * 4. 模型计费 - 各 AI 模型的积分消耗规则
 *
 * 📝 修改方法：
 * - 直接修改下面的数值即可（价格用美元，不是美分）
 * - 保存后自动生效，无需重启服务器
 * - 要禁用某个产品，将 enabled 改为 false
 *
 * ⚠️ 注意事项：
 * - 不要修改 id 字段（用于数据库关联）
 * - 价格使用美元单位（如 9.9 表示 $9.90）
 * - 积分数量是整数
 * - allowFreeUser: 是否允许免费用户购买（可选，默认 true）
 *
 * ============================================
 */

// ============================================
// 类型定义（内部使用）
// ============================================

/** 视频模型积分配置 */
export interface VideoModelPricing {
  baseCredits: number;
  perSecond: number;
  qualityMultiplier?: number;
  enabled: boolean;
}

/** 订阅产品配置 */
export interface SubscriptionProductConfig {
  id: string;
  name: string;
  priceUsd: number;
  credits: number;
  period: "month" | "year";
  popular?: boolean;
  enabled: boolean;
  features?: string[];
}

/** 积分包配置 */
export interface CreditPackageConfig {
  id: string;
  name: string;
  priceUsd: number;
  credits: number;
  popular?: boolean;
  enabled: boolean;
  /** 是否允许免费用户购买（可选，默认 true） */
  allowFreeUser?: boolean;
  features?: string[];
}

// ============================================
// 一、基础设置
// ============================================

/**
 * 新用户注册赠送积分
 */
export const NEW_USER_GIFT = {
  /** 是否启用赠送 */
  enabled: true,
  /** 赠送积分数量 */
  credits: 50,
  /** 积分有效期（天）*/
  validDays: 30,
};

/**
 * 积分过期设置
 */
export const CREDIT_EXPIRATION = {
  /** 订阅积分有效期（天）- 月付用户 */
  subscriptionDays: 30,
  /** 一次性购买积分有效期（天）- 单独购买积分包 */
  purchaseDays: 365,
  /** 提前多少天提醒积分即将过期 */
  warnBeforeDays: 7,
};

// ============================================
// 二、订阅产品配置
// ============================================

/**
 * 订阅产品列表
 *
 * 每个产品包含：
 * - id: 产品唯一标识（不要改）
 * - name: 显示名称
 * - priceUsd: 价格（美元）
 * - credits: 每周期赠送积分
 * - period: 付费周期 ("month" 或 "year")
 * - popular: 是否标记为推荐（最多选1-2个）
 * - enabled: 是否启用该产品
 */
export const SUBSCRIPTION_PRODUCTS = [
  // ===== 月付订阅 =====
  {
    id: "basic_monthly",
    name: "Basic Plan",
    priceUsd: 9.9,
    credits: 100,
    period: "month" as const,
    popular: false,
    enabled: true,
    features: ["hd_videos", "fast_generation"],
  },
  {
    id: "pro_monthly",
    name: "Pro Plan",
    priceUsd: 29.9,
    credits: 500,
    period: "month" as const,
    popular: true, // 推荐
    enabled: true,
    features: ["hd_videos", "fast_generation", "no_watermark", "commercial_use"],
  },
  {
    id: "team_monthly",
    name: "Team Plan",
    priceUsd: 99.9,
    credits: 2000,
    period: "month" as const,
    popular: false,
    enabled: true,
    features: ["hd_videos", "fast_generation", "no_watermark", "commercial_use", "priority_support", "api_access"],
  },

  // ===== 年付订阅 =====
  {
    id: "basic_yearly",
    name: "Basic Plan (Yearly)",
    priceUsd: 99,
    credits: 1200, // 100 × 12 月
    period: "year" as const,
    popular: false,
    enabled: true,
    features: ["hd_videos", "fast_generation"],
  },
  {
    id: "pro_yearly",
    name: "Pro Plan (Yearly)",
    priceUsd: 299,
    credits: 6000, // 500 × 12 月
    period: "year" as const,
    popular: true,
    enabled: true,
    features: ["hd_videos", "fast_generation", "no_watermark", "commercial_use"],
  },
  {
    id: "team_yearly",
    name: "Team Plan (Yearly)",
    priceUsd: 999,
    credits: 24000, // 2000 × 12 月
    period: "year" as const,
    popular: false,
    enabled: true,
    features: ["hd_videos", "fast_generation", "no_watermark", "commercial_use", "priority_support", "api_access"],
  },
];

// ============================================
// 三、一次性购买积分包
// ============================================

/**
 * 积分包产品列表
 *
 * 用户可以单独购买积分包（不订阅）
 *
 * allowFreeUser 说明：
 * - true:  所有用户都可以购买此积分包
 * - false: 只有订阅用户才能购买此积分包
 * - 不填: 默认为 true（所有用户可购买）
 */
export const CREDIT_PACKAGES: CreditPackageConfig[] = [
  {
    id: "starter",
    name: "Starter Pack",
    priceUsd: 9.9,
    credits: 100,
    popular: false,
    enabled: true,
    allowFreeUser: true, // 免费用户可购买
    features: ["hd_videos", "fast_generation"],
  },
  {
    id: "standard",
    name: "Standard Pack",
    priceUsd: 19.9,
    credits: 250,
    popular: true, // 推荐
    enabled: true,
    allowFreeUser: true,
    features: ["hd_videos", "fast_generation", "no_watermark"],
  },
  {
    id: "large",
    name: "Large Pack",
    priceUsd: 49.9,
    credits: 700,
    popular: false,
    enabled: true,
    allowFreeUser: true,
    features: ["hd_videos", "fast_generation", "no_watermark", "commercial_use"],
  },
];

// ============================================
// 四、AI 模型积分计费
// ============================================

/**
 * 视频生成模型积分配置
 *
 * 💡 定价说明（基于 Evolink 1:1 成本，向上取整）:
 *
 * 1. **Sora 2 Lite**: 10s=2积分, 15s=3积分 (无水印)
 * 2. **Wan 2.6**: 720p: 5s=25积分, 10s=50积分, 15s=75积分
 *              1080p × 1.67 倍
 * 3. **Veo 3.1 Fast Lite**: 固定 10积分 (720p/1080p)
 * 4. **Seedance 1.5 Pro**: 按秒计费, 默认有音频
 *                          480p: 1.636 Credits/秒 → 2 积分/秒
 *                          720p: 3.557 Credits/秒 → 4 积分/秒
 *                          1080p: 7.932 Credits/秒 → 8 积分/秒
 *
 * 计费规则说明：
 * - baseCredits: 基础积分（最短时长、最低画质）
 * - perSecond: 每秒积分（用于按秒计费的模型）
 * - qualityMultiplier: 画质乘数（1080p vs 720p）
 */
export const VIDEO_MODEL_PRICING: Record<string, VideoModelPricing> = {
  /** Sora 2 Lite - OpenAI */
  "sora-2": {
    baseCredits: 2,       // 10秒 = 2积分 (1.6 Credits 向上取整)
    perSecond: 0,         // 固定价格
    enabled: true,
  },

  /** Wan 2.6 */
  "wan2.6": {
    baseCredits: 25,      // 5秒 720p = 25积分
    perSecond: 5,         // 每秒 = 5积分 (10秒 = 25 + 5×5 = 50积分)
    qualityMultiplier: 1.67, // 1080p = 720p × 1.67 (41.75 / 25 ≈ 1.67)
    enabled: true,
  },

  /** Veo 3.1 Fast Lite - Google */
  "veo-3.1": {
    baseCredits: 10,      // 固定 10积分 (9.6 Credits 向上取整)
    perSecond: 0,
    enabled: true,
  },

  /** Seedance 1.5 Pro - 按秒计费（默认有音频） */
  "seedance-1.5-pro": {
    baseCredits: 0,       // 不使用 baseCredits
    perSecond: 4,         // 720p 有音频: 3.557 Credits/秒 → 4 积分/秒
    qualityMultiplier: 2, // 1080p = 720p × 2 (7.932 / 3.557 ≈ 2.23, 向上取整为 2)
    enabled: true,
  },
};

// ============================================
// 五、支付配置（环境变量）
// ============================================

/**
 * 支付提供商配置
 *
 * 这些配置通常在 .env.local 文件中设置
 * 这里只是说明，不需要修改
 */
export const PAYMENT_CONFIG = {
  /** 使用 Creem 支付 */
  provider: "creem",
  /** 支付成功后的回调地址（自动生成）*/
  webhookUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/credit/callback`
    : "",
};
