import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  LogOut,
  Loader2,
  KeyRound,
  Save,
  CreditCard,
  ChevronRight,
} from "lucide-react";

const GOALS = [
  "Improve my mental game",
  "Compete at the junior tour level",
  "Earn a college golf scholarship",
  "Pursue professional golf",
];

const ROLE_LABELS = {
  player: "Player",
  parent: "Parent",
  coach: "Coach",
  admin: "Admin",
};

export default function AccountSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    phone: "",
    date_of_birth: "",
    age: "",
    coaching_goal: "",
  });

  useEffect(() => {
    base44
      .auth.me()
      .then((u) => {
        setUser(u);
        setForm({
          first_name: u?.first_name || "",
          phone: u?.phone || "",
          date_of_birth: u?.date_of_birth || "",
          age: u?.age?.toString() || "",
          coaching_goal: u?.coaching_goal || "",
        });
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        first_name: form.first_name.trim(),
        phone: form.phone.trim() || null,
        date_of_birth: form.date_of_birth || null,
        age: form.age ? parseInt(form.age) : null,
        coaching_goal: form.coaching_goal || null,
      });
      toast.success("Profile updated!");
      const updated = await base44.auth.me();
      setUser(updated);
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const isPlayer = user?.user_type === "player";

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
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">U</span>
          </div>
          <span className="text-white font-display font-bold text-lg">Settings</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {user ? (
          <>
            {/* Profile */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Profile</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
                <p className="text-xs text-muted-foreground">Used for SMS training reminders</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                />
              </div>

              {isPlayer && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                      min={8}
                      max={30}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Coaching goal</Label>
                    <Select
                      value={form.coaching_goal}
                      onValueChange={(v) => setForm((f) => ({ ...f, coaching_goal: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="What drives you?" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOALS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>

            {/* Account info */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Account</h2>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium">
                  {ROLE_LABELS[user.user_type] || user.user_type || "Player"}
                </span>
              </div>
              {user.created_date && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="text-sm font-medium">
                    {format(new Date(user.created_date), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>

            {/* Billing */}
            <Link to="/billing" className="block">
              <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <h2 className="font-display font-bold text-lg">Billing</h2>
                      <p className="text-xs text-muted-foreground">
                        Manage subscription &amp; payment
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </Link>

            {/* Security */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Security</h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">Reset your password via email</p>
                </div>
                <Link to="/forgot-password">
                  <Button variant="outline" size="sm" className="gap-2">
                    <KeyRound className="w-4 h-4" /> Reset
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sign out */}
            <div className="bg-card rounded-xl border border-border p-5">
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={() => base44.auth.logout()}
              >
                <LogOut className="w-4 h-4" /> Sign out
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        )}
      </main>
    </div>
  );
}