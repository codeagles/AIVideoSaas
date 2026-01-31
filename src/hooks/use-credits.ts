"use client";

// ============================================
// Credit Hooks
// ============================================

import { useCallback } from "react";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { apiClient } from "@/lib/api/dashboard-client";

/**
 * Get credit balance
 */
export function useCreditBalance() {
  const t = useTranslations("dashboard.credits");

  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["credit-balance"],
    queryFn: () => apiClient.getCreditBalance(),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  return {
    balance,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Get credit history with infinite scroll
 */
export function useCreditHistory() {
  const t = useTranslations("dashboard.credits");

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["credit-history"],
    queryFn: async ({ pageParam }) => {
      return apiClient.getCreditHistory({
        limit: 20,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    refetchOnWindowFocus: false,
  });

  // Flatten pages and filter out any null/undefined values
  const transactions = data?.pages.flatMap((page) => page.transactions).filter(Boolean) || [];
  const hasMore = hasNextPage || false;

  return {
    transactions,
    isLoading,
    error,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  };
}

/**
 * Get available credits (sugar)
 */
export function useAvailableCredits(): number {
  const { balance } = useCreditBalance();
  return balance?.availableCredits ?? 0;
}
