import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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

    // Date range: next 14 days starting tomorrow
    const now = new Date();
    const timeMin = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const timeMax = new Date(timeMin.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Get free/busy from Google Calendar
    const freeBusyRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: coachTimezone,
        items: [{ id: 'primary' }]
      })
    });
    const freeBusyData = await freeBusyRes.json();
    const busyTimes = (freeBusyData.calendars?.primary?.busy || []).map(b => ({
      start: new Date(b.start).getTime(),
      end: new Date(b.end).getTime()
    }));

    // Generate candidate slots: 9am-6pm, 60-min sessions in coach's timezone
    const SESSION_DURATION = 60;
    const START_HOUR = 9;
    const END_HOUR = 18;
    const dates = [];

    for (let d = 0; d < 14; d++) {
      const dayStart = new Date(timeMin.getTime() + d * 24 * 60 * 60 * 1000);

      // Get the calendar date in coach's timezone
      const dayFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: coachTimezone, year: 'numeric', month: '2-digit', day: '2-digit'
      });
      const parts = dayFormatter.formatToParts(dayStart);
      const map = {};
      parts.forEach(p => { if (p.type !== 'literal') map[p.type] = p.value; });
      const year = parseInt(map.year);
      const month = parseInt(map.month);
      const day = parseInt(map.day);

      const daySlots = [];
      for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        const slotStart = localToUtc(year, month, day, hour, 0, coachTimezone);
        const slotEnd = new Date(slotStart.getTime() + SESSION_DURATION * 60000);

        // Check if slot overlaps with any busy time
        const overlaps = busyTimes.some(b =>
          slotStart.getTime() < b.end && slotEnd.getTime() > b.start
        );

        if (!overlaps) {
          const displayFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: coachTimezone, hour: 'numeric', minute: '2-digit', hour12: true
          });
          daySlots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            display: displayFormatter.format(slotStart)
          });
        }
      }

      if (daySlots.length > 0) {
        const weekdayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: coachTimezone, weekday: 'short' });
        const dayLabelFormatter = new Intl.DateTimeFormat('en-US', { timeZone: coachTimezone, month: 'short', day: 'numeric' });
        const dateValue = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dates.push({
          date: dateValue,
          weekday: weekdayFormatter.format(dayStart),
          dayLabel: dayLabelFormatter.format(dayStart),
          slots: daySlots
        });
      }
    }

    return Response.json({ timezone: coachTimezone, dates });
  } catch (error) {
    console.error('Availability error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper: convert a local wall-clock time in a given timezone to a UTC Date
function localToUtc(year, month, day, hour, minute, timezone) {
  const naive = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  const parts = dtf.formatToParts(naive);
  const map = {};
  parts.forEach(p => { if (p.type !== 'literal') map[p.type] = p.value; });
  const h = parseInt(map.hour) === 24 ? 0 : parseInt(map.hour);
  const asUTC = Date.UTC(parseInt(map.year), parseInt(map.month) - 1, parseInt(map.day), h, parseInt(map.minute), parseInt(map.second || '0'));
  const offset = (naive.getTime() - asUTC) / 60000;
  return new Date(naive.getTime() + offset * 60000);
}