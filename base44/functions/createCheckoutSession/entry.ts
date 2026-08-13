import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.3.1';
import { ALLOWED_ORIGINS, SUBSCRIPTION_PRICES, COACHING_PRICE_ID } from '../../shared/stripeConfig.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { priceId, tier: clientTier, promoCode } = await req.json();
    if (!priceId) return Response.json({ error: 'Missing priceId' }, { status: 400 });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Derive the checkout mode and entitlement tier from a server-side allowlist
    // keyed by priceId — never trust a client-supplied tier/mode, otherwise an
    // attacker can pay the cheap monthly price and claim the annual entitlement.
    let checkoutMode;
    let tier;
    if (SUBSCRIPTION_PRICES[priceId]) {
      checkoutMode = 'subscription';
      tier = SUBSCRIPTION_PRICES[priceId];
    } else if (priceId === COACHING_PRICE_ID) {
      checkoutMode = 'payment';
      tier = clientTier || 'Coaching Session'; // display label only, not an entitlement
    } else {
      return Response.json({ error: 'Invalid priceId' }, { status: 400 });
    }

    // Only honor a client-supplied Origin if it matches the app's known domains;
    // otherwise fall back to the app's published domain. Prevents open redirect via
    // an attacker-controlled Origin header used for Stripe success/cancel URLs.
    const requestOrigin = req.headers.get('origin');
    const origin = (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin))
      ? requestOrigin
      : ALLOWED_ORIGINS[0];

    // Validate promo code if provided
    let discounts;
    if (promoCode) {
      try {
        const promoCodes = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 });
        if (promoCodes.data.length > 0) {
          discounts = [{ promotion_code: promoCodes.data[0].id }];
        } else {
          // Try as a direct coupon ID
          const coupon = await stripe.coupons.retrieve(promoCode);
          if (coupon && coupon.valid) {
            discounts = [{ coupon: coupon.id }];
          }
        }
      } catch (couponErr) {
        return Response.json({ error: 'Invalid or expired promo code.' }, { status: 400 });
      }
    }

    // Auth is optional — this is a public app, so users may not be logged in
    let customerEmail;
    let userId;
    try {
      const user = await base44.auth.me();
      if (user) {
        customerEmail = user.email;
        userId = user.id;
      }
    } catch (e) {
      // Not logged in — that's ok for public checkout
    }

    const session = await stripe.checkout.sessions.create({
      mode: checkoutMode,
      line_items: [{ price: priceId, quantity: 1 }],
      ...(discounts ? { discounts } : {}),
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      success_url: checkoutMode === 'payment'
        ? `${origin}/booking?checkout=success&session_id={CHECKOUT_SESSION_ID}&tier=${encodeURIComponent(tier || '')}`
        : `${origin}/?checkout=success`,
      cancel_url: checkoutMode === 'payment' ? `${origin}/coaching?checkout=cancelled` : `${origin}/pricing?checkout=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        ...(userId ? { user_id: userId } : {}),
        tier: tier || '',
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});