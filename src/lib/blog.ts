import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** Drafts are visible in `pnpm dev`, or in a build with SHOW_DRAFTS=1 (for previews). */
const showDrafts = import.meta.env.DEV || process.env["SHOW_DRAFTS"] === "1";

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", (p) => showDrafts || !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Rough reading time in minutes (~220 words per minute). */
export function readingTime(markdown: string | undefined): number {
  const words = (markdown ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(date: Date, lang: "en" | "de"): string {
  return date.toLocaleDateString(lang === "de" ? "de-AT" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
