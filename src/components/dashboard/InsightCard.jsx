import { Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function InsightCard({ headline, detail, moduleLink }) {
  return (
    <div className="bg-accent/10 border-l-4 border-accent rounded-r-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-accent">
        <Lightbulb className="w-4 h-4" />
        <span className="font-semibold text-sm">{headline}</span>
      </div>
      <p className="text-sm text-muted-foreground">{detail}</p>
      {moduleLink && (
        <Link to="/mental-gym" className="text-xs text-primary font-medium flex items-center gap-1 mt-1 hover:underline">
          Go to module <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}