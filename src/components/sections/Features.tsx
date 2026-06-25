import { useTranslations } from "next-intl";
import {
  Wand2,
  ScanLine,
  LineChart,
  Target,
  Wallet,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ITEMS: { key: string; Icon: LucideIcon }[] = [
  { key: "budget", Icon: Wand2 },
  { key: "tracking", Icon: ScanLine },
  { key: "insights", Icon: LineChart },
  { key: "goals", Icon: Target },
  { key: "accounts", Icon: Wallet },
  { key: "privacy", Icon: Lock },
];

export function Features() {
  const t = useTranslations("features");

  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={(i % 3) * 80}>
              <article className="group h-full rounded-card border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5">
                <span className="hover-gradient inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {t(`items.${key}.desc`)}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
