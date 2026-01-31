"use client";

// ============================================
// Settings Page (Billing Only)
// ============================================

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, IdCard, Calendar } from "lucide-react";
import { useBilling } from "@/hooks/use-billing";
import { AvatarFallback } from "@/components/user/avatar-fallback";
import { BillingList } from "@/components/billing";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface SettingsPageProps {
  locale: string;
  userEmail?: string;
  userId?: string;
}

export function SettingsPage({ locale, userEmail, userId }: SettingsPageProps) {
  const t = useTranslations("dashboard.settings");

  const {
    user,
    invoices,
    hasMore,
    fetchNextPage,
    isLoading,
  } = useBilling();

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const current = observerTarget.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [hasMore, isLoading, fetchNextPage]);

  // Use data from hook if available, otherwise use props
  const displayEmail = user?.email || userEmail;
  const displayUserId = user?.id || userId;
  const joinedDate = user?.createdAt ? new Date(user.createdAt) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </div>

      {/* Account Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <AvatarFallback
              name={displayEmail}
              email={displayEmail}
              className="h-16 w-16 text-xl"
            />

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">{t("account")}</div>
                <h2 className="text-lg font-semibold">{t("account")}</h2>
              </div>

              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t("email")}:</span>
                  <span className="font-medium">{displayEmail}</span>
                </div>

                {/* User ID */}
                {displayUserId && (
                  <div className="flex items-center gap-3 text-sm">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t("userId")}:</span>
                    <span className="font-medium font-mono">{displayUserId}</span>
                  </div>
                )}

                {/* Joined Date */}
                {joinedDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t("joined")}:</span>
                    <span className="font-medium">
                      {formatDistanceToNow(joinedDate, { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <BillingList
        invoices={invoices}
        hasMore={hasMore}
        onLoadMore={() => fetchNextPage()}
      />

      {/* Infinite scroll sentinel */}
      {hasMore && <div ref={observerTarget} className="py-4" />}
    </div>
  );
}
