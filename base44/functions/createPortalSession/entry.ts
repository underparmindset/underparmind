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

    // The billing portal is authorized from Stripe itself, never from the app's
    // User record: a customer only counts as this caller's when Stripe says so
    // (metadata.user_id matches, or the customer's email is the caller's verified
    // account email). A tampered stripe_customer_id therefore reaches nothing.
    const callerEmail = String(user.email || '').toLowerCase();
    const belongsToCaller = (customer) => {
      if (!customer || customer.deleted) return false;
      if (customer.metadata?.user_id === user.id) return true;
      const customerEmail = String(customer.email || '').toLowerCase();
      return Boolean(callerEmail) && customerEmail === callerEmail;
    };

    let customerId = null;
    if (user.stripe_customer_id) {
      try {
        const stored = await stripe.customers.retrieve(user.stripe_customer_id);
        if (belongsToCaller(stored)) customerId = stored.id;
        else console.error('Portal: stored customer does not belong to caller', user.id);
      } catch (e) {
        console.error('Portal: stored customer lookup failed:', e.message);
      }
    }

    // Fall back to the caller's own Stripe customer, resolved by their verified email.
    if (!customerId && callerEmail) {
      const list = await stripe.customers.list({ email: user.email, limit: 10 });
      const own = list.data.find((c) => c.metadata?.user_id === user.id) || list.data[0];
      if (belongsToCaller(own)) customerId = own.id;
    }

    if (!customerId) {
      return Response.json({ error: 'No active subscription found. Subscribe to a plan first.' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});