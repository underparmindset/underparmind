export default function MPSRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score / 100 * circumference;
  const color = score >= 70 ? "hsl(var(--primary))" : score >= 40 ? "hsl(var(--accent))" : "hsl(var(--destructive))";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out" />
          
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-bold">{score}</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">MPS</span>
          </div>
          <span className="uppercase tracking-wider font-semibold text-center leading-tight px-2 bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] text-[7px]">MENTAL PERFORMANCE SCORE</span>
        </div>
      </div>
    </div>);

}