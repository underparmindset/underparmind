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
      const { data } = await base44.functions.invoke("generateJournalPrompt", {});
      const finalPrompt = data?.prompt || fallbackPrompt;
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