import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotepadText, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const EMPTY_NOTES = {
  best_shot: "",
  turning_point_hole: "",
  turning_point_dir: "",
  turning_point_note: "",
  facts: ["", "", ""],
  lesson: "",
  no_insults: false,
  round_notes: "",
};

export default function RoundNotes({ value, onChange }) {
  const set = (field, v) => onChange({ ...value, [field]: v });
  const setFact = (idx, v) =>
    onChange({ ...value, facts: value.facts.map((f, i) => (i === idx ? v : f)) });

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-5">
      <div>
        <h2 className="font-display font-bold text-lg flex items-center gap-2">
          <NotepadText className="w-5 h-5 text-primary" /> Round Notes
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Two minutes, mostly taps. What went well comes first.
        </p>
      </div>

      {/* Best shot */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Best shot of the day</label>
        <Textarea
          value={value.best_shot}
          onChange={(e) => set("best_shot", e.target.value.slice(0, 140))}
          rows={2}
          placeholder="e.g. 7-iron to 10 feet on 14 after a bad drive"
        />
        <p className="text-[11px] text-muted-foreground text-right">
          {value.best_shot.length}/140
        </p>
      </div>

      {/* Turning point */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Where did the round turn?</label>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={value.turning_point_hole}
            onValueChange={(v) => set("turning_point_hole", v)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Hole" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 18 }, (_, i) => i + 1).map((h) => (
                <SelectItem key={h} value={String(h)}>
                  Hole {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => set("turning_point_dir", value.turning_point_dir === "better" ? "" : "better")}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5",
              value.turning_point_dir === "better"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            )}
          >
            <TrendingUp className="w-4 h-4" /> Better
          </button>
          <button
            type="button"
            onClick={() => set("turning_point_dir", value.turning_point_dir === "worse" ? "" : "worse")}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5",
              value.turning_point_dir === "worse"
                ? "bg-destructive text-destructive-foreground border-destructive"
                : "border-border hover:bg-muted"
            )}
          >
            <TrendingDown className="w-4 h-4" /> Worse
          </button>
        </div>
        <Input
          value={value.turning_point_note}
          onChange={(e) => set("turning_point_note", e.target.value)}
          placeholder="One line: what happened on that hole"
        />
      </div>

      {/* 3 facts · 1 lesson · 0 insults */}
      <div className="space-y-2 pt-1">
        <label className="text-sm font-medium">3 facts · 1 lesson · 0 insults</label>
        <div className="space-y-2">
          {value.facts.map((fact, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <Input
                value={fact}
                onChange={(e) => setFact(i, e.target.value)}
                placeholder={
                  i === 0
                    ? "e.g. Hit 9 greens"
                    : i === 1
                    ? "e.g. Three-putted 6 and 11"
                    : "e.g. Routine held on the last four holes"
                }
              />
            </div>
          ))}
        </div>
        <Textarea
          value={value.lesson}
          onChange={(e) => set("lesson", e.target.value)}
          rows={2}
          className="mt-1"
          placeholder="One lesson from today"
        />
        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id="no-insults"
            checked={value.no_insults}
            onCheckedChange={(v) => set("no_insults", !!v)}
          />
          <label htmlFor="no-insults" className="text-sm text-muted-foreground leading-tight">
            No insults: facts only, no labels about yourself
          </label>
        </div>
      </div>

      {/* Free notes */}
      <div className="space-y-1.5 pt-1">
        <label className="text-sm font-medium">Anything else about the round?</label>
        <Textarea
          value={value.round_notes}
          onChange={(e) => set("round_notes", e.target.value)}
          rows={3}
          placeholder="Conditions, who you played with, what you want to remember next time here"
        />
      </div>
    </div>
  );
}