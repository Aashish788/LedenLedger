/**
 * Subscription Check Utility
 * Simple subscription verification for web login
 */

import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionStatus {
  isPremium: boolean;
  tier: "free" | "basic" | "premium" | "enterprise";
  expiresAt: string | null;
  platform: string | null;
  isExpired: boolean;
}

/**
 * Check if user has active premium subscription
 * Returns subscription status with expiration check
 */
export async function checkSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  try {
    // ✅ FIX: Only select columns that actually exist in database
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("is_premium, subscription_expires_at")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Subscription check error:", error);
      // Fail-safe: deny access on error
      return {
        isPremium: false,
        tier: "free",
        expiresAt: null,
        platform: null,
        isExpired: false,
      };
    }

    // Check if subscription has expired
    const isExpired = data.subscription_expires_at
      ? new Date(data.subscription_expires_at) < new Date()
      : false;

    return {
      isPremium: data.is_premium && !isExpired,
      tier: data.is_premium ? "premium" : "free", // ✅ Derive tier from is_premium
      expiresAt: data.subscription_expires_at,
      platform: null, // ✅ Not stored in DB yet
      isExpired,
    };
  } catch (error) {
    console.error("Unexpected error checking subscription:", error);
    // Fail-safe: deny access on error
    return {
      isPremium: false,
      tier: "free",
      expiresAt: null,
      platform: null,
      isExpired: false,
    };
  }
}

/**
 * Verify subscription and update last_verified_at timestamp
 */
export async function verifyAndUpdateSubscription(
  userId: string
): Promise<boolean> {
  const status = await checkSubscriptionStatus(userId);

  // Update last verification timestamp
  await (supabase as any)
    .from("profiles")
    .update({ last_subscription_verified_at: new Date().toISOString() })
    .eq("id", userId);

  return status.isPremium;
}
