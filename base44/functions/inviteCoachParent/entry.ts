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