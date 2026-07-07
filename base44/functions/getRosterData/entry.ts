import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.user_type !== 'coach' && user.user_type !== 'parent') {
      return Response.json({ error: 'Only coaches and parents can access the roster' }, { status: 403 });
    }

    const playerIds = user.linked_player_ids || [];
    if (playerIds.length === 0) {
      return Response.json({ players: [] });
    }

    // Fetch player user records
    const allUsers = await base44.asServiceRole.entities.User.list();
    const players = allUsers.filter((u) => playerIds.includes(u.id));

    // Fetch rounds and reports for linked players
    const allRounds = await base44.asServiceRole.entities.Round.list("-date", 500);
    const allReports = await base44.asServiceRole.entities.FocusReport.list("-report_date", 500);

    const playerData = players.map((player) => {
      const rounds = allRounds.filter((r) => r.created_by_id === player.id);
      const reports = allReports.filter((r) => r.created_by_id === player.id);
      const submitted = reports.filter((r) => r.submitted);

      const avgScore = rounds.length > 0
        ? (rounds.reduce((a, r) => a + (r.total_score || 0), 0) / rounds.length).toFixed(1)
        : null;

      // Streak calculation
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sorted = [...submitted].sort((a, b) => new Date(b.report_date) - new Date(a.report_date));
      for (let i = 0; i < sorted.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        const d = new Date(sorted[i].report_date);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() === expected.getTime()) streak++;
        else if (i === 0) {
          const y = new Date(today);
          y.setDate(y.getDate() - 1);
          if (d.getTime() === y.getTime()) streak++;
          else break;
        } else break;
      }

      return {
        id: player.id,
        first_name: player.first_name,
        full_name: player.full_name,
        email: player.email,
        age: player.age,
        coaching_goal: player.coaching_goal,
        rounds: rounds.length,
        avgScore,
        lastRound: rounds[0] || null,
        streak,
      };
    });

    return Response.json({ players: playerData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});