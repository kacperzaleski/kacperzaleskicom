import type { APIRoute } from "astro";
import { OG_PAGES, renderOg, type OgPage } from "~/lib/og";
import { getPosts } from "~/lib/blog";

// Prerendered at build time into dist/og/<slug>.png: fixed pages plus one
// image per blog post (/og/blog-<post>.png).
export async function getStaticPaths() {
  const posts = await getPosts();
  const postPages: OgPage[] = posts.map((post) => ({
    slug: `blog-${post.id}`,
    path: `/blog/${post.id}`,
    eyebrow: "Kacper Zaleski · Blog",
    title: post.data.title,
    subtitle: post.data.subtitle,
  }));
  return [...OG_PAGES, ...postPages].map((page) => ({
    params: { slug: page.slug },
    props: { page },
  }));
}

export const GET: APIRoute<{ page: OgPage }> = async ({ props }) => {
  const png = await renderOg(props.page);
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
