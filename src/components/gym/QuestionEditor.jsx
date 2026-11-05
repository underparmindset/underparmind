import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const newQuestion = (type) => ({
  prompt: "",
  type,
  options: type === "choice" ? ["", ""] : [],
  correct_index: -1,
  explanation: "",
});

export default function QuestionEditor({ questions = [], onChange }) {
  const update = (qi, patch) =>
    onChange(questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)));

  const remove = (qi) => onChange(questions.filter((_, i) => i !== qi));

  const updateOption = (qi, oi, value) =>
    update(qi, { options: questions[qi].options.map((o, i) => (i === oi ? value : o)) });

  const addOption = (qi) =>
    update(qi, { options: [...(questions[qi].options || []), ""] });

  const removeOption = (qi, oi) => {
    const q = questions[qi];
    let correct_index = q.correct_index;
    if (correct_index === oi) correct_index = -1;
    else if (correct_index > oi) correct_index = correct_index - 1;
    update(qi, { options: q.options.filter((_, i) => i !== oi), correct_index });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Interactive Questions{" "}
          <span className="normal-case font-normal">— optional</span>
        </label>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onChange([...questions, newQuestion("choice")])}
          >
            <Plus className="w-3 h-3 mr-1" /> Multiple choice
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onChange([...questions, newQuestion("text")])}
          >
            <Plus className="w-3 h-3 mr-1" /> Written answer
          </Button>
        </div>
      </div>

      {questions.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No questions yet — players will tap answers or type responses here at the end of the module.
        </p>
      )}

      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-border bg-background/40 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-accent mt-2.5 shrink-0">{qi + 1}.</span>
            <Input
              value={q.prompt}
              onChange={(e) => update(qi, { prompt: e.target.value })}
              placeholder="Type the question"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => remove(qi)}
              className="text-muted-foreground hover:text-destructive p-2 shrink-0"
              title="Remove question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {q.type === "choice" ? (
            <div className="pl-6 space-y-1.5">
              <p className="text-[11px] text-muted-foreground">
                Tap the circle to mark the correct answer. Leave all unmarked for a reflection question.
              </p>
              {(q.options || []).map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => update(qi, { correct_index: q.correct_index === oi ? -1 : oi })}
                    className={cn(
                      "w-5 h-5 rounded-full border shrink-0 flex items-center justify-center transition-colors",
                      q.correct_index === oi
                        ? "border-green-500 bg-green-500/20 text-green-500"
                        : "border-border text-transparent hover:border-green-500/50"
                    )}
                    title="Mark as correct answer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    className="h-8 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(qi, oi)}
                    className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addOption(qi)}
              >
                <Plus className="w-3 h-3 mr-1" /> Add option
              </Button>
            </div>
          ) : (
            <p className="pl-6 text-[11px] text-muted-foreground">
              Players get a text box to write their answer.
            </p>
          )}

          <div className="pl-6">
            <Textarea
              value={q.explanation || ""}
              onChange={(e) => update(qi, { explanation: e.target.value })}
              placeholder="Feedback shown after they answer (optional)"
              rows={2}
              className="text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
}