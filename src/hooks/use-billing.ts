"use client";

// ============================================
// Billing Hooks
// ============================================

import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/dashboard-client";

/**
 * Get billing information
 */
export function useBilling() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["billing"],
    queryFn: async ({ pageParam }) => {
      return apiClient.getBilling({
        limit: 20,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    refetchOnWindowFocus: false,
  });

  const user = data?.pages[0]?.user;
  const invoices = data?.pages.flatMap((page) => page.invoices) || [];
  const hasMore = hasNextPage || false;

  return {
    user,
    invoices,
    isLoading,
    error,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  };
}
