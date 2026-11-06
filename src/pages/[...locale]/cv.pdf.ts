import type { APIRoute } from "astro";
import { cvFor } from "~/lib/cv";
import { renderCvPdf } from "~/lib/cv-pdf";
import { localeStaticPaths, type Lang } from "~/i18n";

// Prerendered at build time into dist/cv.pdf and dist/de/cv.pdf.
export const getStaticPaths = localeStaticPaths;

export const GET: APIRoute<{ lang: Lang }> = async ({ props }) => {
  const pdf = await renderCvPdf(cvFor(props.lang), props.lang);
  return new Response(pdf, {
    headers: { "Content-Type": "application/pdf" },
  });
};
