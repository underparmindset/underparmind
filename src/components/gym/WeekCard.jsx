import { Lock, Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAY_SCHEDULE, DAYS_PER_WEEK } from "@/lib/gymConfig";
import DayModule from "@/components/gym/DayModule";

export default function WeekCard({
  weekNum,
  weekData,
  status,
  unlocked,
  progress,
  isOpen,
  onToggle,
  onToggleComplete,
}) {
  const completedCount = status.completed;
  const isComplete = status.status === "complete";
  const hasContent = !!weekData;

  // Locked — previous week not yet complete
  if (!unlocked) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 opacity-60">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-display font-bold text-sm">Week {weekNum}</p>
          <p className="text-xs text-muted-foreground">Complete Week {weekNum - 1} to unlock</p>
        </div>
      </div>
    );
  }

  // Unlocked but no content yet
  if (!hasContent) {
    return (
      <div className="bg-card rounded-xl border border-dashed border-border p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-muted-foreground/50" />
        </div>
        <div>
          <p className="font-display font-bold text-sm">Week {weekNum}</p>
          <p className="text-xs text-muted-foreground">Content coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card rounded-xl border overflow-hidden transition-shadow",
        isComplete ? "border-primary/30" : isOpen ? "border-primary shadow-md" : "border-border"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold shrink-0",
            isComplete ? "bg-primary/15 text-primary" : "bg-primary text-primary-foreground"
          )}
        >
          {isComplete ? <Check className="w-5 h-5" /> : weekNum}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold">Week {weekNum}</p>
          <p className="text-xs text-muted-foreground">
            {completedCount} of {DAYS_PER_WEEK} days complete
          </p>
        </div>
        {/* Progress bar */}
        <div className="hidden sm:block w-32 h-2 rounded-full bg-muted overflow-hidden shrink-0">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(completedCount / DAYS_PER_WEEK) * 100}%` }}
          />
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-2">
          {DAY_SCHEDULE.map((dayInfo) => {
            const mod = weekData[dayInfo.day];
            const dayComplete =
              mod && progress.some((p) => p.module_id === mod.id && p.completed);
            return (
              <DayModule
                key={dayInfo.day}
                dayInfo={dayInfo}
                mod={mod}
                isComplete={dayComplete}
                onToggleComplete={onToggleComplete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}