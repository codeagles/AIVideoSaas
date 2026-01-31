"use client";

// ============================================
// Credit History Component
// ============================================

import { useTranslations } from "next-intl";
import { Video, ShoppingBag, RotateCcw, Settings } from "lucide-react";
import { cn } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import type { CreditTransaction } from "@/lib/types/dashboard";

interface CreditHistoryProps {
  transactions: CreditTransaction[];
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const typeConfig = {
  video_generate: {
    icon: Video,
    label: "Video Gen",
    color: "text-rose-500",
  },
  order_pay: {
    icon: ShoppingBag,
    label: "Purchase",
    color: "text-emerald-500",
  },
  subscription: {
    icon: ShoppingBag,
    label: "Subscription",
    color: "text-emerald-500",
  },
  video_refund: {
    icon: RotateCcw,
    label: "Refund",
    color: "text-emerald-500",
  },
  admin_adjust: {
    icon: Settings,
    label: "Admin Adjust",
    color: "text-muted-foreground",
  },
};

export function CreditHistory({ transactions, hasMore, onLoadMore }: CreditHistoryProps) {
  const t = useTranslations("dashboard.credits");

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No credit history yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("history")}</h3>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.filter(Boolean).map((transaction) => {
                const config = typeConfig[transaction.transType];
                const Icon = config.icon;
                const isPositive = transaction.credits > 0;

                return (
                  <tr key={transaction.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", config.color)} />
                        <span>{t(`types.${transaction.transType}`)}</span>
                      </div>
                      {transaction.remark && (
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                          {transaction.remark}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={cn(
                        "font-medium",
                        isPositive ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {isPositive ? "+" : ""}{transaction.credits}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                      {transaction.balanceAfter}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
          >
            {t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
