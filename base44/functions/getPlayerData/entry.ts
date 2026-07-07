import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.user_type !== 'coach' && user.user_type !== 'parent') {
      return Response.json({ error: 'Only coaches and parents can access player data' }, { status: 403 });
    }

    const body = await req.json();
    const { playerId } = body;

    if (!playerId) return Response.json({ error: 'playerId required' }, { status: 400 });

    const linkedPlayerIds = user.linked_player_ids || [];
    if (!linkedPlayerIds.includes(playerId)) {
      return Response.json({ error: 'You do not have access to this player' }, { status: 403 });
    }

    // Fetch player user record
    const allUsers = await base44.asServiceRole.entities.User.list();
    const player = allUsers.find((u) => u.id === playerId);

    // Fetch player's data
    const allRounds = await base44.asServiceRole.entities.Round.list("-date", 500);
    const rounds = allRounds.filter((r) => r.created_by_id === playerId);

    const allReports = await base44.asServiceRole.entities.FocusReport.list("-report_date", 500);
    const reports = allReports.filter((r) => r.created_by_id === playerId);

    const allGoals = await base44.asServiceRole.entities.Goal.list("-created_date", 500);
    const goals = allGoals.filter((g) => g.created_by_id === playerId);

    const allJournals = await base44.asServiceRole.entities.JournalEntry.list("-entry_date", 500);
    const journals = allJournals.filter((j) => j.created_by_id === playerId);

    const allProgress = await base44.asServiceRole.entities.ModuleProgress.list("-created_date", 500);
    const moduleProgress = allProgress.filter((p) => p.created_by_id === playerId);

    return Response.json({
      player,
      rounds,
      reports,
      goals,
      journals,
      moduleProgress,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});