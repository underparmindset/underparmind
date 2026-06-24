import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Circle, Dumbbell } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function PlayerMentalGym({ playerId }) {
  const { data: allModules = [] } = useQuery({
    queryKey: ["gymModules"],
    queryFn: () => base44.entities.GymModule.list("-created_date", 200),
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ["allModuleProgress"],
    queryFn: () => base44.entities.ModuleProgress.list("-created_date", 500),
  });

  const playerProgress = allProgress.filter((p) => p.created_by_id === playerId);
  const completed = playerProgress.filter((p) => p.completed);
  const inProgress = playerProgress.filter((p) => !p.completed);

  const moduleMap = new Map(allModules.map((m) => [m.id, m]));

  const completedModules = completed
    .map((p) => ({ ...p, module: moduleMap.get(p.module_id) }))
    .filter((p) => p.module)
    .sort((a, b) => new Date(b.completed_date || b.created_date) - new Date(a.completed_date || a.created_date));

  if (allModules.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" /> Mental Gym Progress
        </h2>
        <span className="text-sm font-semibold text-muted-foreground">
          {completed.length} completed
        </span>
      </div>

      {completedModules.length === 0 && inProgress.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-2">
          No mental gym modules started yet.
        </p>
      ) : (
        <div className="space-y-2">
          {completedModules.slice(0, 10).map((p) => (
            <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.module.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {p.module.category}
                  </span>
                  {p.completed_date && (
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(p.completed_date), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {inProgress.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {inProgress.length} module{inProgress.length > 1 ? "s" : ""} in progress
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}