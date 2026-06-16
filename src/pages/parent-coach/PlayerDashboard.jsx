import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Flag, Target, Activity, PenLine, Flame, Lock } from "lucide-react";
import { format } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { calculateMPS, calculateFocusStreak, generateInsights, calculateBadges } from "@/lib/calculations";
import MPSRing from "@/components/dashboard/MPSRing";
import InsightCard from "@/components/dashboard/InsightCard";
import { cn } from "@/lib/utils";

export default function PlayerDashboard() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    base44.entities.User.filter({ id: playerId }).then((res) => {
      setPlayer(res[0] || null);
    });
  }, [playerId]);

  const { data: allRounds = [] } = useQuery({
    queryKey: ["allRounds"],
    queryFn: () => base44.entities.Round.list("-date", 500),
  });

  const { data: allReports = [] } = useQuery({
    queryKey: ["allFocusReports"],
    queryFn: () => base44.entities.FocusReport.list("-report_date", 500),
  });

  const { data: allGoals = [] } = useQuery({
    queryKey: ["allGoals"],
    queryFn: () => base44.entities.Goal.list("-created_date", 500),
  });

  const { data: allJournals = [] } = useQuery({
    queryKey: ["allJournals"],
    queryFn: () => base44.entities.JournalEntry.list("-entry_date", 500),
  });

  // Filter to this player
  const rounds = allRounds.filter((r) => r.created_by_id === playerId);
  const reports = allReports.filter((r) => r.created_by_id === playerId);
  const goals = allGoals.filter((g) => g.created_by_id === playerId);
  const journals = allJournals.filter((j) => j.created_by_id === playerId);

  // Stats
  const mps = calculateMPS(rounds);
  const focusStreak = calculateFocusStreak(reports);
  const insights = generateInsights(rounds);
  const badges = calculateBadges(rounds, focusStreak, goals);

  const overallAvg = rounds.length
    ? (rounds.reduce((a, r) => a + (r.total_score || 0), 0) / rounds.length).toFixed(1)
    : "—";
  const tournamentRounds = rounds.filter((r) => r.round_type === "Tournament" || r.round_type === "Qualifier");
  const tournamentAvg = tournamentRounds.length
    ? (tournamentRounds.reduce((a, r) => a + (r.total_score || 0), 0) / tournamentRounds.length).toFixed(1)
    : "—";
  const girRounds = rounds.filter((r) => r.gir_count != null);
  const avgGir = girRounds.length
    ? (girRounds.reduce((a, r) => a + r.gir_count, 0) / girRounds.length).toFixed(1)
    : "—";
  const puttRounds = rounds.filter((r) => r.total_putts != null);
  const avgPutts = puttRounds.length
    ? (puttRounds.reduce((a, r) => a + r.total_putts, 0) / puttRounds.length).toFixed(1)
    : "—";

  const chartData = [...rounds].reverse().slice(-15).map((r) => ({
    date: format(new Date(r.date), "M/d"),
    score: r.total_score,
  }));

  const mentalBarData = rounds.length
    ? [
        { name: "Routine %", value: Math.round(rounds.reduce((a, r) => a + (r.routine_pct || 0), 0) / rounds.length) },
        { name: "Calm", value: Math.round(rounds.reduce((a, r) => a + (r.calm_rating || 0), 0) / rounds.length * 10) },
        { name: "Reset", value: Math.round(rounds.reduce((a, r) => a + (r.reset_rating || 0), 0) / rounds.length * 10) },
        { name: "Focus-6", value: Math.round(rounds.reduce((a, r) => a + (r.focus6_rating || 0), 0) / rounds.length * 10) },
      ]
    : [];

  const openGoals = goals.filter((g) => g.status === "open");
  const hitGoals = goals.filter((g) => g.status === "hit");

  const submittedToday = (() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return reports.some((r) => r.report_date === today && r.submitted);
  })();

  const playerName = player?.first_name || player?.full_name || "Player";

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/roster" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to roster
      </Link>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl flex-shrink-0">
          {playerName[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold">{playerName}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            {player?.age && <span className="text-sm text-muted-foreground">Age {player.age}</span>}
            {player?.coaching_goal && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {player.coaching_goal}
              </span>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-accent" /> {focusStreak}-day streak
            </span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              submittedToday ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {submittedToday ? "✓ Focused today" : "No focus report today"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b, i) => (
            <span key={i} className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-bold",
              b.color === "green" && "bg-primary/10 text-primary",
              b.color === "gold" && "bg-accent/15 text-accent",
              b.color === "blue" && "bg-blue-100 text-blue-700"
            )}>{b.label}</span>
          ))}
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg Score", value: overallAvg, icon: Activity },
          { label: "Tournament Avg", value: tournamentAvg, icon: Flag },
          { label: "GIR Avg", value: avgGir, icon: Target },
          { label: "Avg Putts", value: avgPutts, icon: PenLine },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
            <span className="text-2xl font-display font-bold">{value}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Scoring chart */}
        <div className="md:col-span-2 bg-card rounded-xl border border-border p-5">
          <h2 className="font-display font-bold text-lg mb-4">Scoring Trend</h2>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={["dataMin - 3", "dataMax + 3"]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Not enough rounds yet
            </div>
          )}
        </div>

        {/* MPS */}
        <div className="bg-card rounded-xl border border-border p-5 flex flex-col items-center justify-center gap-3">
          <h2 className="font-display font-bold text-lg self-start w-full">Mental Performance</h2>
          <MPSRing score={mps} />
          <p className="text-sm text-muted-foreground text-center">
            {mps >= 70 ? "Strong mental game 💪" : mps >= 40 ? "Building mental consistency" : "Focus is the priority right now"}
          </p>
        </div>
      </div>

      {/* Mental stats */}
      {mentalBarData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-display font-bold text-lg mb-4">Mental Stats Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mentalBarData} layout="vertical" barSize={12}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={80} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {mentalBarData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights */}
      <div>
        <h2 className="font-display font-bold text-lg mb-3">Coach's Insights</h2>
        {rounds.length < 3 ? (
          <div className="bg-card rounded-xl border border-border p-6 flex items-center gap-3">
            <Lock className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">Player needs 3+ rounds to unlock insights ({rounds.length}/3)</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-5 text-center text-sm text-primary font-medium">
            All systems green!
          </div>
        )}
      </div>

      {/* Goals */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Open Goals ({openGoals.length})</h2>
          {openGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open goals</p>
          ) : (
            <div className="space-y-2">
              {openGoals.map((g) => (
                <div key={g.id} className="bg-card rounded-xl border border-border p-3">
                  <p className="text-sm font-medium">{g.goal_text}</p>
                  {g.measure && <p className="text-xs text-muted-foreground mt-0.5">📏 {g.measure}</p>}
                  <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mt-1 inline-block">{g.horizon}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Goals Hit ({hitGoals.length})</h2>
          {hitGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet — encourage them!</p>
          ) : (
            <div className="space-y-2">
              {hitGoals.slice(0, 5).map((g) => (
                <div key={g.id} className="bg-primary/5 rounded-xl border border-primary/20 p-3">
                  <p className="text-sm font-medium text-primary">🏆 {g.goal_text}</p>
                  {g.resolved_date && (
                    <p className="text-xs text-muted-foreground mt-0.5">Completed {format(new Date(g.resolved_date), "MMM d, yyyy")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent rounds */}
      {rounds.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-display font-bold text-lg">Recent Rounds</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-4 py-2.5 font-semibold">Date</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Course</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Type</th>
                  <th className="text-center px-4 py-2.5 font-semibold">Score</th>
                  <th className="text-center px-4 py-2.5 font-semibold">+/-</th>
                  <th className="text-center px-4 py-2.5 font-semibold">GIR</th>
                  <th className="text-center px-4 py-2.5 font-semibold">Putts</th>
                  <th className="text-center px-4 py-2.5 font-semibold">MPS</th>
                </tr>
              </thead>
              <tbody>
                {rounds.slice(0, 10).map((r, i) => {
                  const diff = (r.total_score || 0) - (r.total_par || 72);
                  const mpsR = r.calm_rating && r.reset_rating && r.focus6_rating
                    ? Math.round(((r.calm_rating + r.reset_rating + r.focus6_rating) / 30) * 100 * 0.6 + (r.routine_pct || 0) * 0.4)
                    : null;
                  return (
                    <tr key={r.id} className={cn(i % 2 === 0 ? "bg-background" : "bg-muted/30")}>
                      <td className="px-4 py-2.5">{format(new Date(r.date), "MMM d")}</td>
                      <td className="px-4 py-2.5 font-medium">{r.course_name}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          (r.round_type === "Tournament" || r.round_type === "Qualifier") ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                        )}>{r.round_type}</span>
                      </td>
                      <td className="text-center px-4 py-2.5 font-bold">{r.total_score}</td>
                      <td className={cn("text-center px-4 py-2.5 font-semibold",
                        diff < 0 ? "text-primary" : diff > 0 ? "text-destructive" : "text-muted-foreground"
                      )}>{diff > 0 ? `+${diff}` : diff}</td>
                      <td className="text-center px-4 py-2.5">{r.gir_count ?? "—"}</td>
                      <td className="text-center px-4 py-2.5">{r.total_putts ?? "—"}</td>
                      <td className="text-center px-4 py-2.5">
                        {mpsR != null ? (
                          <span className={cn("font-bold text-xs", mpsR >= 60 ? "text-primary" : "text-accent")}>{mpsR}</span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Journal entries (coach only — read-only) */}
      {journals.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Journal Entries</h2>
          <div className="space-y-3">
            {journals.slice(0, 5).map((entry) => (
              <div key={entry.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-primary">{format(new Date(entry.entry_date), "MMM d, yyyy")}</span>
                </div>
                {entry.prompt && <p className="text-[11px] text-accent font-medium mb-1 italic">{entry.prompt}</p>}
                <p className="text-sm text-muted-foreground leading-relaxed">{entry.entry_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}