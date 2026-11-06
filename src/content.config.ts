import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Projects come from src/generated/projects.json, written by
 * scripts/sync-projects.ts before every build. Local overrides live in
 * src/content/projects/<slug>.md and are merged by that script, not here.
 */
const projects = defineCollection({
  loader: file("src/generated/projects.json", {
    parser: (text) =>
      (JSON.parse(text) as { slug: string }[]).map((p) => ({
        id: p.slug,
        ...p,
      })),
  }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      repo: z.string(),
      repoUrl: z.url(),
      title: z.string(),
      tagline: z.string(),
      status: z.enum(["live", "demo", "wip", "archived"]),
      featured: z.boolean(),
      tags: z.array(z.string()),
      demoUrl: z.url().optional(),
      screenshot: image().optional(),
      screenshotFit: z.enum(["cover", "contain"]),
      screenshotAlt: z.string().optional(),
      language: z.string().optional(),
      stars: z.number(),
      pushedAt: z.string().optional(),
      body: z.string().optional(),
      de: z
        .object({
          title: z.string().optional(),
          tagline: z.string().optional(),
          body: z.string().optional(),
          screenshotAlt: z.string().optional(),
        })
        .optional(),
    }),
});

/**
 * Blog posts: src/content/blog/<slug>.md or src/content/blog/<slug>/index.md
 * (a folder lets you keep images next to the post). The slug is the file or
 * folder name and becomes the URL: /blog/<slug>.
 */
const blog = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "!**/_*", "!**/_*/**"],
    base: "src/content/blog",
    generateId: ({ entry }) => entry.replace(/(\/index)?\.md$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      /** Language the post is written in. */
      lang: z.enum(["en", "de"]).default("en"),
      tags: z.array(z.string()).default([]),
      /** Optional cover image, path relative to the post file. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** Drafts show up in `pnpm dev` only, never in the built site. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, blog };
