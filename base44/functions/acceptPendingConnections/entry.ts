import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Find pending connections for this user's email
    const pending = await base44.asServiceRole.entities.PlayerConnection.filter({
      invited_email: user.email,
      status: 'pending'
    });

    if (pending.length === 0) {
      return Response.json({ linked: 0, playerIds: [] });
    }

    const playerIds = [];
    for (const conn of pending) {
      await base44.asServiceRole.entities.PlayerConnection.update(conn.id, {
        status: 'accepted',
        coach_parent_id: user.id
      });
      if (conn.player_id) playerIds.push(conn.player_id);
    }

    return Response.json({ linked: pending.length, playerIds });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});