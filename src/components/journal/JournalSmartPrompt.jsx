import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, RefreshCw } from "lucide-react";
import { getTodayPrompt } from "@/lib/calculations";

export default function JournalSmartPrompt({ entries, onPrompt }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const fallbackPrompt = getTodayPrompt();

  const generatePrompt = async () => {
    setLoading(true);
    try {
      const [progress, modules] = await Promise.all([
        base44.entities.ModuleProgress.list("-completed_date", 50),
        base44.entities.GymModule.list("order", 100),
      ]);

      const completedModules = progress
        .filter(p => p.completed)
        .map(p => modules.find(m => m.id === p.module_id))
        .filter(Boolean)
        .slice(-5)
        .map(m => `${m.title} — ${m.category}, Week ${m.week_number}`);

      const recentEntries = entries
        .slice(0, 5)
        .map(e => ({
          date: e.entry_date,
          prompt: e.prompt,
          text: (e.entry_text || "").slice(0, 300),
        }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a mental performance coach for junior golfers using the "Under Par Mindset" program. Generate ONE personalized journaling prompt for today.

Context about this golfer:

Recent journal entries (most recent first):
${recentEntries.length ? JSON.stringify(recentEntries, null, 2) : "No previous entries yet."}

Mental gym modules completed (most recent):
${completedModules.length ? JSON.stringify(completedModules, null, 2) : "No modules completed yet."}

The 5 mental pillars trained in the program are: Focus, Confidence, Composure, Commitment, and Resilience.

Guidelines:
- Write a single journaling prompt (1-2 sentences max)
- Make it specific and personal based on their history
- If they've been working on a particular pillar, connect to it
- Help them reflect on their mental game, recent rounds, or training
- Don't mention "entries" or "modules" — just ask a thoughtful question
- Keep it encouraging and age-appropriate for a junior golfer

Return only the prompt text.`,
        response_json_schema: {
          type: "object",
          properties: {
            prompt: { type: "string" },
          },
        },
      });

      const finalPrompt = response.prompt || fallbackPrompt;
      setPrompt(finalPrompt);
      onPrompt?.(finalPrompt);
    } catch {
      setPrompt(fallbackPrompt);
      onPrompt?.(fallbackPrompt);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entries.length === 0) {
      setPrompt(fallbackPrompt);
      onPrompt?.(fallbackPrompt);
      setLoading(false);
      return;
    }
    generatePrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  return (
    <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">AI-Powered Prompt</p>
        </div>
        <button
          onClick={generatePrompt}
          disabled={loading}
          className="p-1 hover:bg-accent/10 rounded-md transition-colors disabled:opacity-50"
          title="Generate a new prompt"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-accent ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground italic">Crafting your personalized prompt…</p>
      ) : (
        <p className="text-sm font-medium text-foreground leading-relaxed">{prompt}</p>
      )}
    </div>
  );
}