import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, Flame, Sparkles, X } from "lucide-react";
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
"I own the last 6 holes"];




export default function DailyFocus() {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: allReports = [] } = useQuery({
    queryKey: ["focusReports"],
    queryFn: () => base44.entities.FocusReport.list("-report_date", 60)
  });

  const todayReport = allReports.find((r) => r.report_date === today);
  const focusStreak = calculateFocusStreak(allReports);

  const [affirmations, setAffirmations] = useState(["", "", ""]);
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [whyWin, setWhyWin] = useState("");
  const [reportId, setReportId] = useState(null);

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ["focusTasks", reportId],
    queryFn: () => reportId ? base44.entities.FocusTask.filter({ focus_report_id: reportId }) : [],
    enabled: !!reportId
  });

  // Initialize or load report
  useEffect(() => {
    if (todayReport) {
      setReportId(todayReport.id);
      const base = [todayReport.affirmation_1 || "", todayReport.affirmation_2 || "", todayReport.affirmation_3 || ""];
      const extras = todayReport.extra_affirmations || [];
      setAffirmations([...base, ...extras]);
      setWhyWin(todayReport.why_win || "");
      const gBase = [todayReport.gratitude_1 || "", todayReport.gratitude_2 || "", todayReport.gratitude_3 || ""];
      const gExtras = todayReport.extra_gratitude || [];
      setGratitude([...gBase, ...gExtras]);
    } else if (allReports.length >= 0 && !todayReport) {
      // Create new report
      base44.entities.FocusReport.create({ report_date: today, submitted: false }).then((report) => {
        setReportId(report.id);
        queryClient.invalidateQueries({ queryKey: ["focusReports"] });
      });
    }
  }, [todayReport, allReports]);

  const debouncedSave = useCallback(
    debounce(async (affs, win, grats) => {
      if (!reportId) return;
      await base44.entities.FocusReport.update(reportId, {
        affirmation_1: affs[0] || "",
        affirmation_2: affs[1] || "",
        affirmation_3: affs[2] || "",
        extra_affirmations: affs.slice(3).filter(Boolean),
        why_win: win,
        gratitude_1: grats[0] || "",
        gratitude_2: grats[1] || "",
        gratitude_3: grats[2] || "",
        extra_gratitude: grats.slice(3).filter(Boolean)
      });
    }, 800),
    [reportId]
  );

  const updateAffirmation = (idx, val) => {
    const next = [...affirmations];
    next[idx] = val;
    setAffirmations(next);
    debouncedSave(next, whyWin, gratitude);
  };

  const quickFill = (text) => {
    const idx = affirmations.findIndex((a) => !a);
    if (idx !== -1) {
      updateAffirmation(idx, text);
    } else {
      const next = [...affirmations, text];
      setAffirmations(next);
      debouncedSave(next, whyWin, gratitude);
    }
  };

  const addAffirmation = () => {
    setAffirmations((prev) => [...prev, ""]);
  };

  const removeAffirmation = (idx) => {
    const next = affirmations.filter((_, i) => i !== idx);
    setAffirmations(next);
    debouncedSave(next, whyWin, gratitude);
  };

  const updateGratitude = (idx, val) => {
    const next = [...gratitude];
    next[idx] = val;
    setGratitude(next);
    debouncedSave(affirmations, whyWin, next);
  };

  const addGratitude = () => {
    setGratitude((prev) => [...prev, ""]);
  };

  const removeGratitude = (idx) => {
    const next = gratitude.filter((_, i) => i !== idx);
    setGratitude(next);
    debouncedSave(affirmations, whyWin, next);
  };

  const toggleTask = async (task) => {
    await base44.entities.FocusTask.update(task.id, { done: !task.done });
    refetchTasks();
  };

  const addTask = async () => {
    if (!reportId) return;
    await base44.entities.FocusTask.create({ focus_report_id: reportId, task_text: "", done: false, is_default: false });
    refetchTasks();
  };

  const updateTask = async (task, newText) => {
    await base44.entities.FocusTask.update(task.id, { task_text: newText });
    refetchTasks();
  };

  const deleteTask = async (taskId) => {
    await base44.entities.FocusTask.delete(taskId);
    refetchTasks();
  };

  const filledTasks = tasks.filter((t) => t.task_text?.trim());
  const filledGratitude = gratitude.filter((g) => g?.trim());
  const filledAffirmations = affirmations.filter((a) => a?.trim());

  const submitReport = async () => {
    if (filledAffirmations.length < 1) {
      toast.error("Add at least 1 affirmation first");
      return;
    }
    if (filledTasks.length < 3) {
      toast.error("Add at least 3 top priorities before submitting");
      return;
    }
    if (filledGratitude.length < 3) {
      toast.error("Add at least 3 things you're grateful for before submitting");
      return;
    }
    if (!whyWin.trim()) {
      toast.error("Fill in why you will win today");
      return;
    }
    await base44.entities.FocusReport.update(reportId, {
      affirmation_1: affirmations[0] || "",
      affirmation_2: affirmations[1] || "",
      affirmation_3: affirmations[2] || "",
      extra_affirmations: affirmations.slice(3).filter(Boolean),
      why_win: whyWin,
      gratitude_1: gratitude[0] || "",
      gratitude_2: gratitude[1] || "",
      gratitude_3: gratitude[2] || "",
      extra_gratitude: gratitude.slice(3).filter(Boolean),
      submitted: true
    });
    queryClient.invalidateQueries({ queryKey: ["focusReports"] });
    toast.success("Focus report submitted! 🔥");
  };

  // Week view
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const report = allReports.find((r) => r.report_date === dateStr);
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
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Today's Affirmations</h2>
          {!isSubmitted &&
          <Button variant="ghost" size="sm" onClick={addAffirmation}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          }
        </div>
        {affirmations.map((aff, i) =>
        <div key={i} className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <Input
            value={aff}
            onChange={(e) => updateAffirmation(i, e.target.value)}
            placeholder={`Affirmation ${i + 1}`}
            disabled={isSubmitted}
            className="flex-1" />
          
            {!isSubmitted && affirmations.length > 1 &&
          <button
            onClick={() => removeAffirmation(i)}
            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
            
                <X className="w-4 h-4" />
              </button>
          }
          </div>
        )}
        {filledAffirmations.length >= 3 && (
          <p className="text-xs text-primary/70 font-medium flex items-center gap-1 pt-1">
            <Flame className="w-3 h-3" /> +1 mental credit for your affirmations today
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {QUICK_AFFIRMATIONS.map((q) =>
          <button
            key={q}
            onClick={() => quickFill(q)}
            disabled={isSubmitted}
            className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50">
            
              <Sparkles className="w-3 h-3 inline mr-1" />{q}
            </button>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Today's Top Priorities <span className={cn("text-sm font-normal", filledTasks.length >= 3 ? "text-primary" : "text-muted-foreground")}>{filledTasks.length >= 3 ? `✓ ${filledTasks.length} added` : `(at least 3 — ${filledTasks.length}/3)`}</span></h2>
          <Button variant="ghost" size="sm" onClick={addTask} disabled={isSubmitted}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        {tasks.length === 0 && !isSubmitted &&
        <p className="text-sm text-muted-foreground italic py-2">No priorities added yet — setting yours daily builds mental discipline. 🧠</p>
        }
        {tasks.map((task, i) =>
        <div key={task.id} className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <Input
            value={task.task_text}
            onChange={(e) => updateTask(task, e.target.value)}
            placeholder="Enter priority..."
            disabled={isSubmitted}
            className="flex-1 text-sm" />
          
            {!isSubmitted &&
          <button
            onClick={() => deleteTask(task.id)}
            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
            
                <X className="w-4 h-4" />
              </button>
          }
          </div>
        )}
        {tasks.length >= 3 &&
        <p className="text-xs text-primary/70 font-medium flex items-center gap-1 pt-1">
            <Flame className="w-3 h-3" /> +1 mental credit for setting your priorities today
          </p>
        }
      </div>

      {/* Gratitude */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">What am I Grateful for Today? <span className={cn("text-sm font-normal", filledGratitude.length >= 3 ? "text-primary" : "text-muted-foreground")}>{filledGratitude.length >= 3 ? `✓ ${filledGratitude.length} added` : `(${filledGratitude.length}/3)`}</span></h2>
          {!isSubmitted &&
          <Button variant="ghost" size="sm" onClick={addGratitude}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          }
        </div>
        {gratitude.map((g, i) =>
        <div key={i} className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0 bg-[hsl(var(--input))] text-[hsl(var(--primary))]">{i + 1}</span>
            <Input
            value={g}
            onChange={(e) => updateGratitude(i, e.target.value)}
            placeholder={`I'm grateful for...`}
            disabled={isSubmitted}
            className="flex-1" />
          
            {!isSubmitted && gratitude.length > 1 &&
          <button
            onClick={() => removeGratitude(i)}
            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
            
                <X className="w-4 h-4" />
              </button>
          }
          </div>
        )}
        {filledGratitude.length >= 3 && (
          <p className="text-xs text-primary/70 font-medium flex items-center gap-1 pt-1">
            <Flame className="w-3 h-3" /> +1 mental credit for your gratitude today
          </p>
        )}
      </div>

      {/* Why will I win */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-display font-bold text-lg">Why will I win today?</h2>
        <Textarea
          value={whyWin}
          onChange={(e) => {setWhyWin(e.target.value);debouncedSave(affirmations, e.target.value, gratitude);}}
          placeholder="Write your reason..."
          rows={3}
          disabled={isSubmitted} />
        {whyWin.trim() && (
          <p className="text-xs text-primary/70 font-medium flex items-center gap-1 pt-1">
            <Flame className="w-3 h-3" /> +1 mental credit for defining your win today
          </p>
        )}
      </div>

      {!isSubmitted &&
      <Button onClick={submitReport} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90">
          Submit Focus Report
        </Button>
      }
      {isSubmitted &&
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-primary font-semibold flex items-center justify-center gap-2">
            <Check className="w-5 h-5" /> Focus report submitted — go crush it!
          </p>
        </div>
      }

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
              </div>);

          })}
        </div>
      </div>
    </div>);

}