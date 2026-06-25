import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const KEYS = ["safe", "bank", "cost", "launch", "card"] as const;

export function FAQ() {
  const t = useTranslations("faq");

  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-12 space-y-3">
          {KEYS.map((key, i) => (
            <Reveal key={key} delay={i * 60}>
              <details className="group rounded-2xl border border-border bg-card px-5 open:border-brand/40 open:bg-card [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[15px] font-semibold text-foreground">
                  {t(`items.${key}.q`)}
                  <span className="open-gradient grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-transform duration-300 group-open:rotate-45">
                    <Plus size={16} />
                  </span>
                </summary>
                <p className="pb-5 pr-10 text-[15px] leading-relaxed text-muted-foreground">
                  {t(`items.${key}.a`)}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
