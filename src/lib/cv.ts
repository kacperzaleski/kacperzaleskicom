import { parse } from "yaml";
import { z } from "astro/zod";
import raw from "~/data/cv.yml?raw";

const date = z.string().regex(/^\d{4}(-\d{2})?$/, 'Use "YYYY" or "YYYY-MM"');

const span = { start: date, end: date.optional() };

const schema = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  links: z.array(z.object({ label: z.string(), url: z.url() })),
  profile: z.string(),
  education: z.array(
    z.object({
      ...span,
      degree: z.string(),
      institution: z.string(),
      location: z.string().optional(),
      details: z.string().optional(),
    }),
  ),
  experience: z.array(
    z.object({
      ...span,
      title: z.string(),
      org: z.string(),
      location: z.string().optional(),
      summary: z.string(),
    }),
  ),
  skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
  interests: z.array(z.object({ label: z.string(), text: z.string() })),
});

export type CV = z.infer<typeof schema>;

export const cv: CV = schema.parse(parse(raw));

const MONTHS = [
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
];

function formatDate(d: string): string {
  const [y, m] = d.split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : (y ?? d);
}

/** "Jun 2024 – Dec 2024", "Jul 2021", "2026 – present". */
export function formatSpan(start: string, end?: string): string {
  if (end === start) return formatDate(start);
  return `${formatDate(start)} – ${end ? formatDate(end) : "present"}`;
}
