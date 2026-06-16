import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users, TrendingUp, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Roster() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: allRounds = [] } = useQuery({
    queryKey: ["allRounds"],
    queryFn: () => base44.entities.Round.list("-date", 500),
  });

  const { data: allReports = [] } = useQuery({
    queryKey: ["allFocusReports"],
    queryFn: () => base44.entities.FocusReport.list("-report_date", 500),
  });

  // Only show player-role users (not self)
  const players = allUsers.filter(
    (u) => (!u.role || u.role === "player") && u.id !== currentUser?.id
  );

  // Per-player stats
  const getPlayerStats = (playerId) => {
    const rounds = allRounds.filter((r) => r.created_by_id === playerId);
    const reports = allReports.filter((r) => r.created_by_id === playerId);
    const submitted = reports.filter((r) => r.submitted);
    const avgScore =
      rounds.length > 0
        ? (rounds.reduce((a, r) => a + (r.total_score || 0), 0) / rounds.length).toFixed(1)
        : null;
    const lastRound = rounds[0];

    // Simple streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sorted = [...submitted].sort((a, b) => new Date(b.report_date) - new Date(a.report_date));
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const d = new Date(sorted[i].report_date);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === expected.getTime()) streak++;
      else if (i === 0) {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        if (d.getTime() === y.getTime()) streak++;
        else break;
      } else break;
    }

    return { rounds: rounds.length, avgScore, lastRound, streak };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" /> My Players
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          View each player's progress, mental stats, and recent activity
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold">No players yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Players who register with the app will appear here automatically
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {players.map((player) => {
            const stats = getPlayerStats(player.id);
            return (
              <Link
                key={player.id}
                to={`/player/${player.id}`}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg">
                      {(player.first_name || player.full_name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-bold">
                        {player.first_name || player.full_name || player.email}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {player.age ? `Age ${player.age}` : ""}
                        {player.age && player.coaching_goal ? " · " : ""}
                        {player.coaching_goal || ""}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Rounds</p>
                    <p className="font-bold text-lg">{stats.rounds}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Avg Score</p>
                    <p className="font-bold text-lg">{stats.avgScore ?? "—"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Streak</p>
                    <p className={cn("font-bold text-lg", stats.streak > 0 && "text-accent")}>
                      🔥 {stats.streak}
                    </p>
                  </div>
                </div>

                {stats.lastRound && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Last round: {stats.lastRound.course_name} — {stats.lastRound.total_score}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}