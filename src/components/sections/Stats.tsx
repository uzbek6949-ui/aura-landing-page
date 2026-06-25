import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";

const KEYS = ["waitlist", "saved", "setup", "security"] as const;

export function Stats() {
  const t = useTranslations("stats");

  return (
    <section className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal>
          <dl className="glass grid grid-cols-2 gap-y-8 rounded-card px-6 py-8 sm:px-10 lg:grid-cols-4">
            {KEYS.map((key) => (
              <div key={key} className="text-center">
                <dt className="order-2 mt-1 text-sm text-muted-foreground">
                  {t(`items.${key}.label`)}
                </dt>
                <dd className="order-1 gradient-text text-3xl font-bold tracking-tight sm:text-4xl">
                  {t(`items.${key}.value`)}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
