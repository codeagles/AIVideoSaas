"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { creem } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import * as Icons from "@/components/ui/icons";
import { toast } from "sonner";

interface CreemSubscriptionCardProps {
  dict: Record<string, string>;
}

export function CreemSubscriptionCard({ dict }: CreemSubscriptionCardProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [planLabel, setPlanLabel] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    creem
      .hasAccessGranted()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Creem access check failed:", error);
          return;
        }

        const subscription =
          data && "subscription" in data ? data.subscription : undefined;
        setHasAccess(!!data?.hasAccessGranted);
        setPlanLabel(subscription?.productId ?? null);
        setEndsAt(
          subscription?.periodEnd ? new Date(subscription.periodEnd) : null
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handlePortal = () => {
    startTransition(async () => {
      const { data, error } = await creem.createPortal();
      if (error) {
        toast.error("Portal error", {
          description: error.message ?? "Failed to open customer portal.",
        });
        return;
      }

      if (data && "url" in data && data.url) {
        window.location.href = data.url;
        return;
      }

      toast.error("Portal error", {
        description: "Missing portal URL from Creem.",
      });
    });
  };

  const content = hasAccess && planLabel && endsAt
    ? dict.subscriptionInfo
        .replace("{plan}", planLabel)
        .replace("{date}", endsAt.toLocaleDateString())
    : dict.noSubscription;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <p dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {hasAccess ? (
          <Button onClick={handlePortal} disabled={isPending || isLoading}>
            {dict.manage_subscription}
          </Button>
        ) : (
          <Button asChild>
            <Link href="/pricing">{dict.upgrade}</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
