import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) return Response.json({ error: 'Email and role are required' }, { status: 400 });
    if (role !== 'parent' && role !== 'coach') return Response.json({ error: 'Role must be parent or coach' }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();
    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail) ||
      normalizedEmail === (user.email || '').toLowerCase()
    ) {
      return Response.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    // Rate limit: a player may send a limited number of invitations per day, so
    // the app's invite mail can never be used to email arbitrary addresses at scale.
    const INVITES_PER_DAY = 10;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentInvites = await base44.asServiceRole.entities.PlayerConnection.filter({
      player_id: user.id,
      created_date: { $gte: since }
    });
    if (recentInvites.length >= INVITES_PER_DAY) {
      return Response.json(
        { error: 'You have reached the daily limit for invitations. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    // Check if connection already exists
    const existing = await base44.asServiceRole.entities.PlayerConnection.filter({
      player_id: user.id,
      invited_email: normalizedEmail
    });

    if (existing.length > 0) {
      return Response.json({ error: 'You have already invited this person' }, { status: 400 });
    }

    // Create connection record
    await base44.asServiceRole.entities.PlayerConnection.create({
      player_id: user.id,
      player_name: user.first_name || user.full_name || 'Player',
      invited_email: normalizedEmail,
      role,
      status: 'pending'
    });

    // Try to invite the user (may already have an account)
    try {
      await base44.users.inviteUser(normalizedEmail, 'user');
    } catch (e) {
      // User may already exist — connection will auto-link when they log in and set up
      console.log('Invite result (may be expected if user exists):', e.message);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});