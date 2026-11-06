/**
 * Two languages: English at /…, German at /de/….
 * UI strings live here; content (CV, projects) carries its own translations.
 */

export const LANGS = ["en", "de"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  de: "Deutsch",
};

/** Pages that exist only once (German-only legal pages, 404). */
const SINGLE_LANGUAGE_PATHS = ["/impressum", "/datenschutz", "/404"];

/** For getStaticPaths in src/pages/[...locale]/*.astro. */
export const localeStaticPaths = () =>
  LANGS.map((lang) => ({
    params: { locale: lang === DEFAULT_LANG ? undefined : lang },
    props: { lang },
  }));

export function isSingleLanguage(path: string): boolean {
  // Blog posts are written in one language each: /blog/<slug>.
  return SINGLE_LANGUAGE_PATHS.includes(path) || path.startsWith("/blog/");
}

/** Language of a public path ("/de/cv" → "de"). */
export function langFromPath(path: string): Lang {
  return path === "/de" || path.startsWith("/de/") ? "de" : "en";
}

/** Strip the language prefix: "/de/cv" → "/cv", "/de" → "/". */
export function basePath(path: string): string {
  if (path === "/de") return "/";
  return path.startsWith("/de/") ? path.slice(3) : path;
}

/** Path for a page in a language: ("/cv", "de") → "/de/cv". */
export function localize(path: string, lang: Lang): string {
  const base = basePath(path);
  if (lang === DEFAULT_LANG || isSingleLanguage(base)) return base;
  return base === "/" ? "/de" : `/de${base}`;
}

/** Text that is either the same in every language or translated. */
export type L10n = string | { en: string; de?: string | undefined };

export function tr(value: L10n, lang: Lang): string {
  if (typeof value === "string") return value;
  return (lang === "de" ? value.de : undefined) ?? value.en;
}

