import { cn } from "@/lib/utils";

function NineTable({ label, start, round }) {
  const idxs = Array.from({ length: 9 }, (_, i) => start + i);
  const pars = round.hole_pars || [];
  const scores = round.hole_scores || [];
  const putts = round.hole_putts || [];
  const fir = round.hole_fir || [];
  const gir = round.hole_gir || [];

  const parSum = idxs.reduce((a, i) => a + (pars[i] || 0), 0);
  const scoreSum = idxs.reduce((a, i) => a + (scores[i] || 0), 0);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-primary/10">
              <th className="text-left px-2 py-1.5 font-semibold">Hole</th>
              {idxs.map((i) => (
                <th key={i} className="text-center px-1 py-1.5 font-semibold">{i + 1}</th>
              ))}
              <th className="text-center px-2 py-1.5 font-semibold">{label}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="text-left px-2 py-1.5 text-muted-foreground">Par</td>
              {idxs.map((i) => (
                <td key={i} className="text-center px-1 py-1.5 text-muted-foreground">{pars[i] ?? "—"}</td>
              ))}
              <td className="text-center px-2 py-1.5 font-semibold">{parSum}</td>
            </tr>
            <tr className="border-t border-border">
              <td className="text-left px-2 py-1.5 text-muted-foreground">Score</td>
              {idxs.map((i) => {
                const s = scores[i];
                const p = pars[i];
                const v = s && s > 0 ? s : null;
                return (
                  <td
                    key={i}
                    className={cn(
                      "text-center px-1 py-1.5 font-bold",
                      v == null && "text-muted-foreground",
                      v != null && p && v < p && "text-secondary",
                      v != null && p && v === p && "text-foreground",
                      v != null && p && v > p && "text-destructive"
                    )}
                  >
                    {v ?? "—"}
                  </td>
                );
              })}
              <td className="text-center px-2 py-1.5 font-bold">{scoreSum}</td>
            </tr>
            <tr className="border-t border-border">
              <td className="text-left px-2 py-1.5 text-muted-foreground">Putts</td>
              {idxs.map((i) => (
                <td key={i} className="text-center px-1 py-1.5 text-foreground/80">
                  {putts[i] != null ? putts[i] : "—"}
                </td>
              ))}
              <td className="text-center px-2 py-1.5 font-semibold">
                {idxs.reduce((a, i) => a + (putts[i] || 0), 0)}
              </td>
            </tr>
            <tr className="border-t border-border">
              <td className="text-left px-2 py-1.5 text-muted-foreground">FIR</td>
              {idxs.map((i) => (
                <td key={i} className="text-center px-1 py-1.5">
                  {fir[i] ? <span className="text-secondary font-bold">✓</span> : <span className="text-muted-foreground">·</span>}
                </td>
              ))}
              <td className="text-center px-2 py-1.5 font-semibold">
                {idxs.filter((i) => fir[i]).length}
              </td>
            </tr>
            <tr className="border-t border-border">
              <td className="text-left px-2 py-1.5 text-muted-foreground">GIR</td>
              {idxs.map((i) => (
                <td key={i} className="text-center px-1 py-1.5">
                  {gir[i] ? <span className="text-secondary font-bold">✓</span> : <span className="text-muted-foreground">·</span>}
                </td>
              ))}
              <td className="text-center px-2 py-1.5 font-semibold">
                {idxs.filter((i) => gir[i]).length}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ScorecardView({ round }) {
  if (!round.hole_scores || round.hole_scores.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-5">
      <h2 className="font-display font-bold text-lg">Scorecard</h2>
      <NineTable label="Front" start={0} round={round} />
      <NineTable label="Back" start={9} round={round} />
    </div>
  );
}