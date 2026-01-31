"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface CreditBalance {
  totalCredits: number;
  usedCredits: number;
  frozenCredits: number;
  availableCredits: number;
  expiringSoon: number;
}

interface CreditsState {
  // 状态
  balance: CreditBalance | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  // 操作
  setBalance: (balance: CreditBalance) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 乐观更新
  optimisticFreeze: (credits: number) => void;
  optimisticRelease: (credits: number) => void;

  // 数据获取
  fetchBalance: () => Promise<void>;
  invalidate: () => void;
  reset: () => void;
}

const CACHE_DURATION = 30 * 1000; // 30 seconds

export const useCreditsStore = create<CreditsState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        balance: null,
        isLoading: false,
        error: null,
        lastFetchedAt: null,

        // 基础操作
        setBalance: (balance) =>
          set({ balance, lastFetchedAt: Date.now(), error: null }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error, isLoading: false }),

        // 乐观更新 - 冻结积分
        optimisticFreeze: (credits) => {
          const { balance } = get();
          if (!balance) return;

          set({
            balance: {
              ...balance,
              availableCredits: balance.availableCredits - credits,
              frozenCredits: balance.frozenCredits + credits,
            },
          });
        },

        // 乐观更新 - 释放积分
        optimisticRelease: (credits) => {
          const { balance } = get();
          if (!balance) return;

          set({
            balance: {
              ...balance,
              availableCredits: balance.availableCredits + credits,
              frozenCredits: balance.frozenCredits - credits,
            },
          });
        },

        // 获取积分余额
        fetchBalance: async () => {
          const { isLoading, lastFetchedAt } = get();

          // 防止重复请求
          if (isLoading) return;

          // 使用缓存
          if (lastFetchedAt && Date.now() - lastFetchedAt < CACHE_DURATION) {
            return;
          }

          set({ isLoading: true, error: null });

          try {
            const response = await fetch("/api/v1/credit/balance");
            if (!response.ok) {
              throw new Error("Failed to fetch balance");
            }

            const { data } = await response.json();
            set({
              balance: data,
              isLoading: false,
              lastFetchedAt: Date.now(),
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isLoading: false,
            });
          }
        },

        // 使缓存失效
        invalidate: () => set({ lastFetchedAt: null }),

        // 重置状态（登出时调用）
        reset: () =>
          set({
            balance: null,
            isLoading: false,
            error: null,
            lastFetchedAt: null,
          }),
      }),
      {
        name: "credits-storage",
        partialize: (state) => ({
          balance: state.balance,
          lastFetchedAt: state.lastFetchedAt,
        }),
      }
    ),
    { name: "CreditsStore" }
  )
);

// ============================================
// React Hooks
// ============================================

/** 获取积分余额（自动获取） */
export function useCredits() {
  const { balance, isLoading, error, fetchBalance, optimisticFreeze, optimisticRelease, invalidate } = useCreditsStore();

  // 自动获取
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, isLoading, error, refetch: fetchBalance, optimisticFreeze, optimisticRelease, invalidate };
}

/** 获取可用积分数量 */
export function useAvailableCredits(): number {
  return useCreditsStore((state) => state.balance?.availableCredits ?? 0);
}

/** 检查积分是否足够 */
export function useHasEnoughCredits(required: number): boolean {
  const available = useAvailableCredits();
  return available >= required;
}
