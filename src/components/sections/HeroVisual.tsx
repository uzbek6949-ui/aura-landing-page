import { Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";

// A decorative, CSS-built "app preview" — no real data, purely illustrative.
const categories = [
  { label: "Housing", amount: "$1,240", pct: 64, color: "#10b981" },
  { label: "Groceries", amount: "$420", pct: 42, color: "#14b8a6" },
  { label: "Transport", amount: "$180", pct: 24, color: "#22d3ee" },
  { label: "Leisure", amount: "$95", pct: 14, color: "#34d399" },
];

const bars = [38, 52, 44, 66, 58, 80, 72];

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* glow behind the card */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] opacity-40 blur-2xl"
        style={{ background: "linear-gradient(120deg,#10b981,#22d3ee)" }}
      />

      <div className="glass rounded-[1.75rem] p-5 shadow-2xl shadow-black/10">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Monthly budget</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight">$2,840</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
            <TrendingUp size={13} /> On track
          </span>
        </div>

        {/* mini chart */}
        <div className="mt-5 flex h-24 items-end gap-2 rounded-xl bg-muted/60 p-3">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 overflow-hidden rounded-md">
              <div
                className="w-full rounded-md"
                style={{
                  height: `${h}%`,
                  minHeight: 6,
                  background:
                    i === bars.length - 1
                      ? "linear-gradient(180deg,#10b981,#14b8a6)"
                      : "color-mix(in oklab, var(--brand) 28%, transparent)",
                }}
              />
            </div>
          ))}
        </div>

        {/* categories */}
        <div className="mt-5 space-y-3">
          {categories.map((c) => (
            <div key={c.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{c.label}</span>
                <span className="text-muted-foreground">{c.amount}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${c.pct}%`, background: c.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* floating AI insight chip */}
      <div className="glass absolute -bottom-5 -left-4 hidden max-w-[210px] items-start gap-2.5 rounded-2xl p-3 shadow-xl shadow-black/10 sm:flex">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-brand text-brand-foreground">
          <Sparkles size={16} />
        </span>
        <p className="text-xs leading-snug text-foreground">
          You can save <span className="font-semibold text-brand">$120</span> by trimming dining out.
        </p>
      </div>

      {/* floating saved chip */}
      <div className="glass absolute -right-3 top-8 hidden items-center gap-2 rounded-xl px-3 py-2 shadow-lg shadow-black/10 sm:flex">
        <ArrowUpRight size={15} className="text-brand" />
        <span className="text-xs font-semibold text-foreground">+$430 saved</span>
      </div>
    </div>
  );
}
