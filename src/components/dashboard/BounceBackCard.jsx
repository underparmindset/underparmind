import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BounceBackCard({ bounceBack }) {
  const { bounceBacks, opportunities, percentage } = bounceBack;

  const hasData = percentage !== null;
  const isStrong = hasData && percentage >= 50;
  const needsWork = hasData && percentage < 35;

  return (
    <div className={cn(
      "bg-card rounded-xl border p-5 flex items-center gap-4",
      needsWork ? "border-accent/40" : "border-border"
    )}>
      <div className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0",
        !hasData ? "bg-muted" : isStrong ? "bg-primary/10" : needsWork ? "bg-accent/15" : "bg-primary/10"
      )}>
        <RefreshCw className={cn(
          "w-6 h-6",
          !hasData ? "text-muted-foreground/40" : isStrong ? "text-primary" : needsWork ? "text-accent" : "text-primary"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-base">Bounce Back Rate</h3>
        {hasData ? (
          <>
            <p className="text-2xl font-display font-bold text-foreground leading-tight">
              {percentage}%<span className="text-sm font-normal text-muted-foreground ml-1.5">({bounceBacks}/{opportunities})</span>
            </p>
            <p className={cn(
              "text-xs font-medium mt-0.5",
              isStrong ? "text-primary" : needsWork ? "text-accent" : "text-muted-foreground"
            )}>
              {isStrong
                ? "Strong recovery — you bounce back well after a bad hole."
                : needsWork
                  ? "Area to work on — bogeys are stacking. Build your reset routine."
                  : "Decent recovery — keep sharpening your bounce-back mindset."}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Log rounds with hole-by-hole scores to track your recovery.</p>
        )}
      </div>
    </div>
  );
}