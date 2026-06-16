import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Flame, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getTodayPrompt } from "@/lib/calculations";

export default function Journal() {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayPrompt = getTodayPrompt();

  const { data: entries = [] } = useQuery({
    queryKey: ["journals"],
    queryFn: () => base44.entities.JournalEntry.list("-entry_date", 30),
  });

  const todayEntry = entries.find(e => e.entry_date === today);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (todayEntry) setText(todayEntry.entry_text || "");
  }, [todayEntry]);

  // Journal streak
  const streak = (() => {
    let count = 0;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const sorted = [...entries].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(todayDate);
      expected.setDate(expected.getDate() - i);
      const entryDate = new Date(sorted[i].entry_date);
      entryDate.setHours(0, 0, 0, 0);
      if (entryDate.getTime() === expected.getTime()) count++;
      else if (i === 0) {
        const yesterday = new Date(todayDate);
        yesterday.setDate(yesterday.getDate() - 1);
        if (entryDate.getTime() === yesterday.getTime()) count++;
        else break;
      } else break;
    }
    return count;
  })();

  const saveEntry = async () => {
    if (!text.trim()) return;
    setSaving(true);
    if (todayEntry) {
      await base44.entities.JournalEntry.update(todayEntry.id, { entry_text: text.trim() });
    } else {
      await base44.entities.JournalEntry.create({
        entry_date: today,
        prompt: todayPrompt,
        entry_text: text.trim(),
      });
    }
    queryClient.invalidateQueries({ queryKey: ["journals"] });
    toast.success("Journal entry saved ✍️");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Journal</h1>
        <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
          <Flame className="w-4 h-4 text-accent" /> {streak}-day journal streak
        </p>
      </div>

      {/* Today's prompt */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Today's Prompt</p>
        <p className="text-sm font-medium text-foreground leading-relaxed">{todayPrompt}</p>
      </div>

      {/* Entry */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your thoughts..."
          rows={8}
          className="text-base leading-relaxed"
        />
        <Button onClick={saveEntry} disabled={saving || !text.trim()} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-1.5" />{saving ? "Saving..." : todayEntry ? "Update Entry" : "Save Entry"}
        </Button>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Recent Entries</h2>
          <div className="space-y-3">
            {entries.filter(e => e.entry_date !== today).slice(0, 6).map((entry) => (
              <div key={entry.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-primary">{format(new Date(entry.entry_date), "MMM d, yyyy")}</span>
                  <PenLine className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                {entry.prompt && <p className="text-[11px] text-accent font-medium mb-1 italic">{entry.prompt}</p>}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {entry.entry_text?.length > 90 ? entry.entry_text.slice(0, 90) + "..." : entry.entry_text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}