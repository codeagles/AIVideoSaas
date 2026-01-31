"use client";

// ============================================
// Creation Grid Component
// ============================================

import { cn } from "@/components/ui";

interface CreationGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive grid for video cards
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3-4 columns based on screen width
 */
export function CreationGrid({ children, className }: CreationGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        "sm:grid-cols-2",
        "lg:grid-cols-3",
        "xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
