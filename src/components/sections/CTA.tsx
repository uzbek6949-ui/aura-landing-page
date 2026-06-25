import { useTranslations } from "next-intl";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { Reveal } from "@/components/ui/Reveal";

export function CTA() {
  const t = useTranslations("cta");

  return (
    <section id="cta" className="scroll-mt-20 px-5 py-20 sm:px-6 sm:py-28">
      <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-12 sm:py-20">
        {/* gradient panel */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(120deg,#0f9d6f,#10b981 40%,#14b8a6 75%,#22d3ee)" }}
        />
        <div aria-hidden className="absolute inset-0 grid-overlay opacity-20" />
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl"
        />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            {t("subtitle")}
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <WaitlistForm variant="onAccent" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
