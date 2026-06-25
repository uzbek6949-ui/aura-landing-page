import { useTranslations } from "next-intl";
import { site } from "@/lib/site";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const columns = [
    {
      key: "product",
      links: [
        { label: t("columns.product.features"), href: "#features" },
        { label: t("columns.product.how"), href: "#how" },
        { label: t("columns.product.pricing"), href: "#pricing" },
        { label: t("columns.product.faq"), href: "#faq" },
      ],
    },
    {
      key: "company",
      links: [
        { label: t("columns.company.about"), href: "#" },
        { label: t("columns.company.blog"), href: "#" },
        { label: t("columns.company.careers"), href: "#" },
        { label: t("columns.company.contact"), href: "#" },
      ],
    },
    {
      key: "legal",
      links: [
        { label: t("columns.legal.privacy"), href: "#" },
        { label: t("columns.legal.terms"), href: "#" },
        { label: t("columns.legal.security"), href: "#" },
      ],
    },
  ] as const;

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <span className="text-lg font-semibold tracking-tight">{site.name}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
            </p>
            <div className="mt-5 flex gap-2">
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {s.label[0]}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.key}>
              <h3 className="text-sm font-semibold text-foreground">
                {t(`columns.${col.key}.title`)}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {year} {site.name}. {t("rights")}
          </p>
          <p>{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
