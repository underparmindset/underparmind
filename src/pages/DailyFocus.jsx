import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { format, startOfWeek, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { calculateFocusStreak } from "@/lib/calculations";
import { debounce } from "lodash";

const QUICK_AFFIRMATIONS = [
  "I trust my swing under pressure",
  "I am calm on the first tee",
  "I commit to every shot",
  "I bounce back fast",
  "I own the last 6 holes",
];

const DEFAULT_TASKS = [
  "Say affirmations out loud",
  "10-min visualization",
  "One focused practice block",
];

export default function DailyFocus() {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: allReports = [] } = useQuery({
    queryKey: ["focusReports"],
    queryFn: () => base44.entities.FocusReport.list("-report_date", 60),
  });

  const todayReport = allReports.find(r => r.report_date === today);
  const focusStreak = calculateFocusStreak(allReports);

  const [affirmations, setAffirmations] = useState(["", "", ""]);
  const [whyWin, setWhyWin] = useState("");
  const [reportId, setReportId] = useState(null);

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ["focusTasks", reportId],
    queryFn: () => reportId ? base44.entities.FocusTask.filter({ focus_report_id: reportId }) : [],
    enabled: !!reportId,
  });

  // Initialize or load report
  useEffect(() => {
    if (todayReport) {
      setReportId(todayReport.id);
      setAffirmations([todayReport.affirmation_1 || "", todayReport.affirmation_2 || "", todayReport.affirmation_3 || ""]);
      setWhyWin(todayReport.why_win || "");
    } else if (allReports.length >= 0 && !todayReport) {
      // Create new report
      base44.entities.FocusReport.create({ report_date: today, submitted: false }).then(async (report) => {
        setReportId(report.id);
        await base44.entities.FocusTask.bulkCreate(
          DEFAULT_TASKS.map(t => ({ focus_report_id: report.id, task_text: t, done: false, is_default: true }))
        );
        queryClient.invalidateQueries({ queryKey: ["focusReports"] });
        refetchTasks();
      });
    }
  }, [todayReport, allReports]);

  const debouncedSave = useCallback(
    debounce(async (affs, win) => {
      if (!reportId) return;
      await base44.entities.FocusReport.update(reportId, {
        affirmation_1: affs[0], affirmation_2: affs[1], affirmation_3: affs[2], why_win: win,
      });
    }, 800),
    [reportId]
  );

  const updateAffirmation = (idx, val) => {
    const next = [...affirmations];
    next[idx] = val;
    setAffirmations(next);
    debouncedSave(next, whyWin);
  };

  const quickFill = (text) => {
    const idx = affirmations.findIndex(a => !a);
    if (idx === -1) return;
    updateAffirmation(idx, text);
  };

  const toggleTask = async (task) => {
    await base44.entities.FocusTask.update(task.id, { done: !task.done });
    refetchTasks();
  };

  const addTask = async () => {
    const text = prompt("Enter your task:");
    if (!text?.trim()) return;
    await base44.entities.FocusTask.create({ focus_report_id: reportId, task_text: text.trim(), done: false, is_default: false });
    refetchTasks();
  };

  const submitReport = async () => {
    if (!affirmations[0] || !affirmations[1] || !affirmations[2]) {
      toast.error("Fill in all 3 affirmations first");
      return;
    }
    await base44.entities.FocusReport.update(reportId, {
      affirmation_1: affirmations[0], affirmation_2: affirmations[1], affirmation_3: affirmations[2],
      why_win: whyWin, submitted: true,
    });
    queryClient.invalidateQueries({ queryKey: ["focusReports"] });
    toast.success("Focus report submitted! 🔥");
  };

  // Week view
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const report = allReports.find(r => r.report_date === dateStr);
    return { date, dateStr, dayLabel: format(date, "EEE"), report };
  });

  const isSubmitted = todayReport?.submitted;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Daily Focus</h1>
        <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
          <Flame className="w-4 h-4 text-accent" /> {focusStreak}-day streak
        </p>
      </div>

      {/* Affirmations */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="font-display font-bold text-lg">Today's Affirmations</h2>
        {affirmations.map((aff, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <Input
              value={aff}
              onChange={(e) => updateAffirmation(i, e.target.value)}
              placeholder={`Affirmation ${i + 1}`}
              disabled={isSubmitted}
              className="flex-1"
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {QUICK_AFFIRMATIONS.map((q) => (
            <button
              key={q}
              onClick={() => quickFill(q)}
              disabled={isSubmitted}
              className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 inline mr-1" />{q}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Focus Tasks</h2>
          <Button variant="ghost" size="sm" onClick={addTask} disabled={isSubmitted}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => !isSubmitted && toggleTask(task)}
            className="flex items-center gap-3 w-full text-left py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors"
            disabled={isSubmitted}
          >
            <div className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
              task.done ? "bg-primary border-primary" : "border-border"
            )}>
              {task.done && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className={cn("text-sm", task.done && "line-through text-muted-foreground")}>{task.task_text}</span>
          </button>
        ))}
      </div>

      {/* Why will I win */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-display font-bold text-lg">Why will I win today?</h2>
        <Textarea
          value={whyWin}
          onChange={(e) => { setWhyWin(e.target.value); debouncedSave(affirmations, e.target.value); }}
          placeholder="Write your reason..."
          rows={3}
          disabled={isSubmitted}
        />
      </div>

      {!isSubmitted && (
        <Button onClick={submitReport} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90">
          Submit Focus Report
        </Button>
      )}
      {isSubmitted && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-primary font-semibold flex items-center justify-center gap-2">
            <Check className="w-5 h-5" /> Focus report submitted — go crush it!
          </p>
        </div>
      )}

      {/* This Week */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-display font-bold text-lg">This Week</h2>
        </div>
        <div className="grid grid-cols-7 divide-x divide-border">
          {weekDays.map((d) => {
            const isDone = d.report?.submitted;
            const isToday = d.dateStr === today;
            return (
              <div key={d.dateStr} className={cn("p-3 text-center", isToday && "bg-primary/5")}>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">{d.dayLabel}</p>
                <div className={cn(
                  "w-6 h-6 rounded-full mx-auto mt-1.5 flex items-center justify-center",
                  isDone ? "bg-primary" : d.report ? "bg-accent/20" : "bg-muted"
                )}>
                  {isDone && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <p className="text-[9px] mt-1 text-muted-foreground">
                  {isDone ? "Won" : d.report ? "Showed up" : "—"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}