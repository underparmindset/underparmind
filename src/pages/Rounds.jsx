import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { History, Plus, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import RoundListItem from "@/components/rounds/RoundListItem";

const FILTERS = ["All", "Tournament", "Qualifier", "Practice", "Casual"];

export default function Rounds() {
  const [filter, setFilter] = useState("All");

  const { data: rounds = [], isLoading } = useQuery({
    queryKey: ["rounds"],
    queryFn: () => base44.entities.Round.list("-date", 100),
  });

  const visible = filter === "All" ? rounds : rounds.filter((r) => r.round_type === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
            <History className="w-7 h-7 text-primary" /> Rounds
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Every round you've logged — open one for the full scorecard and notes
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/log-round">
            <Plus className="w-4 h-4 mr-1" /> Log Round
          </Link>
        </Button>
      </div>

      <div className="flex gap-1 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              filter === f
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-foreground/60 hover:bg-muted/80"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Loading your rounds...</p>
      ) : rounds.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
          <Flag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold text-foreground">No rounds logged yet</p>
          <p className="text-sm mt-1">Log your first round to start building your history.</p>
          <Button asChild className="mt-4" size="sm">
            <Link to="/log-round">Log a round</Link>
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">
          No {filter.toLowerCase()} rounds logged.
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((r) => (
            <RoundListItem key={r.id} round={r} />
          ))}
        </div>
      )}
    </div>
  );
}