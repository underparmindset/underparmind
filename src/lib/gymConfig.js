import { Brain, Repeat, Target, ShieldCheck, Sparkles } from "lucide-react";

export const DAY_SCHEDULE = [
  { day: 1, label: "Monday", category: "Mindset", icon: Brain, description: "Train your inner mindset" },
  { day: 2, label: "Tuesday", category: "Routine", icon: Repeat, description: "Build consistent routines" },
  { day: 3, label: "Wednesday", category: "Focus", icon: Target, description: "Sharpen on-course focus" },
  { day: 4, label: "Thursday", category: "Resilience", icon: ShieldCheck, description: "Develop mental resilience" },
  { day: 5, label: "Friday", category: "Confidence", icon: Sparkles, description: "Grow self-confidence" },
];

export const TOTAL_WEEKS = 52;
export const DAYS_PER_WEEK = 5;

export function getDayInfo(dayNum) {
  return DAY_SCHEDULE.find((d) => d.day === dayNum);
}