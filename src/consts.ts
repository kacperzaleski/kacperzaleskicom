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

// Contact email, split so it never appears as one string in the HTML.
// TODO(kacper): switch to the Cloudflare Email Routing alias once it exists
// (e.g. { user: "hello", domain: "kacperzaleski.com" }).
export const EMAIL = { user: "kacperzaleski1", domain: "gmail.com" } as const;
