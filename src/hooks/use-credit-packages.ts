"use client";

import {
  CREDITS_CONFIG,
  getSubscriptionProducts,
  getOnetimeProducts,
  type CreditPackageConfig,
} from "@/config/credits";

export interface LocalizedPackage extends CreditPackageConfig {
  displayName: string;
  displayDescription: string;
  localizedFeatures: string[];
}

// Dictionary type for credits
export interface CreditsDictionary {
  title?: string;
  buy_credits?: string;
  packages: Record<string, { name: string; description: string }>;
  features: Record<string, string>;
}

/**
 * Get package key from product ID
 * prod_sub_basic -> basic
 * prod_pack_starter -> starter
 */
function getPackageKey(productId: string): string {
  const match = productId.match(/prod_(?:sub|pack)_(\w+)/);
  const rawKey = match?.[1] ?? productId;
  return rawKey.replace(/_(monthly|yearly)$/, "");
}

/**
 * Get localized subscription products
 */
export function getLocalizedSubscriptionPackages(
  dictionary: CreditsDictionary
): LocalizedPackage[] {
  const packages = getSubscriptionProducts();

  return packages.map((pkg: CreditPackageConfig) => ({
    ...pkg,
    displayName: dictionary.packages[getPackageKey(pkg.id)]?.name || pkg.id,
    displayDescription:
      dictionary.packages[getPackageKey(pkg.id)]?.description || "",
    localizedFeatures: (pkg.features || []).map((key: string) => {
      const featureKey = key.replace("credits.features.", "");
      return dictionary.features[featureKey] || key;
    }),
  }));
}

/**
 * Get localized one-time purchase products
 */
export function getLocalizedOnetimePackages(
  dictionary: CreditsDictionary
): LocalizedPackage[] {
  const packages = getOnetimeProducts();

  return packages.map((pkg: CreditPackageConfig) => ({
    ...pkg,
    displayName: dictionary.packages[getPackageKey(pkg.id)]?.name || pkg.id,
    displayDescription:
      dictionary.packages[getPackageKey(pkg.id)]?.description || "",
    localizedFeatures: (pkg.features || []).map((key: string) => {
      const featureKey = key.replace("credits.features.", "");
      return dictionary.features[featureKey] || key;
    }),
  }));
}

/**
 * Check if current user can purchase credit packages
 * Returns true if user has subscription OR if there are packages that allow free users
 */
export function canPurchasePackages(hasSubscription: boolean): boolean {
  if (hasSubscription) {
    return true;
  }
  // Check if any package allows free users
  const packages = getOnetimeProducts();
  return packages.some((pkg) => pkg.allowFreeUser !== false);
}
