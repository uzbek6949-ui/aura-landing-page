import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const KEYS = ["one", "two", "three"] as const;
const GRADIENTS = [
  "linear-gradient(135deg,#10b981,#22d3ee)",
  "linear-gradient(135deg,#14b8a6,#34d399)",
  "linear-gradient(135deg,#22d3ee,#10b981)",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  const t = useTranslations("testimonials");

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {KEYS.map((key, i) => {
            const name = t(`items.${key}.name`);
            return (
              <Reveal key={key} delay={i * 90}>
                <figure className="flex h-full flex-col rounded-card border border-border bg-card p-6">
                  <Quote size={26} className="text-brand/40" />
                  <div className="mt-3 flex gap-0.5" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={15} className="fill-brand text-brand" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground">
                    “{t(`items.${key}.quote`)}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                      style={{ background: GRADIENTS[i] }}
                      aria-hidden
                    >
                      {initials(name)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{name}</span>
                      <span className="block text-sm text-muted-foreground">
                        {t(`items.${key}.role`)}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
