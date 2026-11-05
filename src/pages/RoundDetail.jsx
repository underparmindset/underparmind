import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Flag, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import ScorecardView from "@/components/rounds/ScorecardView";
import RoundNotesView from "@/components/rounds/RoundNotesView";

function Stat({ label, value, accent }) {
  return (
    <div className="bg-card rounded-xl border border-border p-3 text-center">
      <p className={cn("text-xl font-display font-bold", accent && "text-accent")}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function RatingRow({ label, value, max, suffix = "" }) {
  const pct = Math.min(100, Math.round(((value || 0) / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">
          {value ?? "—"}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function RoundDetail() {
  const { roundId } = useParams();

  const { data: round, isLoading } = useQuery({
    queryKey: ["round", roundId],
    queryFn: () => base44.entities.Round.get(roundId),
  });

  const notFound = !isLoading && !round;

  useEffect(() => {
    if (!notFound) return;
    const meta = document.createElement("meta");
    meta.name = "prerender-status-code";
    meta.content = "404";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [notFound]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-10 text-center">Loading round...</p>;
  }

  if (notFound) {
    return (
      <div className="bg-card border border-border rounded-xl p-10 text-center">
        <Flag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="font-semibold">Round not found</p>
        <Link to="/rounds" className="text-sm text-accent hover:underline mt-2 inline-block">
          Back to all rounds
        </Link>
      </div>
    );
  }

  const diff = (round.total_score || 0) - (round.total_par || 72);

  return (
    <div className="space-y-6">
      <Link to="/rounds" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="w-4 h-4" /> All rounds
      </Link>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent shrink-0" />
              {round.course_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(round.date), "EEEE, MMMM d, yyyy")} · {round.round_type}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-display font-bold leading-none">{round.total_score}</p>
            <p
              className={cn(
                "text-sm font-semibold mt-1",
                diff < 0 ? "text-secondary" : diff > 0 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {diff > 0 ? `+${diff}` : diff} vs par {round.total_par}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Putts" value={round.total_putts ?? "—"} />
        <Stat label="GIR" value={round.gir_count ?? "—"} />
        <Stat label="Fairways" value={round.fir_count != null ? `${round.fir_count}/${round.fir_total ?? "—"}` : "—"} />
        <Stat label="Holes" value={round.holes_played ?? 18} />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-display font-bold text-lg">Mental Check-In</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <RatingRow label="First-tee calm" value={round.calm_rating} max={10} suffix="/10" />
          <RatingRow label="Pre-shot routine" value={round.routine_pct} max={100} suffix="%" />
          <RatingRow label="Reset after worst hole" value={round.reset_rating} max={10} suffix="/10" />
          <RatingRow label="Focus over last 6 holes" value={round.focus6_rating} max={10} suffix="/10" />
        </div>
        {(round.regret_shot || round.well_done) && (
          <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-border">
            {round.regret_shot && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Shot you'd want back
                </p>
                <p className="text-sm mt-1">{round.regret_shot}</p>
              </div>
            )}
            {round.well_done && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Done well under pressure
                </p>
                <p className="text-sm mt-1">{round.well_done}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <RoundNotesView round={round} />
      <ScorecardView round={round} />
    </div>
  );
}