import { cn } from "@/lib/utils";

export default function StatCard({ label, value, subtitle, icon: Icon, variant = "default" }) {
  return (
    <div className={cn(
      "bg-card rounded-xl border border-border p-4 flex flex-col gap-1 relative overflow-hidden transition-shadow hover:shadow-md",
      variant === "accent" && "border-accent/30"
    )}>
      {Icon && (
        <div className="absolute top-3 right-3 text-muted-foreground/30">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn(
        "text-2xl md:text-3xl font-display font-bold",
        variant === "accent" ? "text-accent" : "text-foreground"
      )}>{value}</span>
      {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
    </div>
  );
}