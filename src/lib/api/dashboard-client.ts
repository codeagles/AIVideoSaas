// ============================================
// API Client for Dashboard
// ============================================

import type {
  ListVideosParams,
  ListVideosResponse,
  VideoResponse,
  DeleteVideoResponse,
  RetryVideoResponse,
  CreditBalance,
  CreditHistoryResponse,
  BillingResponse,
} from "../types/dashboard";

class ApiClient {
  private baseUrl = "/api/v1";

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "API request failed");
    }

    return data.data as T;
  }

  // ============================================
  // Videos
  // ============================================

  /**
   * Get list of videos for current user
   */
  async getVideos(params: ListVideosParams = {}): Promise<ListVideosResponse> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.cursor) searchParams.set("cursor", params.cursor);
    if (params.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return this.request<ListVideosResponse>(`/video/list${query ? `?${query}` : ""}`);
  }

  /**
   * Get single video by UUID
   */
  async getVideo(uuid: string): Promise<VideoResponse> {
    return this.request<VideoResponse>(`/video/${uuid}`);
  }

  /**
   * Delete a video
   */
  async deleteVideo(uuid: string): Promise<DeleteVideoResponse> {
    return this.request<DeleteVideoResponse>(`/video/${uuid}`, {
      method: "DELETE",
    });
  }

  /**
   * Retry a failed video generation
   */
  async retryVideo(uuid: string): Promise<RetryVideoResponse> {
    return this.request<RetryVideoResponse>(`/video/${uuid}/retry`, {
      method: "POST",
    });
  }

  // ============================================
  // Credits
  // ============================================

  /**
   * Get credit balance
   */
  async getCreditBalance(): Promise<CreditBalance> {
    return this.request<CreditBalance>("/credit/balance");
  }

  /**
   * Get credit history
   */
  async getCreditHistory(params: { limit?: number; cursor?: string } = {}): Promise<CreditHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.cursor) searchParams.set("cursor", params.cursor);

    const query = searchParams.toString();
    return this.request<CreditHistoryResponse>(`/credit/history${query ? `?${query}` : ""}`);
  }

  // ============================================
  // Billing
  // ============================================

  /**
   * Get billing information and invoices
   */
  async getBilling(params: { limit?: number; cursor?: string } = {}): Promise<BillingResponse> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.cursor) searchParams.set("cursor", params.cursor);

    const query = searchParams.toString();
    return this.request<BillingResponse>(`/user/billing${query ? `?${query}` : ""}`);
  }
}

// ============================================
// Export singleton instance
// ============================================

export const apiClient = new ApiClient();
