"use client";

// ============================================
// Avatar Fallback Component
// ============================================

import { cn } from "@/components/ui";

interface AvatarFallbackProps {
  name?: string | null;
  email?: string;
  className?: string;
}

// 预定义主题色数组
const colors = [
  "hsl(var(--primary))",          // 主题色
  "hsl(280, 65%, 60%)",            // 紫色
  "hsl(200, 65%, 55%)",            // 蓝色
  "hsl(150, 65%, 45%)",            // 绿色
  "hsl(30, 85%, 55%)",             // 橙色
  "hsl(340, 75%, 55%)",            // 粉色
  "hsl(180, 60%, 50%)",            // 青色
];

/**
 * 获取首字母
 */
function getInitial(name?: string | null, email?: string): string {
  if (name) {
    return name.charAt(0).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return "?";
}

/**
 * 根据用户名生成背景色
 */
function getBackgroundColor(name?: string | null, email?: string): string {
  const key = name || email || "?";
  const index = key.charCodeAt(0) % colors.length;
  return colors[index];
}

export function AvatarFallback({ name, email, className }: AvatarFallbackProps) {
  const initial = getInitial(name, email);
  const backgroundColor = getBackgroundColor(name, email);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-white font-semibold",
        "bg-gradient-to-br from-primary to-primary/80",
        className
      )}
      style={{ backgroundColor }}
    >
      {initial}
    </div>
  );
}
