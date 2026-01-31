// ============================================
// Video Types
// ============================================

export type VideoStatus = "pending" | "generating" | "uploading" | "completed" | "failed";

export interface Video {
  uuid: string;
  userId: string;
  prompt: string;
  model: string;
  provider: string;
  status: VideoStatus;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  aspectRatio: string;
  parameters: Record<string, unknown>;
  creditsUsed: number;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Filter Types
// ============================================

export interface VideoFilterOptions {
  status?: VideoStatus | "all";
  model?: string | "all";
  sortBy?: "newest" | "oldest";
}

export interface ListVideosParams {
  limit?: number;
  cursor?: string;
  status?: VideoStatus;
}

// ============================================
// API Response Types
// ============================================

export interface ListVideosResponse {
  videos: Video[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface VideoResponse {
  video: Video;
}

export interface DeleteVideoResponse {
  success: boolean;
}

export interface RetryVideoResponse {
  success: boolean;
  newVideoUuid: string;
}

// ============================================
// Credit Types
// ============================================

export type CreditTransType =
  | "order_pay"
  | "subscription"
  | "admin_adjust"
  | "video_generate"
  | "video_refund";

export interface CreditTransaction {
  id: string;
  userId: string;
  credits: number;
  balanceAfter: number;
  transType: CreditTransType;
  videoUuid: string | null;
  remark: string | null;
  createdAt: Date;
}

export interface CreditBalance {
  totalCredits: number;
  usedCredits: number;
  frozenCredits: number;
  availableCredits: number;
  expiringSoon: number;
}

export interface CreditHistoryResponse {
  transactions: CreditTransaction[];
  nextCursor: string | null;
  hasMore: boolean;
}

// ============================================
// Billing Types
// ============================================

export type InvoiceStatus = "paid" | "pending" | "failed";

export interface InvoiceItem {
  type: "credits" | "subscription";
  description: string;
  quantity: number;
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  createdAt: Date;
}

export interface BillingResponse {
  user: {
    email: string;
    id: string;
    createdAt: Date;
  };
  invoices: Invoice[];
  nextCursor: string | null;
  hasMore: boolean;
}
