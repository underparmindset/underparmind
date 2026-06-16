import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function ChecklistItem({ label, done, linkTo }) {
  return (
    <Link to={linkTo} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
        done ? "bg-primary border-primary" : "border-border"
      )}>
        {done && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
      </div>
      <span className={cn("text-sm font-medium", done ? "text-muted-foreground line-through" : "text-foreground")}>{label}</span>
      {done && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Done</span>}
      {!done && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">Due today</span>}
    </Link>
  );
}