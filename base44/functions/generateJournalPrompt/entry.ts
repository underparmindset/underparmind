import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Generates one personalized journaling prompt for the signed-in player.
// The model call runs server-side; the client only receives the prompt text.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let progress = [];
    let modules = [];
    let entries = [];
    try {
      const [progressRes, modulesRes, entriesRes] = await Promise.all([
        base44.entities.ModuleProgress.list('-completed_date', 50),
        base44.entities.GymModule.list('order', 100),
        base44.entities.JournalEntry.list('-entry_date', 5),
      ]);
      progress = progressRes || [];
      modules = modulesRes || [];
      entries = entriesRes || [];
    } catch (e) {
      console.error('Journal prompt: data load failed:', e.message);
      return Response.json({ prompt: null });
    }

    const completedModules = progress
      .filter((p) => p.completed)
      .map((p) => modules.find((m) => m.id === p.module_id))
      .filter(Boolean)
      .slice(-5)
      .map((m) => `${m.title} — ${m.category}, Week ${m.week_number}`);

    const recentEntries = entries.slice(0, 5).map((e) => ({
      date: e.entry_date,
      prompt: e.prompt,
      text: (e.entry_text || '').slice(0, 300),
    }));

    const prompt = `You are a mental performance coach for junior golfers using the "Under Par Mindset" program. Generate ONE personalized journaling prompt for today.

Context about this golfer:

Recent journal entries (most recent first):
${recentEntries.length ? JSON.stringify(recentEntries, null, 2) : 'No previous entries yet.'}

Mental gym modules completed (most recent):
${completedModules.length ? JSON.stringify(completedModules, null, 2) : 'No modules completed yet.'}

The 5 mental pillars trained in the program are: Focus, Confidence, Composure, Commitment, and Resilience.

Guidelines:
- Write a single journaling prompt (1-2 sentences max)
- Make it specific and personal based on their history
- If they've been working on a particular pillar, connect to it
- Help them reflect on their mental game, recent rounds, or training
- Don't mention "entries" or "modules" — just ask a thoughtful question
- Keep it encouraging and age-appropriate for a junior golfer

Return only the prompt text.`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: { prompt: { type: 'string' } },
      },
    });

    return Response.json({ prompt: response?.prompt || null });
  } catch (error) {
    console.error('Journal prompt error:', error);
    return Response.json({ prompt: null });
  }
});