import { Link2, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GHINConnect() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-lg">GHIN Integration</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          <Clock className="w-3 h-3" /> Coming Soon
        </span>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Connect your <span className="font-semibold text-foreground">GHIN account</span> to automatically sync your scores, handicap index, and round statistics — no more manual entry.
        </p>
        <ul className="space-y-2">
          {[
            "Auto-import scores after every round",
            "Sync handicap index in real time",
            "Pull hole-by-hole stats from GHIN",
            "Map GHIN rounds to your mental performance data",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <Button disabled className="w-full opacity-60 cursor-not-allowed" variant="outline">
          <Link2 className="w-4 h-4 mr-2" /> Connect GHIN Account — Coming Soon
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          GHIN is the official handicap system of the USGA.{" "}
          <a
            href="https://www.ghin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-0.5"
          >
            Learn more <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  );
}