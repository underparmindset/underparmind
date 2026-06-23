import { Button } from "@/components/ui/button";
import { User, Mail, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Train",
    price: "$19",
    period: "/mo",
    features: ["Mental Gym access", "Daily Focus tools", "Performance journal", "Dashboard analytics"],
    highlight: false,
  },
  {
    name: "Compete",
    price: "$79",
    period: "/mo",
    features: ["Everything in Train", "2 coaching sessions/month", "Personalized insights", "Goal review calls", "Priority support"],
    highlight: true,
  },
  {
    name: "Tour Track",
    price: "$249",
    period: "/mo",
    features: ["Everything in Compete", "Weekly 1-on-1 sessions", "Tournament prep plans", "Parent/coach dashboards", "Direct coach access"],
    highlight: false,
  },
];

export default function Coaching() {
  const requestSession = () => {
    toast.success("Session request sent! We'll be in touch shortly.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Coaching</h1>
        <p className="text-muted-foreground text-sm mt-1">Take your mental game to the next level</p>
      </div>

      {/* Coach profile */}
      <div className="bg-card rounded-xl border border-border p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="font-display font-bold text-xl">UnderParMind Coaching</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Certified mental performance coach specializing in junior golfers.
            Helping players aged 13 and up build the mental habits that win tournaments.
          </p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">Mental Performance</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent/15 text-accent">Junior Golf</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">Tournament Prep</span>
          </div>
        </div>
        <Button onClick={requestSession} className="bg-primary hover:bg-primary/90 flex-shrink-0">
          <Mail className="w-4 h-4 mr-1.5" /> Request a Session
        </Button>
      </div>

      {/* Pricing */}
      <div>
        <h2 className="font-display font-bold text-xl mb-4 text-center">Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.name} className={cn(
              "bg-card rounded-xl border p-6 flex flex-col",
              plan.highlight ? "border-primary shadow-lg ring-2 ring-primary/10" : "border-border"
            )}>
              {plan.highlight && (
                <span className="text-[10px] font-bold uppercase bg-primary text-primary-foreground px-3 py-1 rounded-full self-start mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="font-display font-bold text-lg">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-display font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? "default" : "outline"}
                className={cn("mt-6 w-full", plan.highlight && "bg-primary hover:bg-primary/90")}
                onClick={requestSession}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}