import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Flame } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function PastReportDialog({ report, onClose }) {
  const { data: tasks = [] } = useQuery({
    queryKey: ["focusTasks", report?.id],
    queryFn: () =>
      report ? base44.entities.FocusTask.filter({ focus_report_id: report.id }) : [],
    enabled: !!report,
  });

  if (!report) return null;

  const affirmations = [
    report.affirmation_1,
    report.affirmation_2,
    report.affirmation_3,
    ...(report.extra_affirmations || []),
  ].filter(Boolean);

  const gratitude = [
    report.gratitude_1,
    report.gratitude_2,
    report.gratitude_3,
    ...(report.extra_gratitude || []),
  ].filter(Boolean);

  const filledTasks = tasks.filter((t) => t.task_text?.trim());

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {format(parseISO(report.report_date), "EEEE, MMM d")}
            {report.submitted && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Won
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Affirmations */}
          {affirmations.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-primary" /> Affirmations
              </h3>
              <ol className="space-y-1.5 list-decimal list-inside text-sm text-muted-foreground">
                {affirmations.map((a, i) => (
                  <li key={i} className="leading-snug">{a}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Priorities */}
          {filledTasks.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-primary" /> Top Priorities
              </h3>
              <ol className="space-y-1.5 text-sm text-muted-foreground">
                {filledTasks.map((t, i) => (
                  <li key={t.id} className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">{i + 1}.</span>
                    <span className={t.done ? "line-through opacity-60" : ""}>
                      {t.task_text}
                    </span>
                    {t.done && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Gratitude */}
          {gratitude.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-accent" /> Gratitude
              </h3>
              <ol className="space-y-1.5 list-decimal list-inside text-sm text-muted-foreground">
                {gratitude.map((g, i) => (
                  <li key={i} className="leading-snug">{g}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Why I will win */}
          {report.why_win?.trim() && (
            <div>
              <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-primary" /> Why I Will Win
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {report.why_win}
              </p>
            </div>
          )}

          {affirmations.length === 0 && filledTasks.length === 0 && gratitude.length === 0 && !report.why_win?.trim() && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              No content was saved for this day.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}