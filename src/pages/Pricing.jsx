import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$99.99",
    period: "/month",
    description: "Month-to-month, cancel anytime",
    priceId: "price_1TlyeLRluJwLogLmSM4I8uy8",
    features: [
      "Full access to all mental training tools",
      "Daily focus & journaling",
      "Round logging & performance analytics",
      "Mental Gym weekly content",
      "Cancel anytime — no long-term contract",
    ],
  },
  {
    id: "quarterly",
    name: "3-Month",
    price: "$239.97",
    period: "/3 months",
    description: "20% discount — paid in full upfront",
    priceId: "price_1TlyeKRluJwLogLmVEPJdkPo",
    badge: "Save 20%",
    features: [
      "Everything in Monthly",
      "20% discount vs. month-to-month",
      "Billed once per quarter",
      "Ideal for a tournament season",
    ],
  },
  {
    id: "annual",
    name: "Annual",
    price: "$599.94",
    period: "/year",
    description: "50% discount — paid in full upfront",
    priceId: "price_1TlyeKRluJwLogLmUivbCGOM",
    badge: "Save 50%",
    popular: true,
    features: [
      "Everything in 3-Month",
      "Best value — 50% off vs. monthly",
      "Billed once per year",
      "Locked in for the full season",
    ],
  },
];

export default function Pricing() {
  const [loadingTier, setLoadingTier] = useState(null);
  const [error, setError] = useState("");
  const inIframe = window.self !== window.top;

  const handleCheckout = async (plan) => {
    if (inIframe) {
      setError("Checkout only works from the published app. Please open the app in a new tab to subscribe.");
      return;
    }
    setError("");
    setLoadingTier(plan.id);
    try {
      const response = await base44.functions.invoke("createCheckoutSession", {
        priceId: plan.priceId,
        tier: plan.id,
      });
      window.location.href = response.data.url;
    } catch (err) {
      setError(err.message || "Failed to start checkout. Please try again.");
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-display font-bold text-2xl">U</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">Choose Your Plan</h1>
          <p className="text-primary-foreground/70 mt-2">Train your mind like you train your swing.</p>
        </div>

        {inIframe && (
          <div className="mb-6 p-4 rounded-xl bg-accent/20 border border-accent/40 flex items-start gap-3 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-primary-foreground/90">
              Checkout only works from the published app. To test payments, open the app in a new tab.
            </p>
          </div>
        )}

        {error && !inIframe && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 flex items-start gap-3 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "bg-card rounded-2xl p-6 flex flex-col relative shadow-lg",
                plan.popular && "border-2 border-accent ring-2 ring-accent/20 md:scale-105"
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wide">
                  {plan.badge}
                </span>
              )}
              <h2 className="font-display font-bold text-xl">{plan.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              <div className="mt-4 mb-5">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleCheckout(plan)}
                disabled={loadingTier !== null}
                className={cn(
                  "w-full h-12 font-semibold",
                  plan.popular ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-primary hover:bg-primary/90"
                )}
              >
                {loadingTier === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  `Choose ${plan.name}`
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-primary-foreground/60 text-sm flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}