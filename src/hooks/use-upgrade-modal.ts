/**
 * Upgrade Modal Hook
 *
 * 全局管理升级弹窗的状态
 * 可以在任意位置触发弹窗打开
 */

import { create } from "zustand";
import { DialogProps } from "@radix-ui/react-dialog";

interface UpgradeModalState {
  isOpen: boolean;
  reason?: "upgrade" | "insufficient_credits" | "expired";
  requiredCredits?: number;
  openModal: (options?: { reason?: UpgradeModalState["reason"]; requiredCredits?: number }) => void;
  closeModal: () => void;
}

export const useUpgradeModal = create<UpgradeModalState>((set) => ({
  isOpen: false,
  reason: undefined,
  requiredCredits: undefined,
  openModal: (options) =>
    set({
      isOpen: true,
      reason: options?.reason || "upgrade",
      requiredCredits: options?.requiredCredits,
    }),
  closeModal: () => set({ isOpen: false, reason: undefined, requiredCredits: undefined }),
}));
