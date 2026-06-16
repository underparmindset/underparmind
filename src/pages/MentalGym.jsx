import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { generateInsights } from "@/lib/calculations";

const MODULES = [
  {
    id: "bounce_back",
    title: "Bounce-Back Mastery",
    summary: "Turn bogeys into comebacks",
    content: `After a bad hole, your brain replays the mistake. The key is a physical reset: take 3 deep breaths, pick a spot 30 yards ahead, and walk to it as your "reset line." Once you cross it, the last hole is gone.\n\nPractice drill: On the range, intentionally hit 3 bad shots, then use your reset routine before the next one. Train the transition, not just the swing.\n\nKey principle: The best players don't avoid bogeys — they avoid consecutive bogeys.`
  },
  {
    id: "pre_shot_routine",
    title: "Pre-Shot Routine Builder",
    summary: "Lock in consistency before every shot",
    content: `A pre-shot routine is your anchor. It should take 15-20 seconds and include:\n\n1. Stand behind the ball — pick your target line\n2. Take one practice swing (feel the shot)\n3. Step in, align your feet\n4. One deep breath\n5. Look at target, look at ball, go\n\nThe routine should feel automatic. Practice it on every range ball. In competition, commit to using it 100% of the time.\n\nWhen you feel pressure building, slow the routine by 10% — don't skip steps.`
  },
  {
    id: "late_round_focus",
    title: "Closing Strong",
    summary: "Dominate the last 6 holes",
    content: `Mental fatigue hits around hole 12-13. Your decision-making suffers before your swing does.\n\nStrategies:\n• Eat a snack after hole 12 — blood sugar matters\n• Simplify your game plan: aim for the center of every green\n• Use a focus word on each tee (e.g., "committed," "smooth")\n• Count backwards from 5 before each shot to reset attention\n\nThe final 6 holes are where tournaments are won. Practice them separately in your mind — visualize closing out strong.`
  },
  {
    id: "first_tee_calm",
    title: "First-Tee Confidence",
    summary: "Start every round calm and ready",
    content: `First-tee nerves are normal — even pros feel them. The difference is preparation.\n\n1. Arrive 45 min early. Warm up your body, not just your swing.\n2. Hit 10 shots on the range with your first-tee club.\n3. On the tee, use box breathing: 4 counts in, 4 hold, 4 out, 4 hold.\n4. Pick a conservative target. Your goal on hole 1 is to make par, not birdie.\n5. Tell yourself: "This is just another shot in a long round."\n\nNerves are excitement mislabeled. Reframe them: "I'm ready for this."`,
  },
  {
    id: "visualization",
    title: "Visualization Training",
    summary: "See the shot before you hit it",
    content: `Elite golfers visualize every shot before they hit it. This isn't wishful thinking — it's a neural rehearsal.\n\nDaily practice (10 minutes):\n1. Close your eyes. Pick a hole you know well.\n2. See yourself standing on the tee. Feel the club in your hands.\n3. Watch the ball flight in your mind — see it land exactly where you want.\n4. Move through all 18 holes if you can.\n\nBefore competition: Visualize your first 3 holes in detail the night before. Include your routine, your walk, your confidence.`
  },
  {
    id: "self_talk",
    title: "Self-Talk Mastery",
    summary: "Control your inner voice",
    content: `You talk to yourself more than anyone else. Make it count.\n\nTypes of self-talk:\n• Instructional: "Smooth tempo" (for technique)\n• Motivational: "You've got this" (for confidence)\n• Reframing: "This is a chance to show what I've practiced" (for pressure)\n\nRules:\n1. Never say "don't" — your brain can't process negatives. Say "hit the fairway" not "don't go right."\n2. Keep it short — one phrase, not a paragraph.\n3. Use first or second person: "I am" or "You've got this" — both work.\n\nExercise: Write down 3 things you commonly say after bad shots. Replace each with a better version.`
  },
];

export default function MentalGym() {
  const queryClient = useQueryClient();
  const [openModule, setOpenModule] = useState(null);

  const { data: progress = [] } = useQuery({
    queryKey: ["moduleProgress"],
    queryFn: () => base44.entities.ModuleProgress.list(),
  });

  const { data: rounds = [] } = useQuery({
    queryKey: ["rounds"],
    queryFn: () => base44.entities.Round.list("-date", 50),
  });

  const insights = generateInsights(rounds);
  const priorityModuleIds = insights.map(i => i.moduleLink);

  // Sort: priority first, then incomplete, then complete
  const sortedModules = [...MODULES].sort((a, b) => {
    const aPriority = priorityModuleIds.includes(a.id) ? 0 : 1;
    const bPriority = priorityModuleIds.includes(b.id) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    const aComplete = progress.some(p => p.module_id === a.id && p.completed);
    const bComplete = progress.some(p => p.module_id === b.id && p.completed);
    return aComplete === bComplete ? 0 : aComplete ? 1 : -1;
  });

  const toggleComplete = async (moduleId) => {
    const existing = progress.find(p => p.module_id === moduleId);
    if (existing) {
      await base44.entities.ModuleProgress.update(existing.id, {
        completed: !existing.completed,
        completed_date: !existing.completed ? format(new Date(), "yyyy-MM-dd") : null,
      });
    } else {
      await base44.entities.ModuleProgress.create({
        module_id: moduleId,
        completed: true,
        completed_date: format(new Date(), "yyyy-MM-dd"),
      });
    }
    queryClient.invalidateQueries({ queryKey: ["moduleProgress"] });
    toast.success("Progress updated!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Mental Gym</h1>
        <p className="text-muted-foreground text-sm mt-1">Build your mental game — one module at a time</p>
      </div>

      <div className="space-y-3">
        {sortedModules.map((mod) => {
          const isComplete = progress.some(p => p.module_id === mod.id && p.completed);
          const isPriority = priorityModuleIds.includes(mod.id);
          const isOpen = openModule === mod.id;

          return (
            <div key={mod.id} className={cn(
              "bg-card rounded-xl border overflow-hidden transition-shadow",
              isPriority ? "border-destructive/30 shadow-sm" : "border-border"
            )}>
              <button
                onClick={() => setOpenModule(isOpen ? null : mod.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold">{mod.title}</h3>
                    {isPriority && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Priority
                      </span>
                    )}
                    {isComplete && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary flex items-center gap-1">
                        <Check className="w-3 h-3" /> Complete
                      </span>
                    )}
                    {!isComplete && !isPriority && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Not started</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{mod.summary}</p>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-border pt-4">
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line text-sm leading-relaxed">
                    {mod.content}
                  </div>
                  <Button
                    onClick={() => toggleComplete(mod.id)}
                    variant={isComplete ? "ghost" : "default"}
                    className="mt-4"
                  >
                    {isComplete ? "Mark as incomplete" : "Mark complete"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}