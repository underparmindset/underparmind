import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Deep link target for the email button — the app's live domain.
const APP_URL = 'https://app.underparmindset.com';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { type, record_id } = await req.json();
    if (!type || !record_id) {
      return Response.json({ error: 'type and record_id required' }, { status: 400 });
    }

    const svc = base44.asServiceRole;

    let playerId = null;
    let eventTitle = '';
    let eventLine = '';
    let extraLine = '';

    if (type === 'gym') {
      const progress = await svc.entities.ModuleProgress.get(record_id);
      if (!progress || !progress.completed) {
        return Response.json({ ok: true, skipped: 'not a completion event' });
      }
      playerId = progress.created_by_id;
      let mod = null;
      try { mod = await svc.entities.GymModule.get(progress.module_id); } catch (e) { mod = null; }
      const dayNames = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' };
      const weekLabel = mod ? (mod.week_label || ('Week ' + mod.week_number)) : '';
      const dayLabel = mod ? (dayNames[mod.day_number] || ('Day ' + mod.day_number)) : '';
      eventTitle = 'Mental Gym session completed';
      eventLine = mod ? `${weekLabel} · ${dayLabel}: ${mod.title}` : 'A Mental Gym session was completed';
      extraLine = mod ? mod.summary : '';
    } else if (type === 'goal') {
      const goal = await svc.entities.Goal.get(record_id);
      if (!goal) return Response.json({ ok: true, skipped: 'goal not found' });
      playerId = goal.created_by_id;
      const statusLabel = goal.status === 'hit' ? 'Goal achieved' : goal.status === 'missed' ? 'Goal missed' : 'In progress';
      eventTitle = goal.status === 'hit' ? 'Goal achieved' : (goal.status === 'missed' ? 'Goal missed' : 'New goal set');
      eventLine = goal.goal_text;
      extraLine = `${statusLabel} · Horizon: ${goal.horizon}`;
    } else {
      return Response.json({ error: 'Unknown notification type' }, { status: 400 });
    }

    if (!playerId) return Response.json({ ok: true, skipped: 'no player on record' });

    // Player name
    let playerName = 'Your player';
    try {
      const player = await svc.entities.User.get(playerId);
      if (player) playerName = player.first_name || player.full_name || player.email || playerName;
    } catch (e) { console.error('Player lookup failed:', e); }

    // Accepted connections (coach/parent linked to this player)
    const connections = await svc.entities.PlayerConnection.filter({ player_id: playerId, status: 'accepted' });
    const coachIds = connections.map(c => c.coach_parent_id).filter(Boolean);
    if (coachIds.length === 0) {
      return Response.json({ ok: true, sent: 0, reason: 'no connected parents/coaches' });
    }

    const coachLookups = await Promise.allSettled(coachIds.map(id => svc.entities.User.get(id)));
    const recipients = coachLookups
      .filter(r => r.status === 'fulfilled' && r.value && r.value.email)
      .map(r => r.value);

    if (recipients.length === 0) {
      return Response.json({ ok: true, sent: 0, reason: 'recipients not found' });
    }

    const results = await Promise.allSettled(recipients.map(rc =>
      svc.integrations.Core.SendEmail({
        to: rc.email,
        template_name: 'PlayerProgressUpdate',
        variables: {
          player_name: playerName,
          event_title: eventTitle,
          event_line: eventLine,
          extra_line: extraLine,
          cta_label: 'View player dashboard',
          cta_url: `${APP_URL}/player/${playerId}`
        }
      })
    ));
    const sent = results.filter(r => r.status === 'fulfilled').length;
    results.filter(r => r.status === 'rejected').forEach(r => console.error('Email send failed:', r.reason));

    return Response.json({ ok: true, sent, recipients: recipients.length });
  } catch (error) {
    console.error('notifyPlayerUpdate error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}