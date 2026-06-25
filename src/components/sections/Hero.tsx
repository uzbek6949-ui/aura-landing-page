import { useTranslations } from "next-intl";
import { Sparkles, ShieldCheck } from "lucide-react";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { Reveal } from "@/components/ui/Reveal";
import { HeroVisual } from "@/components/sections/HeroVisual";

export function Hero() {
  const t = useTranslations("hero");
  const title = t("title");
  const highlight = t("highlight");

  // split the title so the highlighted phrase gets the gradient treatment
  const [before, after] = title.includes(highlight)
    ? [title.slice(0, title.indexOf(highlight)), title.slice(title.indexOf(highlight) + highlight.length)]
    : [title, ""];

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      {/* ambient background */}
      <div aria-hidden className="absolute inset-0 grid-overlay opacity-60" />
      <div aria-hidden className="blob -top-24 left-1/4 h-72 w-72" style={{ background: "#10b981" }} />
      <div aria-hidden className="blob -top-10 right-1/4 h-72 w-72" style={{ background: "#22d3ee" }} />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="text-center lg:text-left">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3.5 py-1.5 text-sm font-medium text-foreground">
              <Sparkles size={15} className="text-brand" />
              {t("badge")}
            </span>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-6 text-pretty text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {before}
              <span className="gradient-text">{highlight}</span>
              {after}
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
              {t("subtitle")}
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mx-auto mt-8 max-w-md lg:mx-0">
              <WaitlistForm />
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground lg:justify-start">
                <ShieldCheck size={15} className="text-brand" />
                {t("note")}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="relative">
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}
