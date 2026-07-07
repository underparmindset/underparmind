import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Mail, Loader2, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function InviteCoachParent() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("parent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: connections = [], refetch } = useQuery({
    queryKey: ["playerConnections"],
    queryFn: () => base44.entities.PlayerConnection.list("-created_date", 50),
  });

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await base44.functions.invoke("inviteCoachParent", { email, role });
      setSuccess(`Invitation sent to ${email}. They'll appear in your roster once they register and log in.`);
      setEmail("");
      refetch();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-primary" /> Invite Coach or Parent
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Invite your coach or parent so they can view your dashboard, rounds, and mental game data.
        </p>
      </div>

      <form onSubmit={handleInvite} className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Who are you inviting?</label>
          <div className="flex gap-2">
            {[
              { value: "parent", label: "Parent" },
              { value: "coach", label: "Coach" },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border-2",
                  role === r.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/30"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Email address</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                placeholder="coach@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading || !email}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invite"}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-primary">{success}</p>
          </div>
        )}
      </form>

      {connections.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-bold">Your Invites</h2>
          </div>
          <div className="divide-y divide-border">
            {connections.map((conn) => (
              <div key={conn.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    conn.status === "accepted" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {conn.status === "accepted" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{conn.invited_email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{conn.role}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium",
                  conn.status === "accepted" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {conn.status === "accepted" ? "Connected" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}