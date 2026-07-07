import { Star, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModuleRow({ mod, dayInfo, onEdit, onDelete, onToggleFeatured }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border",
        mod.is_featured ? "border-accent/40 bg-accent/5" : "border-border bg-card"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {dayInfo && (
            <span className="text-[10px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Day {dayInfo.day}
            </span>
          )}
          <span className="font-display font-bold text-sm">{mod.title}</span>
          {mod.is_featured && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent flex items-center gap-1">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
          {mod.category && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-secondary-foreground">
              {mod.category}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{mod.summary}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggleFeatured(mod)}
          title={mod.is_featured ? "Unfeature" : "Feature this module"}
          className={cn(
            "p-1.5 rounded-lg hover:bg-accent/10 transition-colors",
            mod.is_featured ? "text-accent" : "text-muted-foreground"
          )}
        >
          <Star className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(mod)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(mod.id)}
          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}