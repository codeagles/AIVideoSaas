/**
 * ResultPanelWrapper Component
 *
 * 结果面板容器组件，用于已登录用户
 *
 * 功能：
 * - 显示生成中的任务
 * - 展示已完成的视频结果
 * - 提供重新生成入口
 */

"use client";

import type { Video } from "@/db";
import { ResultPanel } from "./result-panel";

export interface ResultPanelWrapperProps {
  /**
   * 当前视频列表
   */
  currentVideos?: Video[];

  /**
   * 正在生成的视频 ID 列表
   */
  generatingIds?: string[];

  /**
   * 重新生成的回调
   */
  onRegenerate?: () => void;

  /**
   * 删除视频的回调
   */
  onDelete?: (uuid: string) => void;

  /**
   * 重试失败视频的回调
   */
  onRetry?: (uuid: string) => void;

  /**
   * 额外的 CSS 类名
   */
  className?: string;
}

export function ResultPanelWrapper({
  currentVideos = [],
  generatingIds = [],
  onRegenerate,
  onDelete,
  onRetry,
  className,
}: ResultPanelWrapperProps) {
  return (
    <ResultPanel
      currentVideos={currentVideos}
      generatingIds={generatingIds}
      onRegenerate={onRegenerate}
      onDelete={onDelete}
      onRetry={onRetry}
      className={className}
    />
  );
}

export default ResultPanelWrapper;
