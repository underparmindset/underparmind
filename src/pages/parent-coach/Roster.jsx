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

  const { data: rosterData, isLoading } = useQuery({
    queryKey: ["rosterData"],
    queryFn: async () => {
      const res = await base44.functions.invoke("getRosterData", {});
      return res.data;
    },
    enabled: !!currentUser && (currentUser.user_type === "coach" || currentUser.user_type === "parent"),
  });

  const players = rosterData?.players || [];

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
            Players who invite you will appear here automatically once you both set up your profiles.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {players.map((player) => {
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
                    <p className="font-bold text-lg">{player.rounds}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Avg Score</p>
                    <p className="font-bold text-lg">{player.avgScore ?? "—"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Streak</p>
                    <p className={cn("font-bold text-lg", player.streak > 0 && "text-accent")}>
                      🔥 {player.streak}
                    </p>
                  </div>
                </div>

                {player.lastRound && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Last round: {player.lastRound.course_name} — {player.lastRound.total_score}
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