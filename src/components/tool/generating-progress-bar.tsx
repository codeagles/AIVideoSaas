/**
 * Generating Progress Bar
 *
 * 虚拟进度条组件（无百分比/时间显示）
 * - 无限循环动画
 * - 紫色主题
 */

import { cn } from "@/components/ui";

export function GeneratingProgressBar({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {/* 进度条容器 */}
      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
        {/* 动画进度条 */}
        <div className="h-full bg-purple-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
      </div>

      {/* CSS 动画定义 */}
      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0%;
            opacity: 0.5;
          }
          50% {
            width: 60%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
