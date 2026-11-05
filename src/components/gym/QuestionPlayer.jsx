import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Lightbulb, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuestionPlayer({ moduleId, questions = [], savedResponses = [], onSaveResponses }) {
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    (savedResponses || []).forEach((r) => {
      if (r && r.index != null) initial[r.index] = r.answer || "";
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  if (!questions || questions.length === 0) return null;

  const hasCorrectAnswer = (q) =>
    q.type === "choice" && Number.isInteger(q.correct_index) && q.correct_index >= 0;

  const buildResponses = (next) =>
    questions
      .map((q, i) => {
        const answer = next[i] ?? "";
        const correctOption = hasCorrectAnswer(q) ? (q.options || [])[q.correct_index] : null;
        return {
          index: i,
          prompt: q.prompt,
          answer,
          is_correct: correctOption != null && answer === correctOption,
        };
      })
      .filter((r) => r.answer !== "");

  const persist = async (next) => {
    setSaving(true);
    try {
      await onSaveResponses(moduleId, buildResponses(next));
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const answerChoice = (qi, option) => {
    const next = { ...answers, [qi]: option };
    setAnswers(next);
    setDirty(true);
    persist(next);
  };

  const answerText = (qi, value) => {
    setAnswers((a) => ({ ...a, [qi]: value }));
    setDirty(true);
  };

  const answeredCount = questions.filter((q, i) => String(answers[i] || "").trim() !== "").length;

  return (
    <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-accent" /> Apply It
        </h3>
        <span className="text-[11px] text-muted-foreground font-medium">
          {answeredCount} of {questions.length} answered
        </span>
      </div>

      {questions.map((q, qi) => {
        const answer = answers[qi] || "";
        const isChoice = q.type === "choice";
        const options = q.options || [];
        const graded = hasCorrectAnswer(q);
        const revealed = isChoice && answer !== "";
        const correctOption = graded ? options[q.correct_index] : null;

        return (
          <div key={qi} className="space-y-2 rounded-lg bg-background/40 border border-border p-3">
            <p className="text-sm font-semibold leading-snug">
              <span className="text-accent mr-1.5">{qi + 1}.</span>
              {q.prompt}
            </p>

            {isChoice ? (
              <div className="space-y-1.5">
                {options.map((opt, oi) => {
                  const isRight = revealed && graded && correctOption === opt;
                  const isWrong = revealed && graded && answer === opt && !isRight;
                  const isPicked = answer === opt;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => answerChoice(qi, opt)}
                      disabled={revealed && graded}
                      className={cn(
                        "w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-lg border transition-colors",
                        isRight
                          ? "border-green-500/70 bg-green-500/10"
                          : isWrong
                          ? "border-destructive/70 bg-destructive/10"
                          : isPicked
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold",
                          isRight
                            ? "border-green-500 text-green-500"
                            : isWrong
                            ? "border-destructive text-destructive"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {isRight ? (
                          <Check className="w-3 h-3" />
                        ) : isWrong ? (
                          <X className="w-3 h-3" />
                        ) : (
                          String.fromCharCode(65 + oi)
                        )}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
                {revealed && q.explanation && (
                  <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2 border-l-2 border-accent leading-relaxed">
                    {q.explanation}
                  </p>
                )}
              </div>
            ) : (
              <Textarea
                value={answer}
                onChange={(e) => answerText(qi, e.target.value)}
                onBlur={() => persist(answers)}
                placeholder="Type your answer..."
                rows={3}
                className="text-sm bg-background resize-y"
              />
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-3">
        {saving ? (
          <span className="text-[11px] text-muted-foreground">Saving...</span>
        ) : dirty ? (
          <span className="text-[11px] text-muted-foreground">Unsaved changes</span>
        ) : null}
        <Button size="sm" variant="outline" onClick={() => persist(answers)} disabled={saving}>
          <Save className="w-3.5 h-3.5 mr-1.5" /> Save answers
        </Button>
      </div>
    </div>
  );
}