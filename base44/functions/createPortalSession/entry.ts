import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.3.1';
import { ALLOWED_ORIGINS } from '../../shared/stripeConfig.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    // Only honor a client-supplied Origin if it matches the app's known domains;
    // otherwise fall back to the app's published domain. Prevents open redirect.
    const requestOrigin = req.headers.get('origin');
    const origin = (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin))
      ? requestOrigin
      : ALLOWED_ORIGINS[0];

    let user;
    try {
      user = await base44.auth.me();
    } catch (e) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!user?.stripe_customer_id) {
      return Response.json({ error: 'No active subscription found. Subscribe to a plan first.' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${origin}/billing`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});