import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.3.1';
import { COACHING_PRICE_ID } from '../../shared/stripeConfig.ts';

Deno.serve(async (req) => {
  try {
    console.log("bookCoachingSession invoked at", new Date().toISOString());
    const base44 = createClientFromRequest(req);

    // Booking is done from the signed-in booking page; an anonymous caller must not
    // be able to redeem a paid session or put events on the coach's calendar.
    let caller = null;
    try {
      caller = await base44.auth.me();
    } catch (e) {
      caller = null;
    }
    if (!caller) return Response.json({ error: 'Please sign in to book a coaching session.' }, { status: 401 });

    const { session_id, slot_start, slot_end, name, email, tier } = await req.json();

    if (!session_id || !slot_start || !slot_end || !name || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify Stripe payment was completed
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const stripeSession = await stripe.checkout.sessions.retrieve(session_id);
    if (stripeSession.payment_status !== 'paid') {
      return Response.json({ error: 'Payment not completed. Please complete your purchase first.' }, { status: 403 });
    }

    // Verify this checkout is actually a paid one-time coaching purchase (not a
    // subscription checkout or some other product) — otherwise a paid subscription
    // session could be redeemed to book a free coaching slot.
    if (stripeSession.mode !== 'payment') {
      return Response.json({ error: 'This checkout is not valid for booking a coaching session.' }, { status: 400 });
    }
    const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
    const isCoaching = lineItems.data.some((li) => li.price?.id === COACHING_PRICE_ID);
    if (!isCoaching) {
      return Response.json({ error: 'This payment was not for a coaching session.' }, { status: 400 });
    }

    // Server-side booking rules. The client picks a slot from
    // getCalendarAvailability (9am–6pm coach time, 60-minute sessions, starting
    // at least 24h out); nothing but a matching slot may reach the calendar.
    const SESSION_MINUTES = 60;
    const LEAD_TIME_MS = 24 * 60 * 60 * 1000;
    const BOOKING_HORIZON_MS = 15 * 24 * 60 * 60 * 1000;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const slotStartMs = Date.parse(slot_start);
    const slotEndMs = Date.parse(slot_end);
    if (Number.isNaN(slotStartMs) || Number.isNaN(slotEndMs)) {
      return Response.json({ error: 'Invalid session time.' }, { status: 400 });
    }
    if (slotEndMs - slotStartMs !== SESSION_MINUTES * 60000) {
      return Response.json({ error: 'Coaching sessions are 60 minutes long.' }, { status: 400 });
    }
    if (slotStartMs < Date.now() + LEAD_TIME_MS) {
      return Response.json({ error: 'Sessions must be booked at least 24 hours in advance.' }, { status: 400 });
    }
    if (slotStartMs > Date.now() + BOOKING_HORIZON_MS) {
      return Response.json({ error: 'Sessions can only be booked within the next 14 days.' }, { status: 400 });
    }
    const cleanEmail = String(email || '').trim();
    if (cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) {
      return Response.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }
    const cleanName = String(name || '').trim().slice(0, 100);
    if (!cleanName) {
      return Response.json({ error: 'Please provide your name.' }, { status: 400 });
    }
    const cleanTier = String(tier || 'Coaching Session').trim().slice(0, 60) || 'Coaching Session';

    // Prevent session replay: a paid checkout session may only be redeemed once.
    // Stripe metadata is a last-write-wins API with no precondition, so a
    // read-then-write claim is racy. Instead the claim is an atomic conditional
    // update on the redemption record created for this checkout: it only matches
    // a record still in 'pending', so exactly one concurrent caller can flip it.
    const redemptions = () => base44.asServiceRole.entities.BookingRedemption;
    const claimToken = crypto.randomUUID();

    const claimRedemption = async (sessionId: string) => {
      let records = await redemptions().filter({ checkout_session_id: sessionId });
      if (records.length === 0) {
        // Checkout created before redemption records existed
        await redemptions().create({ checkout_session_id: sessionId, status: 'pending' });
        records = await redemptions().filter({ checkout_session_id: sessionId });
      }
      const target = [...records].sort(
        (a: any, b: any) =>
          new Date(a.created_date).getTime() - new Date(b.created_date).getTime() ||
          String(a.id).localeCompare(String(b.id))
      )[0];
      const result = await redemptions().updateMany(
        { id: target.id, status: 'pending' },
        { $set: { status: 'claimed', claim_token: claimToken, claimed_at: new Date().toISOString() } }
      );
      return result?.updated === 1 ? target.id : null;
    };

    const redemptionId = await claimRedemption(session_id);
    if (!redemptionId) {
      return Response.json({ error: 'This payment has already been used to book a session.' }, { status: 409 });
    }

    const releaseSession = async () => {
      try {
        await redemptions().updateMany(
          { id: redemptionId, status: 'claimed', claim_token: claimToken },
          { $set: { status: 'pending', claim_token: null, claimed_at: null } }
        );
      } catch (e) { console.error('Redemption release failed:', e); }
    };

    // Get Google Calendar connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // Get coach's timezone
    let coachTimezone = 'America/Los_Angeles';
    try {
      const calRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList/primary', { headers: authHeader });
      if (calRes.ok) {
        const calData = await calRes.json();
        coachTimezone = calData.timeZone || coachTimezone;
      }
    } catch (e) {
      console.error('Timezone fetch error:', e);
    }

    // The slot must land on a real bookable boundary: on the hour, between 9am
    // and 6pm in the coach's timezone — exactly what availability offers.
    const slotTimeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: coachTimezone, hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date(slotStartMs));
    const slotHour = parseInt(slotTimeParts.find((p) => p.type === 'hour')?.value || '-1', 10) % 24;
    const slotMinute = parseInt(slotTimeParts.find((p) => p.type === 'minute')?.value || '-1', 10);
    if (slotMinute !== 0 || slotHour < 9 || slotHour >= 18) {
      await releaseSession();
      return Response.json({ error: 'That time is not a bookable coaching slot.' }, { status: 400 });
    }

    // Re-check availability to prevent double booking
    const slotStart = new Date(slotStartMs);
    const slotEnd = new Date(slotEndMs);
    const freeBusyRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        timeMin: new Date(slotStart.getTime() - 60000).toISOString(),
        timeMax: new Date(slotEnd.getTime() + 60000).toISOString(),
        items: [{ id: 'primary' }]
      })
    });
    const freeBusyData = await freeBusyRes.json();
    const busyTimes = freeBusyData.calendars?.primary?.busy || [];
    if (busyTimes.length > 0) {
      await releaseSession(); // let the user retry a different slot with the same payment
      return Response.json({ error: 'This time slot was just booked. Please select another time.' }, { status: 409 });
    }

    // Create calendar event with Google Meet conference data
    const event = {
      summary: `Coaching Session: ${cleanTier}`,
      description: `Coaching session with ${cleanName} (${cleanEmail})\n\nBooked via Under Par Mindset`,
      start: { dateTime: slotStart.toISOString(), timeZone: coachTimezone },
      end: { dateTime: slotEnd.toISOString(), timeZone: coachTimezone },
      attendees: [{ email: cleanEmail }],
      conferenceData: {
        createRequest: {
          requestId: `coaching-${session_id}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const createRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify(event)
    });

    if (!createRes.ok) {
      const errData = await createRes.json();
      console.error('Calendar create error:', errData);
      await releaseSession(); // free the session so the user can retry without paying again
      return Response.json({ error: 'Failed to create calendar event' }, { status: 500 });
    }

    const createdEvent = await createRes.json();

    // Booking is real — close the claim out so this session can never be reused.
    try {
      await redemptions().updateMany(
        { id: redemptionId, claim_token: claimToken },
        { $set: { status: 'booked', booked_at: new Date().toISOString(), calendar_event_id: createdEvent.id, booking_email: cleanEmail } }
      );
    } catch (e) { console.error('Failed to finalize redemption:', e); }

    // Get Meet link — conference data may be pending right after creation
    let meetLink = createdEvent.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;
    if (!meetLink) {
      await new Promise(r => setTimeout(r, 2000));
      const fetchRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${createdEvent.id}`, { headers: authHeader });
      if (fetchRes.ok) {
        const fetchedEvent = await fetchRes.json();
        meetLink = fetchedEvent.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;
      }
    }

    return Response.json({
      meet_link: meetLink,
      event_id: createdEvent.id,
      calendar_link: createdEvent.htmlLink,
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      timezone: coachTimezone
    });
  } catch (error) {
    console.error('Booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});