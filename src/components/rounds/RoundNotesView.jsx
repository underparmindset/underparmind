import { StickyNote, Star, ArrowLeftRight, ListChecks, Lightbulb, FileText } from "lucide-react";

function Section({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <Icon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="text-sm mt-1 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function RoundNotesView({ round }) {
  const hasTurning =
    round.turning_point_hole || round.turning_point_note || round.turning_point_dir;
  const hasFacts = round.facts && round.facts.length > 0;
  const hasAnything =
    round.best_shot || hasTurning || hasFacts || round.lesson || round.round_notes;

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <h2 className="font-display font-bold text-lg flex items-center gap-2">
        <StickyNote className="w-5 h-5 text-accent" /> Round Notes
      </h2>

      {!hasAnything ? (
        <p className="text-sm text-muted-foreground">
          No notes were added to this round.
        </p>
      ) : (
        <div className="space-y-4">
          {round.best_shot && (
            <Section icon={Star} label="Best shot of the day">
              {round.best_shot}
            </Section>
          )}

          {hasTurning && (
            <Section icon={ArrowLeftRight} label="Where the round turned">
              <p>
                {round.turning_point_hole ? `Hole ${round.turning_point_hole}` : "Turning point"}
                {round.turning_point_dir ? ` — turned ${round.turning_point_dir}` : ""}
              </p>
              {round.turning_point_note && (
                <p className="text-muted-foreground mt-1">{round.turning_point_note}</p>
              )}
            </Section>
          )}

          {hasFacts && (
            <Section icon={ListChecks} label="Three facts from the round">
              <ol className="list-decimal list-inside space-y-1">
                {round.facts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ol>
            </Section>
          )}

          {round.lesson && (
            <Section icon={Lightbulb} label="One lesson">
              {round.lesson}
            </Section>
          )}

          {round.round_notes && (
            <Section icon={FileText} label="Anything else">
              <p className="whitespace-pre-wrap">{round.round_notes}</p>
            </Section>
          )}

          {round.no_insults && (
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
              ✓ Confirmed: facts only, no insults
            </p>
          )}
        </div>
      )}
    </div>
  );
}