import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CATEGORIES = ['general', 'billing', 'technical', 'account', 'feature_request'];

// Creates a support ticket and sends the requester their confirmation email.
// Both happen server-side: the confirmation always goes to the signed-in user's
// own address, never to an address supplied by the caller.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));

    const subject = String(payload.subject || '').trim().slice(0, 200);
    const message = String(payload.message || '').trim().slice(0, 5000);
    const category = CATEGORIES.includes(payload.category) ? payload.category : 'general';

    if (!subject || !message) {
      return Response.json({ error: 'Subject and message are required.' }, { status: 400 });
    }

    // The support page is behind login, and tickets are only accepted from a
    // signed-in user — otherwise anyone could create unlimited tickets.
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      user = null;
    }
    if (!user) return Response.json({ error: 'Please sign in to contact support.' }, { status: 401 });

    // Cap tickets per person so the form can't be used to flood the inbox.
    const TICKETS_PER_DAY = 10;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recent = await base44.entities.SupportTicket.filter({
      created_by_id: user.id,
      created_date: { $gte: since },
    });
    if (recent.length >= TICKETS_PER_DAY) {
      return Response.json(
        { error: 'You have reached the daily limit for support requests. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    const ticket = await base44.entities.SupportTicket.create({
      subject,
      message,
      category,
      user_email: user?.email || '',
      user_name: user?.first_name || '',
    });

    if (user?.email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `Support Request Received: ${subject}`,
          body: `Hi ${user.first_name || 'there'},\n\nWe've received your support request and our team will get back to you soon.\n\nSubject: ${subject}\nCategory: ${category}\n\nMessage:\n${message}\n\nThanks for reaching out!\nThe Under Par Mindset Team`,
        });
      } catch (emailError) {
        // Non-critical — the ticket is already saved
        console.error('Support confirmation email failed:', emailError.message);
      }
    }

    return Response.json({ id: ticket.id });
  } catch (error) {
    console.error('Support ticket error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});