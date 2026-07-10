import { Flame, Zap, ShieldCheck, Crown, Star, Award, Trophy, Medal, Target } from "lucide-react";

// Badges for consecutive days completing at least one mental gym module
export const STREAK_BADGES = [
  { id: "streak_3", name: "Getting Started", description: "3-day streak", icon: Flame, threshold: 3, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "streak_5", name: "Perfect Week", description: "5-day streak", icon: Zap, threshold: 5, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: "streak_10", name: "Double Digits", description: "10-day streak", icon: Flame, threshold: 10, color: "text-orange-600", bg: "bg-orange-600/10" },
  { id: "streak_21", name: "Habit Former", description: "21-day streak", icon: ShieldCheck, threshold: 21, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "streak_30", name: "Monthly Master", description: "30-day streak", icon: Crown, threshold: 30, color: "text-purple-500", bg: "bg-purple-500/10" },
];

// Badges for completing full weeks (all 5 daily modules done)
export const WEEKLY_BADGES = [
  { id: "week_1", name: "First Week Down", description: "Complete Week 1", icon: Star, threshold: 1, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "week_4", name: "Monthly Mastery", description: "Complete 4 weeks", icon: Award, threshold: 4, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "week_13", name: "Quarter Champion", description: "Complete 13 weeks", icon: Trophy, threshold: 13, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "week_26", name: "Halfway Hero", description: "Complete 26 weeks", icon: Medal, threshold: 26, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "week_52", name: "52-Week Legend", description: "Complete all 52 weeks", icon: Crown, threshold: 52, color: "text-yellow-500", bg: "bg-yellow-500/10" },
];

// Badges for completing goals
export const GOAL_BADGES = [
  { id: "goal_1", name: "First Win", description: "Complete your first goal", icon: Target, threshold: 1, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "goal_5", name: "Goal Getter", description: "Complete 5 goals", icon: Trophy, threshold: 5, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "goal_10", name: "Unstoppable", description: "Complete 10 goals", icon: Zap, threshold: 10, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "goal_25", name: "Champion", description: "Complete 25 goals", icon: Crown, threshold: 25, color: "text-purple-500", bg: "bg-purple-500/10" },
];

export const ALL_BADGES = [...STREAK_BADGES, ...WEEKLY_BADGES, ...GOAL_BADGES];