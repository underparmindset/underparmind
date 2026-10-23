import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import { Dumbbell, Target, ClipboardCheck, BookOpen, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecentActivity({ playerData }) {
  const { data: modules = [] } = useQuery({
    queryKey: ["recentActivityModules"],
    queryFn: () => base44.entities.GymModule.list("order", 600),
    staleTime: 5 * 60 * 1000,
  });
  const modMap = Object.fromEntries(modules.map((m) => [m.id, m]));

  const events = [];
  (playerData?.moduleProgress || []).forEach((p) => {
    if (!p.completed || !p.completed_date) return;
    const m = modMap[p.module_id];
    events.push({
      date: p.completed_date,
      icon: Dumbbell,
      label: "Mental Gym",
      text: m ? `${m.week_label} · Day ${m.day_number}: ${m.title}` : "Completed a Mental Gym session",
      tone: "primary",
    });
  });
  (playerData?.goals || []).forEach((g) => {
    events.push({ date: g.created_date, icon: Target, label: "Goal set", text: g.goal_text, tone: "gold" });
    if (g.updated_date && g.updated_date !== g.created_date) {
      events.push({
        date: g.updated_date,
        icon: Target,
        label: g.status === "hit" ? "Goal achieved" : `Goal updated (${g.status})`,
        text: g.goal_text,
        tone: "gold",
      });
    }
  });
  (playerData?.reports || []).forEach((r) => {
    if (!r.submitted) return;
    events.push({ date: r.report_date, icon: ClipboardCheck, label: "Win The Day", text: "Daily focus report submitted", tone: "primary" });
  });
  (playerData?.journals || []).forEach((j) => {
    if (!j.entry_text) return;
    events.push({ date: j.entry_date, icon: BookOpen, label: "Journal", text: j.prompt || "New journal entry", tone: "gold" });
  });
  (playerData?.rounds || []).forEach((r) => {
    if (r.total_score == null) return;
    events.push({ date: r.date, icon: Flag, label: "Round logged", text: `${r.course_name} — ${r.total_score}`, tone: "primary" });
  });

  const recent = events
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h2 className="font-display font-bold text-lg mb-4">Recent Activity</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet — it will appear here as they train.</p>
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((e, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <span className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                e.tone === "gold" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
              )}>
                <e.icon className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{e.text}</p>
                <p className="text-[11px] text-muted-foreground">{e.label}</p>
              </div>
              <span className="text-[11px] text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(new Date(e.date), { addSuffix: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}