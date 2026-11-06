import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
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
    }),
});

export const collections = { projects };
