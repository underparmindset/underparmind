import { Crosshair, Sparkles, Wind, Repeat, ShieldCheck } from "lucide-react";

export const DAY_SCHEDULE = [
  { day: 1, label: "Monday", category: "Focus", icon: Crosshair, description: "Focus & Concentration", metric: "focus6_rating" },
  { day: 2, label: "Tuesday", category: "Confidence", icon: Sparkles, description: "Confidence & Self-Talk", metric: "MPS trend + affirmation streak" },
  { day: 3, label: "Wednesday", category: "Composure", icon: Wind, description: "Composure & Emotional Control", metric: "calm_rating" },
  { day: 4, label: "Thursday", category: "Commitment", icon: Repeat, description: "Commitment & Routine", metric: "routine_pct" },
  { day: 5, label: "Friday", category: "Resilience", icon: ShieldCheck, description: "Resilience & Bounce-Back", metric: "reset_rating" },
];

export const TOTAL_WEEKS = 52;
export const DAYS_PER_WEEK = 5;

export const PHASES = [
  { id: "Foundation", roman: "I", startWeek: 1, endWeek: 13, description: "Learn the vocabulary and baseline skills of all five pillars" },
  { id: "Application", roman: "II", startWeek: 14, endWeek: 26, description: "Move skills from the living room to the course" },
  { id: "Pressure", roman: "III", startWeek: 27, endWeek: 39, description: "Manufacture tournament-level pressure in training" },
  { id: "Mastery", roman: "IV", startWeek: 40, endWeek: 52, description: "Transfer ownership — become your own mental coach" },
];

export const ASSESSMENT_WEEKS = [13, 26, 39, 52];

export function getPhaseForWeek(weekNum) {
  return PHASES.find((p) => weekNum >= p.startWeek && weekNum <= p.endWeek);
}

export function isAssessmentWeek(weekNum) {
  return ASSESSMENT_WEEKS.includes(weekNum);
}

export function getDayInfo(dayNum) {
  return DAY_SCHEDULE.find((d) => d.day === dayNum);
}