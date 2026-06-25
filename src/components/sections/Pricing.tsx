import { useTranslations } from "next-intl";
import { Check, Sparkles } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const PLANS = [
  { key: "free", highlighted: false },
  { key: "plus", highlighted: true },
] as const;

export function Pricing() {
  const t = useTranslations("pricing");
  const tNav = useTranslations("nav");

  return (
    <section id="pricing" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
          {PLANS.map(({ key, highlighted }, i) => {
            const features = t.raw(`plans.${key}.features`) as string[];
            return (
              <Reveal key={key} delay={i * 100} className="h-full">
                <div
                  className={`relative flex h-full flex-col rounded-card p-7 ${
                    highlighted
                      ? "border-2 border-brand bg-card shadow-2xl shadow-brand/10"
                      : "border border-border bg-card"
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full gradient-brand px-3 py-1 text-xs font-semibold text-brand-foreground shadow-sm">
                      <Sparkles size={12} />
                      {t("popular")}
                    </span>
                  )}

                  <h3 className="text-lg font-semibold tracking-tight">
                    {t(`plans.${key}.name`)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`plans.${key}.desc`)}
                  </p>

                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      {t(`plans.${key}.price`)}
                    </span>
                    {key === "plus" && (
                      <span className="mb-1 text-sm text-muted-foreground">
                        {t("perMonth")}
                      </span>
                    )}
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[15px]">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                          <Check size={13} />
                        </span>
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#cta"
                    className={`mt-7 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-all ${
                      highlighted
                        ? "gradient-brand text-brand-foreground shadow-lg shadow-brand/25 hover:shadow-brand/40"
                        : "border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {tNav("cta")}
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("note")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
