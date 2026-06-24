import { useState } from "react";
import { Check, Flame, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import PastReportDialog from "@/components/focus/PastReportDialog";

export default function PlayerWinTheDay({ reports }) {
  const [viewingReport, setViewingReport] = useState(null);

  const submitted = reports
    .filter((r) => r.submitted)
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date));

  const totalSubmitted = submitted.length;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg flex items-center gap-2">
          <Flame className="w-5 h-5 text-accent" /> Win The Day History
        </h2>
        <span className="text-sm font-semibold text-muted-foreground">
          {totalSubmitted} days won
        </span>
      </div>

      {submitted.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-2">
          No Win The Day entries submitted yet.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {submitted.map((r) => {
            const affirmations = [r.affirmation_1, r.affirmation_2, r.affirmation_3, ...(r.extra_affirmations || [])].filter(Boolean);
            const gratitude = [r.gratitude_1, r.gratitude_2, r.gratitude_3, ...(r.extra_gratitude || [])].filter(Boolean);
            return (
              <button
                key={r.id}
                onClick={() => setViewingReport(r)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors text-left border border-transparent hover:border-primary/15"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{format(parseISO(r.report_date), "EEEE, MMM d")}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {affirmations.length} affirmations · {gratitude.length} gratitude
                    {r.why_win ? " · why-win ✓" : ""}
                  </p>
                </div>
                <Calendar className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      <PastReportDialog report={viewingReport} onClose={() => setViewingReport(null)} />
    </div>
  );
}