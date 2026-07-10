import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import ModuleMedia from "@/components/gym/ModuleMedia";

export default function DayModule({ dayInfo, mod, isComplete, onToggleComplete }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = dayInfo.icon;

  if (!mod) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-dashed border-border">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            Day {dayInfo.day} · {dayInfo.label}
          </p>
          <p className="text-xs text-muted-foreground/70">{dayInfo.category} — Content coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-colors",
        isComplete ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            isComplete ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{mod.title}</p>
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2 mt-0.5">
            {mod.summary}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground hidden sm:inline">
            {dayInfo.category}
          </span>
          {mod.video_url && !expanded && <PlayCircle className="w-4 h-4 text-primary" />}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-border pt-3 space-y-3">
          <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
            {mod.summary}
          </p>
          <div className="prose prose-sm max-w-none text-foreground text-sm leading-relaxed">
            <ReactMarkdown>{mod.content}</ReactMarkdown>
          </div>
          <ModuleMedia mod={mod} />
          <Button
            onClick={() => onToggleComplete(mod.id)}
            variant={isComplete ? "ghost" : "default"}
            size="sm"
            className="mt-3"
          >
            {isComplete ? "Mark as incomplete" : "Mark complete"}
          </Button>
        </div>
      )}
    </div>
  );
}