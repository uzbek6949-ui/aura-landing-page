import { useTranslations } from "next-intl";
import { Link2, Brain, PiggyBank, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS: { key: string; Icon: LucideIcon }[] = [
  { key: "connect", Icon: Link2 },
  { key: "learn", Icon: Brain },
  { key: "save", Icon: PiggyBank },
];

export function HowItWorks() {
  const t = useTranslations("how");

  return (
    <section id="how" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div aria-hidden className="blob bottom-0 left-1/3 h-72 w-72" style={{ background: "#14b8a6" }} />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* connector line on desktop */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px md:block"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--border) 12%, var(--border) 88%, transparent)",
            }}
          />
          {STEPS.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={i * 120} className="relative text-center">
              <div className="relative z-10 mx-auto inline-flex">
                <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-brand-foreground shadow-lg shadow-brand/25">
                  <Icon size={24} />
                </span>
                <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-xs font-bold text-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
                {t(`steps.${key}.desc`)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
