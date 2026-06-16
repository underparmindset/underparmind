import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Plus, Trophy, Target, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Goals() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [goalText, setGoalText] = useState("");
  const [measure, setMeasure] = useState("");
  const [horizon, setHorizon] = useState("week");

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: () => base44.entities.Goal.list("-created_date", 200),
  });

  const hitGoals = goals.filter(g => g.status === "hit");
  const resolvedGoals = goals.filter(g => g.status !== "open");
  const hitRate = resolvedGoals.length ? Math.round((hitGoals.length / resolvedGoals.length) * 100) : 0;

  const weekGoals = goals.filter(g => g.horizon === "week");
  const monthGoals = goals.filter(g => g.horizon === "month");
  const quarterGoals = goals.filter(g => g.horizon === "quarter");

  const weekHit = weekGoals.filter(g => g.status === "hit").length;
  const monthHit = monthGoals.filter(g => g.status === "hit").length;
  const quarterHit = quarterGoals.filter(g => g.status === "hit").length;

  const saveGoal = async () => {
    if (!goalText.trim()) return;
    await base44.entities.Goal.create({
      goal_text: goalText.trim(),
      measure: measure.trim(),
      horizon,
      status: "open",
    });
    setGoalText("");
    setMeasure("");
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    toast.success("Goal added!");
  };

  const markGoal = async (id, status) => {
    await base44.entities.Goal.update(id, { status, resolved_date: format(new Date(), "yyyy-MM-dd") });
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    toast.success(status === "hit" ? "Goal crushed! 🏆" : "Goal marked as missed");
  };

  const GoalGroup = ({ title, goalList }) => {
    const open = goalList.filter(g => g.status === "open");
    const resolved = goalList.filter(g => g.status !== "open");
    return (
      <div className="space-y-3">
        <h3 className="font-display font-bold text-base">{title}</h3>
        {goalList.length === 0 && <p className="text-sm text-muted-foreground">No goals set yet</p>}
        {open.map(g => <GoalCard key={g.id} goal={g} onMark={markGoal} />)}
        {resolved.map(g => <GoalCard key={g.id} goal={g} />)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Goals</h1>
          <p className="text-muted-foreground text-sm mt-1">Set ambitious targets, track your wins</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" /> Add Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Weekly</p>
          <p className="text-xl font-bold mt-1">{weekHit}/{weekGoals.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Monthly</p>
          <p className="text-xl font-bold mt-1">{monthHit}/{monthGoals.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quarterly</p>
          <p className="text-xl font-bold mt-1">{quarterHit}/{quarterGoals.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Hit Rate</p>
          <p className="text-xl font-bold text-primary mt-1">{hitRate}%</p>
          {hitRate >= 50 && hitRate <= 70 && <p className="text-[9px] text-accent font-medium mt-0.5">Sweet spot</p>}
        </div>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-display font-bold text-lg">New Goal</h2>
          <Input value={goalText} onChange={(e) => setGoalText(e.target.value)} placeholder="What's the goal?" />
          <Input value={measure} onChange={(e) => setMeasure(e.target.value)} placeholder="How will you know you hit it?" />
          <Select value={horizon} onValueChange={setHorizon}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Next 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button onClick={saveGoal} disabled={!goalText.trim()} className="bg-primary hover:bg-primary/90">Save Goal</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Goal Lists */}
      <GoalGroup title="This Week" goalList={weekGoals} />
      <GoalGroup title="This Month" goalList={monthGoals} />
      <GoalGroup title="Next 3 Months" goalList={quarterGoals} />
    </div>
  );
}

function GoalCard({ goal, onMark }) {
  const isOpen = goal.status === "open";
  return (
    <div className={cn(
      "bg-card rounded-xl border p-4 flex flex-col gap-2",
      isOpen ? "border-border" : "border-border/50 opacity-70"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm">{goal.goal_text}</p>
          {goal.measure && <p className="text-xs text-muted-foreground mt-0.5">📏 {goal.measure}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Eye className="w-3 h-3" /> Visible to parents & coach
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
              goal.status === "open" && "bg-blue-100 text-blue-700",
              goal.status === "hit" && "bg-primary/10 text-primary",
              goal.status === "missed" && "bg-destructive/10 text-destructive"
            )}>{goal.status}</span>
          </div>
        </div>
        {isOpen && onMark && (
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => onMark(goal.id, "hit")}
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <Trophy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMark(goal.id, "missed")}
              className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}