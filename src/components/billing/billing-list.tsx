"use client";

// ============================================
// Billing List Component
// ============================================

import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import type { Invoice, InvoiceStatus } from "@/lib/types/dashboard";

interface BillingListProps {
  invoices: Invoice[];
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  failed: { label: "Failed", className: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
};

export function BillingList({ invoices, hasMore, onLoadMore }: BillingListProps) {
  const t = useTranslations("dashboard.settings");

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No purchase history yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("billingHistory")}</h3>
      </div>

      {/* List */}
      <div className="border border-border rounded-lg divide-y divide-border">
        {invoices.map((invoice) => {
          const config = statusConfig[invoice.status];
          const totalAmount = `${invoice.currency} ${invoice.amount.toFixed(2)}`;

          return (
            <div key={invoice.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true })}
                    </span>
                    <Badge variant="outline" className={config.className}>
                      {t(`status.${invoice.status}`)}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {invoice.items.map((item, index) => (
                      <span key={index}>
                        {item.description} ({item.quantity})
                      </span>
                    )).join(", ")}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">{totalAmount}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
