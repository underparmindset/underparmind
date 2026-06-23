import { Button } from "@/components/ui/button";
import { User, Mail, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SESSIONS = [
  {
    name: "Mental Coaching",
    duration: "60 Minutes",
    description: "Private one-on-one coaching tailored to your junior golfer's mental game.",
    highlight: true,
  },
  {
    name: "Tournament Strategy Session",
    duration: "60 Minutes",
    description: "We'll discuss the best tournaments for your junior to play, how to gain rankings, and earn points in tournaments that matter.",
    highlight: false,
  },
  {
    name: "Parent Coaching",
    duration: null,
    description: "How to be the best advocate for your junior golfer. Best practices for encouraging and helping your junior golfer through the process.",
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

      {/* Coaching Sessions */}
      <div>
        <h2 className="font-display font-bold text-xl mb-4 text-center">Coaching Options</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {SESSIONS.map((session) => (
            <div key={session.name} className={cn(
              "bg-card rounded-xl border p-6 flex flex-col",
              session.highlight ? "border-primary shadow-lg ring-2 ring-primary/10" : "border-border"
            )}>
              {session.highlight && (
                <span className="text-[10px] font-bold uppercase bg-primary text-primary-foreground px-3 py-1 rounded-full self-start mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="font-display font-bold text-lg">{session.name}</h3>
              {session.duration && (
                <span className="inline-block mt-2 text-xs font-semibold bg-accent/15 text-accent px-2.5 py-0.5 rounded-full self-start">
                  {session.duration}
                </span>
              )}
              <p className="text-sm text-muted-foreground mt-3 flex-1">{session.description}</p>
              <Button
                variant={session.highlight ? "default" : "outline"}
                className={cn("mt-6 w-full", session.highlight && "bg-primary hover:bg-primary/90")}
                onClick={requestSession}
              >
                Request a Session
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}