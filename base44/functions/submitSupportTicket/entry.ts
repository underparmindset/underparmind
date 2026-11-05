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

    let user = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      // Public app — a ticket without an account is still valid
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