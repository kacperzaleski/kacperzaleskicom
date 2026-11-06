import type { APIRoute, GetStaticPaths } from "astro";
import { OG_PAGES, renderOg, type OgPage } from "~/lib/og";

// Prerendered at build time into dist/og/<slug>.png.
export const getStaticPaths = (() =>
  OG_PAGES.map((page) => ({
    params: { slug: page.slug },
    props: { page },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ page: OgPage }> = async ({ props }) => {
  const png = await renderOg(props.page);
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
