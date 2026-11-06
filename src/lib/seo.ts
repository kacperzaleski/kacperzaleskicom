/**
 * schema.org structured data (JSON-LD) so search engines understand who the
 * site is about. Built from cv.yml so it stays in sync with the CV.
 * The email is deliberately not included (it would be plain text in the HTML).
 */
import { cvFor } from "~/lib/cv";
import type { Lang } from "~/i18n";
import type { Post } from "~/lib/blog";

const SITE_URL = "https://kacperzaleski.com";
export const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

type JsonLd = Record<string, unknown>;

export function personSchema(lang: Lang): JsonLd {
  const cv = cvFor(lang);
  const institutions = [...new Set(cv.education.map((e) => e.institution))];
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: cv.name,
    url: SITE_URL,
    jobTitle: cv.role,
    address: {
      "@type": "PostalAddress",
      addressLocality: lang === "de" ? "Wien" : "Vienna",
      addressCountry: "AT",
    },
    alumniOf: institutions.map((name) => ({
      "@type": "EducationalOrganization",
      name,
    })),
    knowsAbout: [
      "Machine learning",
      "Deep learning",
      "PyTorch",
      "Diffusion models",
      "Medical imaging",
      "Knowledge graphs",
      "Software engineering",
    ],
    knowsLanguage: ["de", "en", "pl"],
    sameAs: cv.links
      .map((l) => l.url)
      .filter((url) => !url.startsWith(SITE_URL)),
  };
}

export function websiteSchema(lang: Lang): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "Kacper Zaleski",
    inLanguage: lang,
    publisher: { "@id": PERSON_ID },
  };
}

/** CV page: a profile page about the person. */
export function profilePageSchema(lang: Lang, url: URL): JsonLd {
  return {
    "@type": "ProfilePage",
    url: url.href,
    inLanguage: lang,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: personSchema(lang),
  };
}

export function blogPostingSchema(post: Post, url: URL, image: URL): JsonLd {
  const { title, subtitle, date, updated, lang, tags } = post.data;
  return {
    "@type": "BlogPosting",
    headline: title,
    description: subtitle,
    datePublished: date.toISOString(),
    dateModified: (updated ?? date).toISOString(),
    inLanguage: lang,
    keywords: tags.join(", ") || undefined,
    url: url.href,
    mainEntityOfPage: url.href,
    image: image.href,
    author: { "@id": PERSON_ID, "@type": "Person", name: "Kacper Zaleski" },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/** Serialise for a <script type="application/ld+json">; escapes "<". */
export function jsonLdScript(items: JsonLd[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": items,
  }).replace(/</g, "\\u003c");
}
