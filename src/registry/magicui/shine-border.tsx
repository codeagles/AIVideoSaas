"use client";

import { cn } from "@/lib/utils";

interface ShineBorderProps {
  shineColor?: string | string[];
  borderWidth?: number;
  duration?: number;
  className?: string;
}

export function ShineBorder({
  shineColor = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  borderWidth = 2,
  duration = 14,
  className,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          "--shine-color-a": shineColor[0],
          "--shine-color-b": shineColor[1] || shineColor[0],
          "--shine-color-c": shineColor[2] || shineColor[0],
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 z-10",
        "rounded-[inherit]",
        className
      )}
    >
      <div
        className="absolute inset-[-100%] w-[50%]"
        style={{
          backgroundImage: `linear-gradient(
            115deg,
            transparent 0%,
            var(--shine-color-a) 40%,
            var(--shine-color-b) 50%,
            var(--shine-color-c) 60%,
            transparent 100%
          )`,
          filter: "blur(4px)",
          animation: `shine var(--duration) linear infinite`,
        }}
      />
      <div
        className="absolute inset-[-100%] w-[50%]"
        style={{
          backgroundImage: `linear-gradient(
            115deg,
            transparent 0%,
            var(--shine-color-a) 40%,
            var(--shine-color-b) 50%,
            var(--shine-color-c) 60%,
            transparent 100%
          )`,
          animation: `shine var(--duration) linear infinite`,
        }}
      />
    </div>
  );
}
