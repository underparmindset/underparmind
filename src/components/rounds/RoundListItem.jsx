import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ChevronRight, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_STYLES = {
  Tournament: "bg-accent/15 text-accent",
  Qualifier: "bg-accent/15 text-accent",
  Practice: "bg-muted text-foreground/70",
  Casual: "bg-muted text-foreground/70",
};

export default function RoundListItem({ round }) {
  const diff = (round.total_score || 0) - (round.total_par || 72);
  const hasNotes = Boolean(
    round.best_shot ||
      round.lesson ||
      round.round_notes ||
      round.turning_point_note ||
      (round.facts && round.facts.length)
  );

  return (
    <Link
      to={`/round/${round.id}`}
      className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:border-accent/50 transition-colors"
    >
      <div className="w-14 shrink-0 text-center">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {format(new Date(round.date), "MMM")}
        </p>
        <p className="text-xl font-display font-bold leading-none">
          {format(new Date(round.date), "d")}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-display font-bold truncate">{round.course_name}</p>
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", TYPE_STYLES[round.round_type] || TYPE_STYLES.Practice)}>
            {round.round_type}
          </span>
          {hasNotes && <StickyNote className="w-3.5 h-3.5 text-accent" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {round.holes_played || 18} holes · {round.total_putts ?? 0} putts · GIR {round.gir_count ?? "—"} · FIR{" "}
          {round.fir_count != null ? `${round.fir_count}/${round.fir_total ?? "—"}` : "—"}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-lg font-display font-bold leading-none">{round.total_score}</p>
        <p
          className={cn(
            "text-xs font-semibold mt-1",
            diff < 0 ? "text-secondary" : diff > 0 ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {diff > 0 ? `+${diff}` : diff}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </Link>
  );
}