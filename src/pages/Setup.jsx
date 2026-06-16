import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

const GOALS = [
  "Improve my mental game",
  "Compete at the junior tour level",
  "Earn a college golf scholarship",
  "Pursue professional golf",
];

export default function Setup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [coachingGoal, setCoachingGoal] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!firstName.trim()) return;
    setSaving(true);
    await base44.auth.updateMe({
      first_name: firstName.trim(),
      age: age ? parseInt(age) : null,
      coaching_goal: coachingGoal,
      onboarded: true,
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-display font-bold text-2xl">U</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-primary-foreground">Welcome to UnderParMind</h1>
          <p className="text-primary-foreground/70 mt-2">Let's set up your mental game profile</p>
        </div>

        <div className="bg-card rounded-2xl p-6 space-y-5 shadow-xl">
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

          <Button
            onClick={handleSubmit}
            disabled={!firstName.trim() || saving}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            {saving ? "Setting up..." : "Let's get to work"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}