const ui = {
  en: {
    "nav.home": "Home",
    "nav.cv": "CV",
    "nav.projects": "Projects",
    "nav.blog": "Blog",
    "blog.title": "Blog",
    "blog.description":
      "Blog by Kacper Zaleski: notes on machine learning, projects and what he's working on.",
    "blog.heading": "Blog",
    "blog.lede":
      "Notes on machine learning, projects and whatever else I'm working on.",
    "blog.empty": "No posts yet.",
    "blog.minRead": "min read",
    "blog.updated": "Updated",
    "blog.back": "All posts",
    "blog.draft": "Draft (only visible locally)",
    "blog.inGerman": "In German",
    "blog.inEnglish": "In English",
    "nav.contact": "Contact",
    "nav.main": "Main",
    "nav.legal": "Legal",
    "nav.language": "Language",
    skip: "Skip to content",
    "theme.toDark": "Switch to dark mode",
    "theme.toLight": "Switch to light mode",
    "footer.city": "Vienna",
    "site.title": "Kacper Zaleski – AI / Machine Learning Engineer in Vienna",
    "site.description":
      "Kacper Zaleski is an AI / machine learning engineer in Vienna and M.Sc. AI student at JKU Linz: deep learning, medical imaging, knowledge graphs.",
    "home.eyebrow": "AI / Machine Learning Engineer",
    "home.lede":
      "AI graduate from JKU Linz, now doing a Master's in Artificial Intelligence. I work across model training and software engineering, from medical imaging to knowledge graphs.",
    "home.ctaProjects": "See projects",
    "home.ctaCv": "Read CV",
    "cv.title": "CV",
    "cv.description":
      "CV of Kacper Zaleski, AI / machine learning engineer in Vienna: experience at MedUni Vienna and Raiffeisen Bank International, JKU Linz, skills. PDF included.",
    "cv.download": "Download PDF",
    "cv.profile": "Profile",
    "cv.experience": "Experience",
    "cv.education": "Education",
    "cv.skills": "Technical skills",
    "cv.languages": "Languages",
    "cv.interests": "Interests",
    "cv.present": "present",
    "projects.title": "Projects",
    "projects.description":
      "Machine learning projects by Kacper Zaleski: CT-to-PET translation with diffusion and flow models, a knowledge graph of Austrian banking, and more.",
    "projects.heading": "Things I've built",
    "projects.lede":
      "Research code and side projects, pulled from GitHub at build time.",
    "projects.featured": "Featured projects",
    "projects.more": "More projects",
    "projects.updated": "Updated",
    "projects.code": "Code on GitHub",
    "projects.demo": "Live demo",
    "projects.tags": "Tags",
    "projects.screenshotOf": "Screenshot of",
    "status.live": "Live",
    "status.demo": "Demo",
    "status.wip": "In progress",
    "status.archived": "Completed",
    "contact.title": "Contact",
    "contact.description":
      "Get in touch with Kacper Zaleski, AI / machine learning engineer in Vienna: email, GitHub and LinkedIn.",
    "contact.heading": "Get in touch",
    "contact.lede":
      "The best way to reach me is by email. I'm based in Vienna and read German, English and Polish.",
    "contact.email": "Email",
    "404.title": "Page not found",
    "404.text": "That page doesn't exist (or moved).",
    "404.home": "Go to the home page",
  },
  de: {
    "nav.home": "Start",
    "nav.cv": "Lebenslauf",
    "nav.projects": "Projekte",
    "nav.blog": "Blog",
    "blog.title": "Blog",
    "blog.description":
      "Blog von Kacper Zaleski: Notizen zu Machine Learning, Projekten und woran er gerade arbeitet.",
    "blog.heading": "Blog",
    "blog.lede":
      "Notizen zu Machine Learning, Projekten und allem, woran ich gerade arbeite.",
    "blog.empty": "Noch keine Beiträge.",
    "blog.minRead": "Min. Lesezeit",
    "blog.updated": "Aktualisiert",
    "blog.back": "Alle Beiträge",
    "blog.draft": "Entwurf (nur lokal sichtbar)",
    "blog.inGerman": "Auf Deutsch",
    "blog.inEnglish": "Auf Englisch",
    "nav.contact": "Kontakt",
    "nav.main": "Hauptmenü",
    "nav.legal": "Rechtliches",
    "nav.language": "Sprache",
    skip: "Zum Inhalt springen",
    "theme.toDark": "Zum dunklen Modus wechseln",
    "theme.toLight": "Zum hellen Modus wechseln",
    "footer.city": "Wien",
    "site.title": "Kacper Zaleski – AI / Machine Learning Engineer in Wien",
    "site.description":
      "Kacper Zaleski, AI / Machine Learning Engineer in Wien, Masterstudium AI an der JKU Linz: Deep Learning, medizinische Bildgebung, Knowledge Graphs.",
    "home.eyebrow": "AI / Machine Learning Engineer",
    "home.lede":
      "AI-Absolvent der JKU Linz, jetzt im Masterstudium Artificial Intelligence. Ich arbeite an Modelltraining und Softwareentwicklung, von medizinischer Bildgebung bis zu Knowledge Graphs.",
    "home.ctaProjects": "Projekte ansehen",
    "home.ctaCv": "Lebenslauf lesen",
    "cv.title": "Lebenslauf",
    "cv.description":
      "Lebenslauf von Kacper Zaleski, AI / Machine Learning Engineer in Wien: Erfahrung an der MedUni Wien und bei Raiffeisen Bank International, JKU Linz. Mit PDF.",
    "cv.download": "PDF herunterladen",
    "cv.profile": "Profil",
    "cv.experience": "Berufserfahrung",
    "cv.education": "Ausbildung",
    "cv.skills": "Technische Kenntnisse",
    "cv.languages": "Sprachen",
    "cv.interests": "Interessen",
    "cv.present": "heute",
    "projects.title": "Projekte",
    "projects.description":
      "ML-Projekte von Kacper Zaleski: CT-zu-PET-Übersetzung mit Diffusions- und Flow-Modellen, ein Knowledge Graph zum österreichischen Bankwesen und mehr.",
    "projects.heading": "Was ich gebaut habe",
    "projects.lede":
      "Forschungscode und eigene Projekte, beim Build direkt von GitHub geladen.",
    "projects.featured": "Ausgewählte Projekte",
    "projects.more": "Weitere Projekte",
    "projects.updated": "Aktualisiert",
    "projects.code": "Code auf GitHub",
    "projects.demo": "Live-Demo",
    "projects.tags": "Schlagwörter",
    "projects.screenshotOf": "Screenshot von",
    "status.live": "Live",
    "status.demo": "Demo",
    "status.wip": "In Arbeit",
    "status.archived": "Abgeschlossen",
    "contact.title": "Kontakt",
    "contact.description":
      "Kontakt zu Kacper Zaleski, AI / Machine Learning Engineer in Wien: E-Mail, GitHub und LinkedIn.",
    "contact.heading": "Kontakt aufnehmen",
    "contact.lede":
      "Am besten erreichen Sie mich per E-Mail. Ich lebe in Wien und lese Deutsch, Englisch und Polnisch.",
    "contact.email": "E-Mail",
    "404.title": "Seite nicht gefunden",
    "404.text": "Diese Seite gibt es nicht (mehr).",
    "404.home": "Zur Startseite",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)["en"];

export function useTranslations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key] ?? ui.en[key];
}
