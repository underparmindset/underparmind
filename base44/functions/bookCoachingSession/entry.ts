import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.3.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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

    // Re-check availability to prevent double booking
    const slotStart = new Date(slot_start);
    const slotEnd = new Date(slot_end);
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
      return Response.json({ error: 'This time slot was just booked. Please select another time.' }, { status: 409 });
    }

    // Create calendar event with Google Meet conference data
    const event = {
      summary: `Coaching Session: ${tier}`,
      description: `Coaching session with ${name} (${email})\n\nBooked via Under Par Mindset`,
      start: { dateTime: slotStart.toISOString(), timeZone: coachTimezone },
      end: { dateTime: slotEnd.toISOString(), timeZone: coachTimezone },
      attendees: [{ email }],
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
      return Response.json({ error: 'Failed to create calendar event' }, { status: 500 });
    }

    const createdEvent = await createRes.json();

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