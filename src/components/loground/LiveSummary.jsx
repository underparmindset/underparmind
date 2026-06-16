import { cn } from "@/lib/utils";

export default function LiveSummary({ holes }) {
  const totalPar = holes.reduce((a, h) => a + h.par, 0);
  const totalScore = holes.reduce((a, h) => a + (h.score || 0), 0);
  const diff = totalScore - totalPar;
  const holesWithScore = holes.filter(h => h.score);

  const girCount = holes.filter(h => h.gir).length;
  const girRate = holesWithScore.length ? Math.round((girCount / holesWithScore.length) * 100) : 0;

  const firHoles = holes.filter(h => h.par >= 4);
  const firCount = firHoles.filter(h => h.fir).length;
  const firRate = firHoles.length ? Math.round((firCount / firHoles.length) * 100) : 0;

  const totalPutts = holes.reduce((a, h) => a + (h.putts || 0), 0);
  const puttLabel = totalPutts < 28 ? "Exceptional" : totalPutts < 31 ? "Great" : totalPutts < 33 ? "Solid" : "Work on lag putts";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-card rounded-xl border border-border p-3 text-center">
        <p className="text-[10px] uppercase font-semibold text-muted-foreground">Score</p>
        <p className="text-2xl font-display font-bold">{totalScore || "—"}</p>
        {totalScore > 0 && (
          <p className={cn("text-sm font-semibold", diff > 0 ? "text-destructive" : diff < 0 ? "text-primary" : "text-muted-foreground")}>
            {diff > 0 ? `+${diff}` : diff === 0 ? "E" : diff} ({totalPar} par)
          </p>
        )}
      </div>
      <div className="bg-card rounded-xl border border-border p-3 text-center">
        <p className="text-[10px] uppercase font-semibold text-muted-foreground">GIR</p>
        <p className="text-2xl font-display font-bold">{girCount}</p>
        <p className="text-xs text-muted-foreground">{girRate}% rate</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-3 text-center">
        <p className="text-[10px] uppercase font-semibold text-muted-foreground">Fairways</p>
        <p className="text-2xl font-display font-bold">{firCount}</p>
        <p className="text-xs text-muted-foreground">{firRate}% rate</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-3 text-center">
        <p className="text-[10px] uppercase font-semibold text-muted-foreground">Putts</p>
        <p className="text-2xl font-display font-bold">{totalPutts || "—"}</p>
        {totalPutts > 0 && <p className="text-xs text-muted-foreground">{puttLabel}</p>}
      </div>
    </div>
  );
}