import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Flame, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getTodayPrompt } from "@/lib/calculations";
import JournalSmartPrompt from "@/components/journal/JournalSmartPrompt";

export default function Journal() {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayPrompt = getTodayPrompt();

  const { data: entries = [] } = useQuery({
    queryKey: ["journals"],
    queryFn: () => base44.entities.JournalEntry.list("-entry_date", 30),
  });

  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditingText(entry.entry_text || "");
  };

  const saveEdit = async (entry) => {
    if (!editingText.trim()) return;
    await base44.entities.JournalEntry.update(entry.id, { entry_text: editingText.trim() });
    queryClient.invalidateQueries({ queryKey: ["journals"] });
    toast.success("Entry updated ✍️");
    setEditingId(null);
  };

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
    await base44.entities.JournalEntry.create({
      entry_date: today,
      prompt: aiPrompt || todayPrompt,
      entry_text: text.trim(),
    });
    queryClient.invalidateQueries({ queryKey: ["journals"] });
    toast.success("Journal entry saved ✍️");
    setText("");
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

      {/* AI-powered prompt */}
      <JournalSmartPrompt entries={entries} onPrompt={setAiPrompt} />

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
          <Save className="w-4 h-4 mr-1.5" />{saving ? "Saving..." : "Save Entry"}
        </Button>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Recent Entries</h2>
          <div className="space-y-3">
            {entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-primary">{format(new Date(entry.entry_date), "MMM d, yyyy")}</span>
                  {editingId !== entry.id && (
                    <button onClick={() => startEdit(entry)} className="p-1 hover:bg-muted rounded-md transition-colors" title="Edit entry">
                      <PenLine className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {entry.prompt && <p className="text-[11px] text-accent font-medium mb-1 italic">{entry.prompt}</p>}
                
                {editingId === entry.id ? (
                  <div className="mt-3 space-y-2">
                    <Textarea 
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={5}
                      className="text-sm leading-relaxed"
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => saveEdit(entry)} className="h-8">Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {entry.entry_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}