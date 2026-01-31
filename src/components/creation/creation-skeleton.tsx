"use client";

// ============================================
// Creation Skeleton Component
// ============================================

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui";

interface CreationSkeletonProps {
  count?: number;
  className?: string;
}

export function CreationSkeleton({ count = 8, className }: CreationSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Thumbnail skeleton */}
          <Skeleton className="aspect-[9/16] w-full" />

          {/* Info skeleton */}
          <div className="p-3 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
