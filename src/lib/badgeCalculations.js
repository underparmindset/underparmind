import { parseISO, differenceInCalendarDays } from "date-fns";
import { STREAK_BADGES, WEEKLY_BADGES } from "./badgeConfig";

/**
 * Calculate the longest streak of consecutive calendar days
 * where at least one module was completed.
 */
export function calculateDayStreak(progress) {
  if (!progress || progress.length === 0) return 0;

  // Unique completed dates, sorted ascending
  const dates = [...new Set(
    progress
      .filter((p) => p.completed && p.completed_date)
      .map((p) => p.completed_date)
  )].sort();

  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInCalendarDays(parseISO(dates[i]), parseISO(dates[i - 1]));
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

/**
 * Count how many weeks have ALL 5 daily modules completed.
 */
export function calculateWeeksCompleted(modules, progress) {
  if (!modules || modules.length === 0) return 0;

  const weeksMap = new Map();
  modules.forEach((m) => {
    if (!m.week_number) return;
    if (!weeksMap.has(m.week_number)) weeksMap.set(m.week_number, {});
    weeksMap.get(m.week_number)[m.day_number] = m;
  });

  let count = 0;
  weeksMap.forEach((weekData) => {
    const allDaysPresent = [1, 2, 3, 4, 5].every((d) => weekData[d]);
    if (!allDaysPresent) return;
    const allComplete = [1, 2, 3, 4, 5].every((d) => {
      const mod = weekData[d];
      return progress.some((p) => p.module_id === mod.id && p.completed);
    });
    if (allComplete) count++;
  });

  return count;
}

/**
 * Returns earned badge objects for both categories.
 */
export function getEarnedBadges(modules, progress) {
  const streak = calculateDayStreak(progress);
  const weeksCompleted = calculateWeeksCompleted(modules, progress);

  return {
    streak,
    weeksCompleted,
    streakBadges: STREAK_BADGES.filter((b) => streak >= b.threshold),
    weeklyBadges: WEEKLY_BADGES.filter((b) => weeksCompleted >= b.threshold),
  };
}

/**
 * Compare old vs new progress and return newly-earned badges.
 */
export function getNewlyEarnedBadges(modules, oldProgress, newProgress) {
  const oldStreak = calculateDayStreak(oldProgress);
  const newStreak = calculateDayStreak(newProgress);
  const oldWeeks = calculateWeeksCompleted(modules, oldProgress);
  const newWeeks = calculateWeeksCompleted(modules, newProgress);

  const newBadges = [];
  STREAK_BADGES.forEach((b) => {
    if (oldStreak < b.threshold && newStreak >= b.threshold) newBadges.push(b);
  });
  WEEKLY_BADGES.forEach((b) => {
    if (oldWeeks < b.threshold && newWeeks >= b.threshold) newBadges.push(b);
  });

  return newBadges;
}