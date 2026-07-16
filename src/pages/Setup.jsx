import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, User, Users, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const GOALS = [
  "Improve my mental game",
  "Compete at the junior tour level",
  "Earn a college golf scholarship",
  "Pursue professional golf",
];

const ROLES = [
  { value: "player", label: "Player", description: "I'm a junior golfer tracking my performance", icon: User },
  { value: "parent", label: "Parent", description: "I want to follow my child's progress", icon: Users },
  { value: "coach", label: "Coach", description: "I coach multiple junior players", icon: GraduationCap },
];

export default function Setup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("player");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState("");
  const [coachingGoal, setCoachingGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!firstName.trim()) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({
        user_type: role,
        first_name: firstName.trim(),
        phone: phone.trim() || null,
        date_of_birth: dateOfBirth || null,
        age: role === "player" && age ? parseInt(age) : null,
        coaching_goal: role === "player" ? coachingGoal : null,
        onboarded: true,
      });

      // If coach/parent, auto-accept any pending connection invitations
      if (role === "coach" || role === "parent") {
        try {
          const result = await base44.functions.invoke("acceptPendingConnections", {});
          // Merge newly linked player IDs into the user's profile
          if (result.data?.playerIds?.length > 0) {
            const existing = currentUser?.linked_player_ids || [];
            const merged = [...new Set([...existing, ...result.data.playerIds])];
            await base44.auth.updateMe({ linked_player_ids: merged });
          }
        } catch (e) {
          // Non-critical — can retry later
        }
      }

      navigate(role === "player" ? "/pricing" : "/roster");
    } catch (err) {
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-primary-foreground">Welcome to UnderParMind</h1>
          <p className="text-primary-foreground/70 mt-2">Let's set up your profile</p>
        </div>

        <div className="bg-card rounded-2xl p-6 space-y-5 shadow-xl">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          {/* Role selection */}
          <div className="space-y-2">
            <Label>I am a...</Label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all",
                      role === r.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold">{r.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {ROLES.find(r => r.value === role)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First name *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth *</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-11"
            />
          </div>

          {role === "player" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                  min={8}
                  max={30}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Coaching goal</Label>
                <Select value={coachingGoal} onValueChange={setCoachingGoal}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="What drives you?" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!firstName.trim() || !phone.trim() || !dateOfBirth || saving}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            {saving ? "Setting up..." : role === "player" ? "Let's get to work" : "View my players"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}