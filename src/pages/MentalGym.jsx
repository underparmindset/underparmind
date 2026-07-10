import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dumbbell, TrendingUp } from "lucide-react";
import WeekCard from "@/components/gym/WeekCard";
import BadgeGrid from "@/components/gym/BadgeGrid";
import { calculateDayStreak, calculateWeeksCompleted, getNewlyEarnedBadges } from "@/lib/badgeCalculations";
import { DAY_SCHEDULE, TOTAL_WEEKS, DAYS_PER_WEEK, getPhaseForWeek } from "@/lib/gymConfig";

export default function MentalGym() {
  const queryClient = useQueryClient();
  const [openWeek, setOpenWeek] = useState(null);

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["gymModules"],
    queryFn: () => base44.entities.GymModule.list("order", 500),
    staleTime: 0,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["moduleProgress"],
    queryFn: () => base44.entities.ModuleProgress.list(),
  });

  // Build week -> { day -> module } map
  const weeksMap = new Map();
  modules.forEach((m) => {
    if (!m.week_number) return;
    if (!weeksMap.has(m.week_number)) weeksMap.set(m.week_number, {});
    weeksMap.get(m.week_number)[m.day_number] = m;
  });

  const weekNumbers = [...weeksMap.keys()].sort((a, b) => a - b);
  const maxWeekWithContent = weekNumbers.length > 0 ? Math.max(...weekNumbers) : 0;

  const getWeekStatus = (weekNum) => {
    const weekData = weeksMap.get(weekNum);
    if (!weekData) return { status: "coming_soon", completed: 0 };
    let completed = 0;
    const allDaysPresent = DAY_SCHEDULE.every((d) => weekData[d.day]);
    DAY_SCHEDULE.forEach((d) => {
      const mod = weekData[d.day];
      if (mod && progress.some((p) => p.module_id === mod.id && p.completed)) completed++;
    });
    if (allDaysPresent && completed === DAYS_PER_WEEK)
      return { status: "complete", completed };
    return { status: "in_progress", completed };
  };

  const isWeekUnlocked = (weekNum) => {
    if (weekNum === 1) return true;
    for (let w = 1; w < weekNum; w++) {
      if (getWeekStatus(w).status !== "complete") return false;
    }
    return true;
  };

  // Find current week (first non-complete week with content)
  let currentWeek = null;
  for (const w of weekNumbers) {
    if (getWeekStatus(w).status !== "complete") {
      currentWeek = w;
      break;
    }
  }

  // Auto-expand current week on load
  useEffect(() => {
    if (currentWeek && openWeek === null) {
      setOpenWeek(currentWeek);
    }
  }, [currentWeek, openWeek]);

  // Weeks to display: 1 through maxWeekWithContent + 1 (next locked/coming-soon)
  const lastWeekToShow = Math.min(maxWeekWithContent + 1, TOTAL_WEEKS);
  const weeksToShow =
    maxWeekWithContent > 0
      ? Array.from({ length: lastWeekToShow }, (_, i) => i + 1)
      : [];

  const toggleComplete = async (moduleId) => {
    const existing = progress.find((p) => p.module_id === moduleId);
    const today = format(new Date(), "yyyy-MM-dd");

    // Compute what progress will look like after the toggle
    let newProgress;
    if (existing) {
      newProgress = progress.map((p) =>
        p.module_id === moduleId
          ? { ...p, completed: !p.completed, completed_date: !p.completed ? today : null }
          : p
      );
    } else {
      newProgress = [...progress, { module_id: moduleId, completed: true, completed_date: today }];
    }

    // Check for newly earned badges
    const newBadges = getNewlyEarnedBadges(modules, progress, newProgress);

    if (existing) {
      await base44.entities.ModuleProgress.update(existing.id, {
        completed: !existing.completed,
        completed_date: !existing.completed ? today : null,
      });
    } else {
      await base44.entities.ModuleProgress.create({
        module_id: moduleId,
        completed: true,
        completed_date: today,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["moduleProgress"] });

    if (newBadges.length > 0) {
      newBadges.forEach((b) => toast.success(`🏅 Badge earned: ${b.name}!`));
    } else {
      toast.success("Progress updated!");
    }
  };

  const totalCompleted = progress.filter((p) => p.completed).length;
  const dayStreak = calculateDayStreak(progress);
  const weeksCompletedCount = calculateWeeksCompleted(modules, progress);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        Loading your training program...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
          <Dumbbell className="w-7 h-7 text-primary" /> Mental Gym
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          52-week mental training program — complete each week to unlock the next
        </p>
      </div>

      {/* Overall progress summary */}
      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold">
            {currentWeek
              ? `Week ${currentWeek} — In Progress`
              : maxWeekWithContent > 0
              ? "All caught up!"
              : "Let's begin!"}
          </p>
          <p className="text-xs text-muted-foreground">
            {(() => {
              const phaseInfo = getPhaseForWeek(currentWeek || maxWeekWithContent || 1);
              return phaseInfo ? `Phase ${phaseInfo.roman} — ${phaseInfo.id} · ` : "";
            })()}
            {totalCompleted} modules completed
            {maxWeekWithContent > 0 ? ` across ${maxWeekWithContent} week${maxWeekWithContent > 1 ? "s" : ""}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-display font-bold text-primary">
            {currentWeek || maxWeekWithContent || 0}
          </p>
          <p className="text-[10px] uppercase text-muted-foreground">of {TOTAL_WEEKS}</p>
        </div>
      </div>

      {/* Week cards or empty state */}
      {maxWeekWithContent === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
          <Dumbbell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold">Your 52-week journey starts here</p>
          <p className="text-sm mt-1">
            Your coach will be adding weekly training content soon. Check back!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {weeksToShow.map((weekNum) => (
            <WeekCard
              key={weekNum}
              weekNum={weekNum}
              weekData={weeksMap.get(weekNum)}
              status={getWeekStatus(weekNum)}
              unlocked={isWeekUnlocked(weekNum)}
              progress={progress}
              isOpen={openWeek === weekNum}
              onToggle={() => setOpenWeek(openWeek === weekNum ? null : weekNum)}
              onToggleComplete={toggleComplete}
            />
          ))}
        </div>
      )}

      {/* Badges */}
      <div className="pt-2 border-t border-border">
        <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
          🏅 Your Badges
        </h2>
        <BadgeGrid streak={dayStreak} weeksCompleted={weeksCompletedCount} />
      </div>
    </div>
  );
}