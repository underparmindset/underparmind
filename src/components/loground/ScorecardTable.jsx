import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

function getScoreColor(score, par) {
  if (!score) return "";
  const diff = score - par;
  if (diff <= -2) return "bg-blue-100 text-blue-800";
  if (diff === -1) return "bg-green-100 text-green-800";
  if (diff === 0) return "bg-muted text-muted-foreground";
  if (diff === 1) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

export default function ScorecardTable({ holes, updateHole }) {
  const front9 = holes.slice(0, 9);
  const back9 = holes.slice(9);

  const sumPar = (arr) => arr.reduce((a, h) => a + h.par, 0);
  const sumScore = (arr) => arr.reduce((a, h) => a + (h.score || 0), 0);
  const sumPutts = (arr) => arr.reduce((a, h) => a + (h.putts || 0), 0);
  const countFir = (arr) => arr.filter(h => h.par >= 4 && h.fir).length;
  const firTotal = (arr) => arr.filter(h => h.par >= 4).length;
  const countGir = (arr) => arr.filter(h => h.gir).length;

  const HoleRow = ({ hole, idx }) => {
    const diff = hole.score ? hole.score - hole.par : null;
    const diffText = diff != null ? (diff > 0 ? `+${diff}` : diff === 0 ? "E" : diff) : "";

    return (
      <tr className="border-b border-border last:border-0">
        <td className="px-2 py-2 text-center font-semibold text-xs text-muted-foreground w-10">{idx + 1}</td>
        <td className="px-1 py-2">
          <div className="flex gap-1 justify-center">
            {[3, 4, 5].map(p => (
              <button
                key={p}
                onClick={() => updateHole(idx, "par", p)}
                className={cn(
                  "w-7 h-7 rounded-md text-xs font-bold transition-colors",
                  hole.par === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >{p}</button>
            ))}
          </div>
        </td>
        <td className="px-1 py-2 w-16">
          <input
            type="number"
            min={1}
            max={15}
            value={hole.score ?? ""}
            onChange={(e) => updateHole(idx, "score", e.target.value ? parseInt(e.target.value) : null)}
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-center text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </td>
        <td className="px-2 py-2 text-center w-12">
          <span className={cn("inline-block px-1.5 py-0.5 rounded text-xs font-bold", getScoreColor(hole.score, hole.par))}>
            {diffText}
          </span>
        </td>
        <td className="px-2 py-2 text-center w-10">
          {hole.par >= 4 ? (
            <Checkbox checked={hole.fir} onCheckedChange={(v) => updateHole(idx, "fir", v)} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-2 py-2 text-center w-10">
          <Checkbox checked={hole.gir} onCheckedChange={(v) => updateHole(idx, "gir", v)} />
        </td>
        <td className="px-1 py-2 w-14">
          <input
            type="number"
            min={0}
            max={9}
            value={hole.putts ?? ""}
            onChange={(e) => updateHole(idx, "putts", e.target.value ? parseInt(e.target.value) : null)}
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-center text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </td>
      </tr>
    );
  };

  const SummaryRow = ({ label, arr }) => {
    const par = sumPar(arr);
    const score = sumScore(arr);
    const diff = score - par;
    return (
      <tr className="bg-primary/5 font-bold text-sm">
        <td className="px-2 py-2 text-center text-xs uppercase text-primary">{label}</td>
        <td className="px-2 py-2 text-center">{par}</td>
        <td className="px-2 py-2 text-center">{score || "—"}</td>
        <td className="px-2 py-2 text-center">
          <span className={cn(diff > 0 ? "text-destructive" : diff < 0 ? "text-primary" : "text-muted-foreground")}>
            {score ? (diff > 0 ? `+${diff}` : diff === 0 ? "E" : diff) : "—"}
          </span>
        </td>
        <td className="px-2 py-2 text-center text-xs">{countFir(arr)}/{firTotal(arr)}</td>
        <td className="px-2 py-2 text-center text-xs">{countGir(arr)}/{arr.length}</td>
        <td className="px-2 py-2 text-center text-xs">{sumPutts(arr)}</td>
      </tr>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground text-xs">
              <th className="px-2 py-2.5">Hole</th>
              <th className="px-2 py-2.5">Par</th>
              <th className="px-2 py-2.5">Score</th>
              <th className="px-2 py-2.5">+/-</th>
              <th className="px-2 py-2.5">FIR</th>
              <th className="px-2 py-2.5">GIR</th>
              <th className="px-2 py-2.5">Putts</th>
            </tr>
          </thead>
          <tbody>
            {front9.map((h, i) => <HoleRow key={i} hole={h} idx={i} />)}
            <SummaryRow label="OUT" arr={front9} />
            {back9.map((h, i) => <HoleRow key={i + 9} hole={h} idx={i + 9} />)}
            <SummaryRow label="IN" arr={back9} />
            <SummaryRow label="TOT" arr={holes} />
          </tbody>
        </table>
      </div>
    </div>
  );
}