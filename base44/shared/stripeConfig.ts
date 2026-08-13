// Shared Stripe configuration used by checkout, portal, webhook, and booking
// backend functions. Keeping this in one place ensures pricing/tier decisions
// are made server-side and consistently across endpoints.

// Only these origins may be used as Stripe redirect targets (success/cancel/return).
export const ALLOWED_ORIGINS = [
  'https://master-mental-golf.base44.app',
];

// Subscription price IDs mapped to the entitlement tier they grant.
// The tier is derived from the priceId server-side — never trusted from the client.
export const SUBSCRIPTION_PRICES: Record<string, string> = {
  'price_1TlyeLRluJwLogLmSM4I8uy8': 'monthly',
  'price_1TlyeKRluJwLogLmVEPJdkPo': 'quarterly',
  'price_1TlyeKRluJwLogLmUivbCGOM': 'annual',
};

// Tiers that are valid subscription entitlements.
export const VALID_TIERS = ['monthly', 'quarterly', 'annual'];

// One-time coaching session price ID.
export const COACHING_PRICE_ID = 'price_1TlyeNRluJwLogLmRLgiY5KB';