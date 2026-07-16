import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import Logo from "@/components/Logo";

const TIER_LABELS = {
  monthly: "Monthly",
  quarterly: "3-Month",
  annual: "Annual",
};

export default function Billing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    base44
      .auth.me()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const response = await base44.functions.invoke("createPortalSession", {});
      window.location.href = response.data.url;
    } catch (err) {
      toast.error(err.data?.error || err.message || "Failed to open billing portal");
      setPortalLoading(false);
    }
  };

  const isActive = user?.subscription_status === "active" || user?.subscription_status === "trialing";
  const isCancelled = user?.subscription_status === "cancelled";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-primary-foreground/80 hover:text-primary-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo className="h-7 w-auto" />
          <span className="text-white font-display font-bold text-lg">Billing</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <>
            {/* Subscription status */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Subscription</h2>
              </div>

              {isActive ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">Active</span>
                    {user.subscription_tier && (
                      <span className="text-sm text-muted-foreground">
                        — {TIER_LABELS[user.subscription_tier] || user.subscription_tier} plan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription, update payment methods, view invoices, or cancel
                    your plan through our secure billing portal.
                  </p>
                  <Button
                    onClick={handleManage}
                    disabled={portalLoading}
                    className="w-full gap-2"
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Opening portal...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" /> Manage Subscription
                      </>
                    )}
                  </Button>
                </>
              ) : isCancelled ? (
                <>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Subscription Cancelled</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your subscription has been cancelled. Resubscribe anytime to regain full
                    access to all training tools.
                  </p>
                  <Link to="/pricing">
                    <Button className="w-full gap-2">
                      <Sparkles className="w-4 h-4" /> Resubscribe
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">No Active Subscription</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to unlock full access to the Mental Gym, performance analytics, and
                    all training tools.
                  </p>
                  <Link to="/pricing">
                    <Button className="w-full gap-2">
                      <Sparkles className="w-4 h-4" /> View Plans
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Coaching sessions */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-sm">Coaching Sessions</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Coaching sessions are purchased separately and don't require a subscription.{" "}
                <Link to="/coaching" className="text-primary font-medium hover:underline">
                  Book a session
                </Link>
              </p>
            </div>

            {/* Billing help */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-bold text-sm mb-1">Billing Questions?</h3>
              <p className="text-sm text-muted-foreground">
                If you have questions about charges, refunds, or payment issues,{" "}
                <Link to="/support" className="text-primary font-medium hover:underline">
                  contact our support team
                </Link>
                .
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}