import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPosts } from "~/lib/blog";

// RSS feed of published posts (both languages), linked from every page's <head>.
export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  return rss({
    title: "Kacper Zaleski – Blog",
    description:
      "Notes on machine learning, projects and what Kacper Zaleski is working on.",
    site: site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.subtitle,
      pubDate: post.data.date,
      link: `/blog/${post.id}`,
      categories: post.data.tags,
    })),
    customData: "<language>en</language>",
  });
};
