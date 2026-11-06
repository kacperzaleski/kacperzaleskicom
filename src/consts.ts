export const SITE = {
  title: "Kacper Zaleski",
  // TODO(kacper): one-line description for search results / social cards.
  description: "Personal site of Kacper Zaleski, based in Vienna.",
  lang: "en",
} as const;

// Adding a section = add a page folder + an entry here.
export const NAV = [
  { href: "/", label: "Home" },
  { href: "/cv", label: "CV" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
] as const;

export const LEGAL_NAV = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
] as const;
