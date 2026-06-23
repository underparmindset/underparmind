import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { User, Mail, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const COACHING_PRICE_ID = "price_1TlcpiDAmkJ2t1TLxnJ2w4wY";

const SESSIONS = [
  {
    id: "mental-coaching",
    name: "Mental Coaching",
    duration: "60 Minutes",
    price: "$99",
    description: "Private one-on-one coaching tailored to your junior golfer's mental game.",
    highlight: true,
  },
  {
    id: "tournament-strategy",
    name: "Tournament Strategy Session",
    duration: "60 Minutes",
    price: "$99",
    description: "We'll discuss the best tournaments for your junior to play, how to gain rankings, and earn points in tournaments that matter.",
    highlight: false,
  },
  {
    id: "parent-coaching",
    name: "Parent Coaching",
    duration: "60 Minutes",
    price: "$99",
    description: "How to be the best advocate for your junior golfer. Best practices for encouraging and helping your junior golfer through the process.",
    highlight: false,
  },
];

export default function Coaching() {
  const [loadingSession, setLoadingSession] = useState(null);
  const [error, setError] = useState("");
  const inIframe = window.self !== window.top;

  const handleCheckout = async (session) => {
    if (inIframe) {
      setError("Checkout only works from the published app. Please open the app in a new tab to book a session.");
      return;
    }
    setError("");
    setLoadingSession(session.id);
    try {
      const response = await base44.functions.invoke("createCheckoutSession", {
        priceId: COACHING_PRICE_ID,
        tier: session.name,
        mode: "payment",
      });
      window.location.href = response.data.url;
    } catch (err) {
      setError(err.message || "Failed to start checkout. Please try again.");
      setLoadingSession(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Mental Performance Coaching</h1>
        <p className="text-muted-foreground text-sm mt-1">From stuck to unstoppable: change your mindset</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive-foreground">{error}</p>
        </div>
      )}

      {/* Coach profile */}
      <div className="bg-card rounded-xl border border-border p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="font-display font-bold text-xl">UnderParMindset Coaching</h2>
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
        <Button onClick={() => handleCheckout(SESSIONS[0])} disabled={loadingSession !== null} className="bg-primary hover:bg-primary/90 flex-shrink-0">
          <Mail className="w-4 h-4 mr-1.5" /> Book a Session
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
              <h3 className="font-display font-bold text-lg">{session.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-2xl font-display font-bold">{session.price}</span>
                <span className="text-muted-foreground text-sm"> /session</span>
              </div>
              {session.duration && (
                <span className="inline-block text-xs font-semibold bg-accent/15 text-accent px-2.5 py-0.5 rounded-full self-start">
                  {session.duration}
                </span>
              )}
              <p className="text-sm text-muted-foreground mt-3 flex-1">{session.description}</p>
              <Button
                variant={session.highlight ? "default" : "outline"}
                className={cn("mt-6 w-full", session.highlight && "bg-primary hover:bg-primary/90")}
                onClick={() => handleCheckout(session)}
                disabled={loadingSession !== null}
              >
                {loadingSession === session.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  "Book This Session"
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}