// Mental Performance Score from last 5 rounds
export function calculateMPS(rounds) {
  if (!rounds || rounds.length === 0) return 0;
  const recent = rounds.slice(0, 5);
  const mentalScores = recent.map(r => {
    const calm = r.calm_rating || 0;
    const reset = r.reset_rating || 0;
    const focus6 = r.focus6_rating || 0;
    return ((calm + reset + focus6) / 30) * 100;
  });
  const avgMental = mentalScores.reduce((a, b) => a + b, 0) / mentalScores.length;
  const avgRoutine = recent.reduce((a, r) => a + (r.routine_pct || 0), 0) / recent.length;
  return Math.round(0.6 * avgMental + 0.4 * avgRoutine);
}

// Focus streak
export function calculateFocusStreak(reports) {
  if (!reports || reports.length === 0) return 0;
  const sorted = [...reports]
    .filter(r => r.submitted)
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date));

  if (sorted.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const reportDate = new Date(sorted[i].report_date);
    reportDate.setHours(0, 0, 0, 0);

    if (reportDate.getTime() === expected.getTime()) {
      streak++;
    } else if (i === 0) {
      // Today not submitted yet, check from yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (reportDate.getTime() === yesterday.getTime()) {
        streak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return streak;
}

// Generate insights from rounds
export function generateInsights(rounds) {
  if (!rounds || rounds.length < 3) return [];
  const insights = [];

  const avgReset = rounds.reduce((a, r) => a + (r.reset_rating || 0), 0) / rounds.length;
  const avgRoutine = rounds.reduce((a, r) => a + (r.routine_pct || 0), 0) / rounds.length;
  const avgFocus6 = rounds.reduce((a, r) => a + (r.focus6_rating || 0), 0) / rounds.length;
  const avgCalm = rounds.reduce((a, r) => a + (r.calm_rating || 0), 0) / rounds.length;

  if (avgReset < 6) {
    insights.push({
      headline: "Bounce-Back Opportunity",
      detail: `Your reset rating averages ${avgReset.toFixed(1)}/10 — bogeys may be coming in pairs. Let's build a better recovery routine.`,
      moduleLink: "bounce_back"
    });
  }
  if (avgRoutine < 70) {
    insights.push({
      headline: "Pre-Shot Routine Gap",
      detail: `You're completing your routine only ${avgRoutine.toFixed(0)}% of the time. Consistency here is your quickest win.`,
      moduleLink: "pre_shot_routine"
    });
  }
  if (avgFocus6 < 6.5) {
    insights.push({
      headline: "Late-Round Focus Fade",
      detail: `Focus over the last 6 holes averages ${avgFocus6.toFixed(1)}/10. Let's strengthen your closing mindset.`,
      moduleLink: "late_round_focus"
    });
  }
  if (avgCalm < 6) {
    insights.push({
      headline: "First-Tee Nerves",
      detail: `Your first-tee calm rating is ${avgCalm.toFixed(1)}/10. A solid warm-up routine can change everything.`,
      moduleLink: "first_tee_calm"
    });
  }

  return insights.slice(0, 3);
}

// Badge rules
export function calculateBadges(rounds, focusStreak, goals) {
  const badges = [];
  if (rounds.length >= 1) badges.push({ label: "First Round", color: "green" });
  if (rounds.length >= 10) badges.push({ label: "10 Rounds", color: "green" });
  if (rounds.length >= 25) badges.push({ label: "25 Rounds", color: "gold" });
  if (focusStreak >= 3) badges.push({ label: "3-Day Streak", color: "blue" });
  if (focusStreak >= 7) badges.push({ label: "7-Day Streak", color: "gold" });
  if (focusStreak >= 30) badges.push({ label: "30-Day Streak", color: "gold" });
  const hitGoals = goals?.filter(g => g.status === "hit")?.length || 0;
  if (hitGoals >= 1) badges.push({ label: "Goal Crusher", color: "green" });
  if (hitGoals >= 10) badges.push({ label: "10 Goals Hit", color: "gold" });
  return badges;
}

// Journal prompts
export const JOURNAL_PROMPTS = [
  "What does a successful round look like if you never see the score? Describe it in process goals only.",
  "Think of your last pressure moment. What did you say to yourself — and what would a great caddie have said?",
  "What is one thing you did this week that your future self will thank you for?",
  "Describe your perfect pre-shot routine, step by step. Where do you usually skip a step?",
  "After your last bad hole: how long did it stay with you? What would shrink that next time?",
  "What part of your game are you avoiding practicing? Why?",
  "Write about a shot you fully committed to recently. What did commitment feel like?"
];

export function getTodayPrompt() {
  const day = new Date().getDate();
  return JOURNAL_PROMPTS[day % JOURNAL_PROMPTS.length];
}