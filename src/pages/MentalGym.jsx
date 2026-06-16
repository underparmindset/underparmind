import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Check, AlertTriangle, Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { generateInsights } from "@/lib/calculations";
import ReactMarkdown from "react-markdown";

export default function MentalGym() {
  const queryClient = useQueryClient();
  const [openModule, setOpenModule] = useState(null);

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["gymModules"],
    queryFn: () => base44.entities.GymModule.list("order", 100),
    staleTime: 0,
  });

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

  // Featured first, then priority, then incomplete, then complete
  const sortedModules = [...modules].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        Loading modules...
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Mental Gym</h1>
          <p className="text-muted-foreground text-sm mt-1">Build your mental game — one module at a time</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
          <p className="font-semibold">No modules yet</p>
          <p className="text-sm mt-1">Your coach will be adding weekly content here soon.</p>
        </div>
      </div>
    );
  }

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
              mod.is_featured ? "border-accent/50 shadow-md" : isPriority ? "border-destructive/30 shadow-sm" : "border-border"
            )}>
              <button
                onClick={() => setOpenModule(isOpen ? null : mod.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold">{mod.title}</h3>
                    {mod.week_label && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent flex items-center gap-1">
                        <Star className="w-3 h-3" /> {mod.week_label}
                      </span>
                    )}
                    {mod.category && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-secondary-foreground">
                        {mod.category}
                      </span>
                    )}
                    {isPriority && !mod.is_featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Priority
                      </span>
                    )}
                    {isComplete && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary flex items-center gap-1">
                        <Check className="w-3 h-3" /> Complete
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{mod.summary}</p>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-border pt-4">
                  <div className="prose prose-sm max-w-none text-foreground text-sm leading-relaxed">
                    <ReactMarkdown>{mod.content}</ReactMarkdown>
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