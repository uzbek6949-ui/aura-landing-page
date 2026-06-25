// Central place for small, non-localized site config.
export const site = {
  name: "Aura",
  // anchor ids must match the section ids in the components
  nav: [
    { key: "features", href: "#features" },
    { key: "how", href: "#how" },
    { key: "pricing", href: "#pricing" },
    { key: "faq", href: "#faq" },
  ],
  socials: [
    { label: "X", href: "https://x.com" },
    { label: "GitHub", href: "https://github.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
} as const;
