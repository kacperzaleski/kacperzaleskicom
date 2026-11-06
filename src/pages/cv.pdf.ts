import type { APIRoute } from "astro";
import { cv } from "~/lib/cv";
import { renderCvPdf } from "~/lib/cv-pdf";

// Prerendered at build time into dist/cv.pdf.
export const GET: APIRoute = async () => {
  const pdf = await renderCvPdf(cv);
  return new Response(pdf, {
    headers: { "Content-Type": "application/pdf" },
  });
};
