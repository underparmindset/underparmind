import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.3.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { priceId, tier, mode = 'subscription' } = await req.json();
    if (!priceId) return Response.json({ error: 'Missing priceId' }, { status: 400 });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const origin = req.headers.get('origin') || 'https://app.base44.com';

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
      mode: mode,
      line_items: [{ price: priceId, quantity: 1 }],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      success_url: `${origin}/?checkout=success`,
      cancel_url: mode === 'payment' ? `${origin}/coaching?checkout=cancelled` : `${origin}/pricing?checkout=cancelled`,
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