import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Navigate } from "react-router-dom";
import { Activity, Flag, Target, PenLine, TrendingDown, TrendingUp, Lock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import StatCard from "@/components/dashboard/StatCard";
import MPSRing from "@/components/dashboard/MPSRing";
import InsightCard from "@/components/dashboard/InsightCard";

import { calculateMPS, calculateFocusStreak, generateInsights, calculateBadges } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chartFilter, setChartFilter] = useState("All");

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u?.onboarded) navigate("/setup");
      else if (u.role === "coach" || u.role === "parent") navigate("/roster");
      else setUser(u);
    });
  }, []);

  const { data: rounds = [] } = useQuery({
    queryKey: ["rounds"],
    queryFn: () => base44.entities.Round.list("-date", 50),
  });
  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: () => base44.entities.Goal.list("-created_date", 100),
  });
  const { data: focusReports = [] } = useQuery({
    queryKey: ["focusReports"],
    queryFn: () => base44.entities.FocusReport.list("-report_date", 60),
  });
  const { data: journals = [] } = useQuery({
    queryKey: ["journals"],
    queryFn: () => base44.entities.JournalEntry.list("-entry_date", 10),
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const todayFocus = focusReports.find(r => r.report_date === today);
  const todayJournal = journals.find(j => j.entry_date === today);

  // Stats
  const overallAvg = rounds.length ? (rounds.reduce((a, r) => a + (r.total_score || 0), 0) / rounds.length).toFixed(1) : "—";
  const tournamentRounds = rounds.filter(r => r.round_type === "Tournament" || r.round_type === "Qualifier");
  const practiceRounds = rounds.filter(r => r.round_type === "Practice" || r.round_type === "Casual");
  const tournamentAvg = tournamentRounds.length ? (tournamentRounds.reduce((a, r) => a + (r.total_score || 0), 0) / tournamentRounds.length).toFixed(1) : "—";
  const practiceAvg = practiceRounds.length ? (practiceRounds.reduce((a, r) => a + (r.total_score || 0), 0) / practiceRounds.length).toFixed(1) : "—";

  const girRounds = rounds.filter(r => r.gir_count != null);
  const avgGir = girRounds.length ? (girRounds.reduce((a, r) => a + r.gir_count, 0) / girRounds.length).toFixed(1) : "—";
  const firRounds = rounds.filter(r => r.fir_count != null);
  const avgFir = firRounds.length ? (firRounds.reduce((a, r) => a + r.fir_count, 0) / firRounds.length).toFixed(1) : "—";
  const puttRounds = rounds.filter(r => r.total_putts != null);
  const avgPutts = puttRounds.length ? (puttRounds.reduce((a, r) => a + r.total_putts, 0) / puttRounds.length).toFixed(1) : "—";

  const mps = calculateMPS(rounds);
  const focusStreak = calculateFocusStreak(focusReports);
  const insights = generateInsights(rounds);
  const badges = calculateBadges(rounds, focusStreak, goals);

  // Chart data
  const filteredRounds = chartFilter === "All" ? rounds
    : chartFilter === "Tournament" ? tournamentRounds : practiceRounds;
  const chartData = [...filteredRounds].reverse().slice(-15).map(r => ({
    date: format(new Date(r.date), "M/d"),
    score: r.total_score,
  }));

  // Mental stats bar data
  const mentalBarData = rounds.length ? [
    { name: "Routine %", value: Math.round(rounds.reduce((a, r) => a + (r.routine_pct || 0), 0) / rounds.length) },
    { name: "Calm", value: Math.round(rounds.reduce((a, r) => a + (r.calm_rating || 0), 0) / rounds.length * 10) },
    { name: "Reset", value: Math.round(rounds.reduce((a, r) => a + (r.reset_rating || 0), 0) / rounds.length * 10) },
    { name: "Focus-6", value: Math.round(rounds.reduce((a, r) => a + (r.focus6_rating || 0), 0) / rounds.length * 10) },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          {user?.first_name ? `Hey ${user.first_name}` : "Dashboard"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Your mental game at a glance</p>
      </div>

      {/* Row 1: Scoring stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Overall Avg" value={overallAvg} icon={Activity} />
        <StatCard label="Tournament Avg" value={tournamentAvg} icon={Flag} />
        <StatCard label="Practice Avg" value={practiceAvg} icon={Target} />
        <StatCard label="Rounds Logged" value={rounds.length} icon={PenLine} />
      </div>

      {/* Row 2: Shot stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="GIR Avg" value={avgGir} subtitle="greens" />
        <StatCard label="Fairways Hit" value={avgFir} subtitle="avg" />
        <StatCard label="Avg Putts" value={avgPutts} subtitle="per round" />
        <StatCard label="MPS" value={mps} variant="accent" subtitle="/ 100" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Scoring trend */}
        <div className="md:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Scoring Trend</h2>
            <div className="flex gap-1">
              {["All", "Tournament", "Practice"].map(f => (
                <button
                  key={f}
                  onClick={() => setChartFilter(f)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    chartFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={['dataMin - 3', 'dataMax + 3']} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              Log more rounds to see your scoring trend
            </div>
          )}
        </div>

        {/* MPS + Streak + Badges */}
        <div className="bg-card rounded-xl border border-border p-5 flex flex-col items-center gap-4">
          <MPSRing score={mps} />
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Focus Streak: <span className="text-accent">{focusStreak} days</span></p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {badges.map((b, i) => (
              <span key={i} className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                b.color === "green" && "bg-primary/10 text-primary",
                b.color === "gold" && "bg-accent/15 text-accent",
                b.color === "blue" && "bg-blue-100 text-blue-700"
              )}>{b.label}</span>
            ))}
            {badges.length === 0 && <span className="text-xs text-muted-foreground">Complete tasks to earn badges!</span>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Coach's Brain Insights */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-lg">Coach's Brain</h2>
          {rounds.length < 3 ? (
            <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center gap-3 text-center">
              <Lock className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Log 3 rounds to unlock AI insights</p>
              <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${(rounds.length / 3) * 100}%` }} /></div>
              <p className="text-xs text-muted-foreground">{rounds.length}/3 rounds</p>
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <p className="text-sm text-primary font-medium">All systems green — keep it up!</p>
            </div>
          )}
        </div>

      </div>

      {/* Mental Stats Bars */}
      {mentalBarData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-display font-bold text-lg mb-4">Mental Stats</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mentalBarData} layout="vertical" barSize={12}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={80} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {mentalBarData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Rounds */}
      {rounds.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-display font-bold text-lg">Recent Rounds</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5">
                  <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Course</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Score</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">+/-</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">GIR</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">FIR</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Putts</th>
                </tr>
              </thead>
              <tbody>
                {rounds.slice(0, 8).map((r, i) => {
                  const diff = (r.total_score || 0) - (r.total_par || 72);
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
                      <td className="text-center px-4 py-2.5">{r.fir_count ?? "—"}</td>
                      <td className="text-center px-4 py-2.5">{r.total_putts ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}