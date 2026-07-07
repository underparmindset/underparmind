import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { STREAK_BADGES, WEEKLY_BADGES } from "@/lib/badgeConfig";

function BadgeItem({ badge, earned }) {
  const Icon = badge.icon;
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all",
        earned ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20 opacity-50 grayscale"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          earned ? cn(badge.bg, badge.color) : "bg-muted"
        )}
      >
        {earned ? (
          <Icon className="w-6 h-6" />
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="text-sm font-display font-bold leading-tight">{badge.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
      </div>
    </div>
  );
}

export default function BadgeGrid({ streak = 0, weeksCompleted = 0 }) {
  const earnedStreak = STREAK_BADGES.filter((b) => streak >= b.threshold).length;
  const earnedWeekly = WEEKLY_BADGES.filter((b) => weeksCompleted >= b.threshold).length;
  const totalEarned = earnedStreak + earnedWeekly;
  const totalBadges = STREAK_BADGES.length + WEEKLY_BADGES.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{totalEarned}</span> of {totalBadges} badges earned
        </p>
      </div>

      {/* Streak badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm flex items-center gap-1.5">
            🔥 Daily Streak Badges
          </h3>
          <span className="text-xs text-muted-foreground">
            Best: {streak} day{streak !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {STREAK_BADGES.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} earned={streak >= badge.threshold} />
          ))}
        </div>
      </div>

      {/* Weekly completion badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm flex items-center gap-1.5">
            🏆 Weekly Completion Badges
          </h3>
          <span className="text-xs text-muted-foreground">
            {weeksCompleted} week{weeksCompleted !== 1 ? "s" : ""} complete
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {WEEKLY_BADGES.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} earned={weeksCompleted >= badge.threshold} />
          ))}
        </div>
      </div>
    </div>
  );
}