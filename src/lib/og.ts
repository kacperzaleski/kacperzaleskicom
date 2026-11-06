import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import logoSvg from "~/assets/brand/kz-logo.svg?raw";

/**
 * Open Graph images (1200x630 PNG), rendered at build time.
 * satori lays out text into SVG, resvg rasterises it. No browser needed.
 */

export interface OgPage {
  /** File name under /og/, without extension. */
  slug: string;
  /** Page path this image belongs to. */
  path: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

export const OG_PAGES: OgPage[] = [
  {
    slug: "home",
    path: "/",
    eyebrow: "AI / Machine Learning Engineer",
    title: "Kacper Zaleski",
    subtitle:
      "Model training, data engineering and software engineering. Vienna.",
  },
  {
    slug: "cv",
    path: "/cv",
    eyebrow: "Kacper Zaleski",
    title: "CV",
    subtitle: "Experience, education and skills. PDF download included.",
  },
  {
    slug: "projects",
    path: "/projects",
    eyebrow: "Kacper Zaleski",
    title: "Projects",
    subtitle: "Medical imaging, knowledge graphs and other things I've built.",
  },
  {
    slug: "contact",
    path: "/contact",
    eyebrow: "Kacper Zaleski",
    title: "Get in touch",
    subtitle: "Email, GitHub and LinkedIn.",
  },
];

export const OG_DEFAULT = "home";

/** OG image URL path for a page path; falls back to the home image. */
export function ogImageFor(pathname: string): string {
  const clean = pathname.replace(/\/$/, "") || "/";
  const page = OG_PAGES.find((p) => p.path === clean);
  return `/og/${page?.slug ?? OG_DEFAULT}.png`;
}

const require = createRequire(import.meta.url);
const font = (file: string) => readFileSync(require.resolve(file));

const FONTS = [
  {
    name: "Display",
    data: font(
      "@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff",
    ),
    weight: 700 as const,
  },
  {
    name: "Body",
    data: font("@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff"),
    weight: 400 as const,
  },
  {
    name: "Body",
    data: font("@fontsource/noto-sans/files/noto-sans-latin-600-normal.woff"),
    weight: 600 as const,
  },
];

const W = 1200;
const H = 630;
const C = {
  bg: "#0b1020", // logo navy
  text: "#f5f0f4",
  muted: "#b7b0c4",
  accent: "#ff2fb9", // logo magenta
};

/** Same idea as Waves.astro: stacked sine lines, as an SVG data URL. */
function wavesDataUrl(): string {
  const h = 220;
  const lines = 9;
  const paths: string[] = [];
  for (let i = 0; i < lines; i++) {
    const t = i / (lines - 1);
    const base = h * (0.2 + 0.6 * t);
    const amp = 26 * (0.55 + 0.45 * Math.sin(Math.PI * t));
    const phase = i * 0.9;
    let d = "";
    for (let x = 0; x <= W; x += 12) {
      const y =
        base +
        amp * Math.sin((x / W) * Math.PI * 4 + phase) +
        amp * 0.28 * Math.sin((x / W) * Math.PI * 8 + phase * 1.7);
      d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`;
    }
    const op = (0.25 + 0.75 * Math.sin(Math.PI * t) ** 2).toFixed(2);
    paths.push(
      `<path d="${d}" fill="none" stroke="${C.accent}" stroke-width="2" stroke-opacity="${op}"/>`,
    );
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}">${paths.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const LOGO = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;
const WAVES = wavesDataUrl();

// Minimal element helper so we don't need React/JSX for satori.
type Node = { type: string; props: Record<string, unknown> };
const el = (
  type: string,
  style: Record<string, unknown>,
  children?: (Node | string)[] | Node | string,
  extra: Record<string, unknown> = {},
): Node => ({ type, props: { style, children, ...extra } });

export async function renderOg(page: OgPage): Promise<Uint8Array<ArrayBuffer>> {
  const tree = el(
    "div",
    {
      width: W,
      height: H,
      display: "flex",
      flexDirection: "column",
      backgroundColor: C.bg,
      position: "relative",
      fontFamily: "Body",
    },
    [
      el(
        "img",
        { position: "absolute", left: 0, bottom: 10, width: W, height: 220 },
        undefined,
        {
          src: WAVES,
          width: W,
          height: 220,
        },
      ),
      el(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px 0",
        },
        [
          el(
            "div",
            {
              fontSize: 28,
              fontWeight: 600,
              color: C.accent,
              letterSpacing: 1,
              textTransform: "uppercase",
            },
            page.eyebrow,
          ),
          el(
            "div",
            {
              fontFamily: "Display",
              fontSize: page.title.length > 16 ? 96 : 120,
              fontWeight: 700,
              color: C.text,
              letterSpacing: -3,
              lineHeight: 1.05,
              marginTop: 8,
            },
            page.title,
          ),
          el(
            "div",
            {
              fontSize: 34,
              color: C.muted,
              marginTop: 24,
              maxWidth: 900,
              lineHeight: 1.35,
            },
            page.subtitle,
          ),
        ],
      ),
      el(
        "img",
        { position: "absolute", top: 56, right: 72, width: 112, height: 112 },
        undefined,
        { src: LOGO, width: 112, height: 112 },
      ),
      el(
        "div",
        {
          position: "absolute",
          right: 80,
          bottom: 40,
          fontSize: 26,
          fontWeight: 600,
          color: C.text,
        },
        "kacperzaleski.com",
      ),
    ],
  );

  // satori's types expect a ReactNode; our plain objects have the same shape.
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: W,
    height: H,
    fonts: FONTS,
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W } })
    .render()
    .asPng();
  return new Uint8Array(png);
}
