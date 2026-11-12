import { parse } from "yaml";
import { z } from "astro/zod";
import raw from "~/data/cv.yml?raw";
import { type Lang, type L10n, tr, useTranslations } from "~/i18n";

const date = z.string().regex(/^\d{4}(-\d{2})?$/, 'Use "YYYY" or "YYYY-MM"');
/** Plain string, or { en, de } with optional de. */
const text = z.union([
  z.string(),
  // strict: catches YAML flow maps split by an unquoted comma ({ en: a, b }).
  z.object({ en: z.string(), de: z.string().optional() }).strict(),
]);
const span = { start: date, end: date.optional() };

const schema = z.object({
  name: z.string(),
  role: text,
  location: text,
  links: z.array(z.object({ label: z.string(), url: z.url() })),
  profile: text,
  experience: z.array(
    z.object({
      ...span,
      title: text,
      org: text,
      location: text.optional(),
      highlights: z.array(text).default([]),
    }),
  ),
  education: z.array(
    z.object({
      ...span,
      degree: text,
      institution: text,
      location: text.optional(),
      highlights: z.array(text).default([]),
    }),
  ),
  projects: z.array(
    z.object({
      name: text,
      subtitle: text.optional(),
      stack: z.array(text),
      url: z.url().optional(),
      highlights: z.array(text).default([]),
    }),
  ),
  skills: z.array(z.object({ group: text, items: z.array(text) })),
  languages: z.array(z.object({ name: text, level: text })),
  volunteering: z.array(
    z.object({
      start: date.optional(),
      end: date.optional(),
      title: text,
      org: text.optional(),
      text,
    }),
  ),
  interests: text,
});

const source = schema.parse(parse(raw));

/** Resolves every translatable field to plain strings for one language. */
type Resolved<T> = T extends L10n
  ? string
  : T extends (infer U)[]
    ? Resolved<U>[]
    : T extends object
      ? { [K in keyof T]: Resolved<T[K]> }
      : T;

export type CV = Resolved<z.infer<typeof schema>>;

function resolve(value: unknown, lang: Lang): unknown {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((v) => resolve(v, lang));
  if (value && typeof value === "object") {
    if ("en" in value && typeof (value as { en: unknown }).en === "string") {
      return tr(value as L10n, lang);
    }
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, resolve(v, lang)]),
    );
  }
  return value;
}

export function cvFor(lang: Lang): CV {
  return resolve(source, lang) as CV;
}

/** English CV (kept for callers that don't care about language). */
export const cv = cvFor("en");

const MONTHS: Record<Lang, string[]> = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  // Austrian German: "Jän" for January.
  de: [
    "Jän",
    "Feb",
    "Mär",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez",
  ],
};

function formatDate(d: string, lang: Lang): string {
  const [y, m] = d.split("-");
  return m ? `${MONTHS[lang][Number(m) - 1]} ${y}` : (y ?? d);
}

/** "Jun 2024 – Dec 2024", "Jul 2021", "2026 – present" / "2026 – heute". */
export function formatSpan(
  start: string,
  end: string | undefined,
  lang: Lang = "en",
): string {
  if (end === start) return formatDate(start, lang);
  const present = useTranslations(lang)("cv.present");
  return `${formatDate(start, lang)} – ${end ? formatDate(end, lang) : present}`;
}
