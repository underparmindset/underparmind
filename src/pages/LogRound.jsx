import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ScorecardTable from "@/components/loground/ScorecardTable";
import LiveSummary from "@/components/loground/LiveSummary";

const EMPTY_HOLE = () => ({ par: 4, score: null, fir: false, gir: false, putts: null });

export default function LogRound() {
  const queryClient = useQueryClient();

  const [courseName, setCourseName] = useState("");
  const [roundDate, setRoundDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [roundType, setRoundType] = useState("Practice");
  const [holes, setHoles] = useState(Array.from({ length: 18 }, EMPTY_HOLE));

  // Mental check-ins
  const [calm, setCalm] = useState(5);
  const [routine, setRoutine] = useState(50);
  const [reset, setReset] = useState(5);
  const [focus6, setFocus6] = useState(5);
  const [regretShot, setRegretShot] = useState("");
  const [wellDone, setWellDone] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: () => base44.entities.Course.list("-created_date", 50),
  });

  const { data: rounds = [] } = useQuery({
    queryKey: ["rounds"],
    queryFn: () => base44.entities.Round.list("-date", 50),
  });

  const loadCourse = (name) => {
    const c = courses.find(c => c.name === name);
    if (c?.hole_pars?.length === 18) {
      setHoles(prev => prev.map((h, i) => ({ ...h, par: c.hole_pars[i] })));
      toast.success("Pars loaded!");
    }
  };

  const updateHole = (idx, field, value) => {
    setHoles(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  const resetCard = () => {
    setHoles(Array.from({ length: 18 }, EMPTY_HOLE));
    setCalm(5); setRoutine(50); setReset(5); setFocus6(5);
    setRegretShot(""); setWellDone("");
  };

  const holesWithScore = holes.filter(h => h.score != null && h.score > 0);

  const saveRound = async () => {
    if (holesWithScore.length < 9) {
      toast.error("Enter scores for at least 9 holes");
      return;
    }
    if (!courseName.trim()) {
      toast.error("Enter a course name");
      return;
    }
    setSaving(true);

    const totalScore = holes.reduce((a, h) => a + (h.score || 0), 0);
    const totalPar = holes.reduce((a, h) => a + h.par, 0);
    const totalPutts = holes.reduce((a, h) => a + (h.putts || 0), 0);
    const firHoles = holes.filter(h => h.par >= 4);
    const firCount = firHoles.filter(h => h.fir).length;
    const girCount = holes.filter(h => h.gir).length;

    await base44.entities.Round.create({
      course_name: courseName.trim(),
      date: roundDate,
      round_type: roundType,
      hole_pars: holes.map(h => h.par),
      hole_scores: holes.map(h => h.score || 0),
      hole_fir: holes.map(h => h.fir),
      hole_gir: holes.map(h => h.gir),
      hole_putts: holes.map(h => h.putts || 0),
      total_score: totalScore,
      total_par: totalPar,
      total_putts: totalPutts,
      fir_count: firCount,
      fir_total: firHoles.length,
      gir_count: girCount,
      calm_rating: calm,
      routine_pct: routine,
      reset_rating: reset,
      focus6_rating: focus6,
      regret_shot: regretShot,
      well_done: wellDone,
      holes_played: holesWithScore.length,
    });

    // Save course if new
    const existingCourse = courses.find(c => c.name.toLowerCase() === courseName.trim().toLowerCase());
    if (!existingCourse) {
      await base44.entities.Course.create({
        name: courseName.trim(),
        hole_pars: holes.map(h => h.par),
      });
    }

    queryClient.invalidateQueries({ queryKey: ["rounds"] });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    toast.success("Round saved! 🏌️");
    resetCard();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Log Round</h1>
          <p className="text-muted-foreground text-sm mt-1">Record your scores hole by hole</p>
        </div>
        <Button variant="ghost" size="sm" onClick={resetCard}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reset
        </Button>
      </div>

      {/* Course & Round info */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Course</label>
            <Input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Course name"
              list="course-list"
            />
            <datalist id="course-list">
              {courses.map(c => <option key={c.id} value={c.name} />)}
            </datalist>
            {courses.some(c => c.name.toLowerCase() === courseName.toLowerCase()) && (
              <button onClick={() => loadCourse(courseName)} className="text-xs text-primary font-medium hover:underline">
                Load saved pars
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Date</label>
            <Input type="date" value={roundDate} onChange={(e) => setRoundDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Round Type</label>
            <Select value={roundType} onValueChange={setRoundType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Practice">Practice</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Qualifier">Qualifier</SelectItem>
                <SelectItem value="Tournament">Tournament</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Live summary */}
      <LiveSummary holes={holes} />

      {/* Scorecard */}
      <ScorecardTable holes={holes} updateHole={updateHole} />

      {/* Mental check-ins */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-5">
        <h2 className="font-display font-bold text-lg">Mental Check-In</h2>
        <div className="space-y-4">
          <SliderField label="First-tee calm" value={calm} onChange={setCalm} min={1} max={10} />
          <SliderField label="Pre-shot routine completion" value={routine} onChange={setRoutine} min={0} max={100} suffix="%" />
          <SliderField label="Reset after worst hole" value={reset} onChange={setReset} min={1} max={10} />
          <SliderField label="Focus over last 6 holes" value={focus6} onChange={setFocus6} min={1} max={10} />
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">One shot you'd want back</label>
            <Textarea value={regretShot} onChange={(e) => setRegretShot(e.target.value)} rows={2} className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">One thing done well under pressure</label>
            <Textarea value={wellDone} onChange={(e) => setWellDone(e.target.value)} rows={2} className="mt-1.5" />
          </div>
        </div>
      </div>

      <Button onClick={saveRound} disabled={saving || holesWithScore.length < 9} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90">
        <Save className="w-5 h-5 mr-2" />{saving ? "Saving..." : "Save Round"}
      </Button>
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, suffix = "" }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold text-primary">{value}{suffix}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={1} className="w-full" />
    </div>
  );
}