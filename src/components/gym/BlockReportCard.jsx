import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardCheck } from "lucide-react";
import { DAY_SCHEDULE } from "@/lib/gymConfig";
import { cn } from "@/lib/utils";

const PILLARS = DAY_SCHEDULE.map((d) => d.category);

function answerFor(record, prefixes) {
  const responses = record?.responses || [];
  const found = responses.find((r) =>
    prefixes.some((p) => (r.prompt || "").toUpperCase().startsWith(p))
  );
  return (found?.answer || "").trim();
}

function ReportField({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("text-sm leading-snug", value ? "text-foreground" : "text-muted-foreground/60")}>
        {value || "—"}
      </p>
    </div>
  );
}

export default function BlockReportCard({ weekNum = 8, label = "Block 2", modules = [], progress = [] }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const weekModules = modules.filter((m) => m.week_number === weekNum);
  if (weekModules.length === 0) return null;

  const rows = DAY_SCHEDULE.map((dayInfo) => {
    const mod = weekModules.find((m) => m.day_number === dayInfo.day);
    const record = mod ? progress.find((p) => p.module_id === mod.id) : null;
    return {
      dayInfo,
      mod,
      predicted: answerFor(record, ["PREDICT"]),
      result: answerFor(record, ["LOG", "REPORT CARD"]),
      done: !!record?.completed,
    };
  });

  const doneCount = rows.filter((r) => r.done).length;
  const allDone = doneCount === DAY_SCHEDULE.length;

  const lastMod = [...weekModules].sort((a, b) => b.day_number - a.day_number)[0];
  const lastRecord = lastMod ? progress.find((p) => p.module_id === lastMod.id) : null;
  const focus = lastRecord?.block_focus || "";

  const chooseFocus = async (pillar) => {
    if (!lastMod || saving) return;
    setSaving(true);
    try {
      if (lastRecord) {
        await base44.entities.ModuleProgress.update(lastRecord.id, { block_focus: pillar });
      } else {
        await base44.entities.ModuleProgress.create({ module_id: lastMod.id, block_focus: pillar });
      }
      queryClient.invalidateQueries({ queryKey: ["moduleProgress"] });
      toast.success(`Next block focus: ${pillar}`);
    } catch {
      toast.error("Couldn't save your focus. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-display font-bold flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" /> {label} Report Card
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Your last block measured noticing. This one measures doing it under pressure.
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
          {doneCount}/{DAY_SCHEDULE.length} tests
        </span>
      </div>

      {allDone && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          <strong>All five tests finished.</strong> The {label} badge is yours. A “not yet” result
          doesn’t block it — finishing the tests and the repair reps does.
        </div>
      )}

      <div className="space-y-2">
        {rows.map(({ dayInfo, mod, predicted, result, done }) => {
          const Icon = dayInfo.icon;
          return (
            <div
              key={dayInfo.day}
              className="rounded-lg border border-border bg-muted/20 p-3 grid gap-3 md:grid-cols-[140px_1fr_1fr_100px] md:items-start"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{dayInfo.category}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">{dayInfo.label}</p>
                </div>
              </div>
              <ReportField label="Predicted" value={predicted} />
              <ReportField label="Result" value={result} />
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-1 rounded-full h-fit w-fit",
                  done
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {done ? "Complete" : mod ? "Not yet" : "Coming soon"}
              </span>
            </div>
          );
        })}
      </div>

      <div>
        <p className="text-sm font-display font-bold">Next block focus</p>
        <p className="text-xs text-muted-foreground">
          Pick the pillar with your lowest result, or your biggest gap between predicted and
          actual. It gets one extra rep in every session next block.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {PILLARS.map((pillar) => (
            <button
              key={pillar}
              onClick={() => chooseFocus(pillar)}
              disabled={saving}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-60",
                focus === pillar
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent border-border text-muted-foreground hover:border-accent hover:text-accent"
              )}
            >
              {pillar}
            </button>
          ))}
        </div>
        {focus && (
          <p className="text-sm mt-3">
            Next block, you’re working on <strong>{focus}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}