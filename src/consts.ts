export const SITE = {
  title: "Kacper Zaleski",
} as const;

// Adding a section = add a page under src/pages/[...locale]/, an entry here,
// and its label in both languages in src/i18n/index.ts.
export const NAV = [
  { href: "/", key: "nav.home" },
  { href: "/cv", key: "nav.cv" },
  { href: "/projects", key: "nav.projects" },
  { href: "/blog", key: "nav.blog" },
  { href: "/contact", key: "nav.contact" },
] as const;

export const LEGAL_NAV = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
] as const;

// Contact email, split so it never appears as one string in the HTML.
// TODO(kacper): switch to the Cloudflare Email Routing alias once it exists
// (e.g. { user: "hello", domain: "kacperzaleski.com" }).
export const EMAIL = { user: "kacperzaleski1", domain: "gmail.com" } as const;
