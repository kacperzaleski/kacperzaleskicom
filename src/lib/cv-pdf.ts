import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import PDFDocument from "pdfkit";
import { type CV, formatSpan } from "~/lib/cv";

/**
 * Renders the CV to an A4 PDF from the same data as /cv.
 * Pure JS (pdfkit), so it runs in any build environment without a browser.
 */

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) =>
  readFileSync(require.resolve(`@fontsource/${pkg}/files/${file}`));

// fontsource ships per-subset files; "latin" covers U+0000-00FF plus common
// punctuation (– ’ …). assertGlyphs() fails the build if text needs more.
const FONTS = {
  body: font("noto-sans", "noto-sans-latin-400-normal.woff"),
  bodyItalic: font("noto-sans", "noto-sans-latin-400-italic.woff"),
  bodyBold: font("noto-sans", "noto-sans-latin-600-normal.woff"),
  display: font(
    "bricolage-grotesque",
    "bricolage-grotesque-latin-700-normal.woff",
  ),
};

const C = {
  text: "#1c1419",
  muted: "#6b5a65",
  accent: "#c2187a",
  rule: "#ead9e3",
};

const BODY = 9.2;
const PAGE = { margin: 40, dateCol: 92, gap: 14 };

type Doc = InstanceType<typeof PDFDocument>;

function collectText(cv: CV): string {
  return JSON.stringify(cv);
}

function assertGlyphs(doc: Doc, cv: CV) {
  const missing = new Set<string>();
  for (const name of ["body", "bodyItalic", "bodyBold", "display"]) {
    doc.font(name);
    // pdfkit exposes the underlying fontkit font on `_font.font`.
    const fk = (
      doc as unknown as {
        _font: { font: { hasGlyphForCodePoint(c: number): boolean } };
      }
    )._font.font;
    for (const ch of collectText(cv)) {
      const cp = ch.codePointAt(0)!;
      if (cp >= 0x20 && !fk.hasGlyphForCodePoint(cp)) missing.add(ch);
    }
  }
  if (missing.size) {
    throw new Error(
      `CV PDF: font is missing glyphs for ${[...missing].map((c) => JSON.stringify(c)).join(" ")}. ` +
        "Add the matching fontsource subset (e.g. latin-ext) in src/lib/cv-pdf.ts.",
    );
  }
}

function wave(doc: Doc, x: number, y: number, w: number) {
  const seg = w / 3;
  const a = 3;
  doc
    .save()
    .lineWidth(1.6)
    .strokeColor(C.accent)
    .lineCap("round")
    .moveTo(x, y)
    .bezierCurveTo(
      x + seg * 0.35,
      y - a * 2,
      x + seg * 0.65,
      y - a * 2,
      x + seg,
      y,
    )
    .bezierCurveTo(
      x + seg * 1.35,
      y + a * 2,
      x + seg * 1.65,
      y + a * 2,
      x + seg * 2,
      y,
    )
    .bezierCurveTo(
      x + seg * 2.35,
      y - a * 2,
      x + seg * 2.65,
      y - a * 2,
      x + seg * 3,
      y,
    )
    .stroke()
    .restore();
}

export function renderCvPdf(cv: CV): Promise<Uint8Array<ArrayBuffer>> {
  const doc = new PDFDocument({
    size: "A4",
    margin: PAGE.margin,
    info: {
      Title: `${cv.name} – CV`,
      Author: cv.name,
      Subject: cv.role,
    },
    pdfVersion: "1.7",
    lang: "en",
    displayTitle: true,
  });
  for (const [name, data] of Object.entries(FONTS))
    doc.registerFont(name, data);
  assertGlyphs(doc, cv);

  const chunks: Uint8Array[] = [];
  doc.on("data", (c: Uint8Array) => chunks.push(c));
  const done = new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const left = PAGE.margin;
  const width = doc.page.width - PAGE.margin * 2;
  const bodyX = left + PAGE.dateCol + PAGE.gap;
  const bodyW = width - PAGE.dateCol - PAGE.gap;
  const bottom = () => doc.page.height - PAGE.margin;

  const ensure = (h: number) => {
    if (doc.y + h > bottom()) doc.addPage();
  };

  // Header
  doc
    .font("display")
    .fontSize(28)
    .fillColor(C.text)
    .text(cv.name, left, PAGE.margin);
  doc.moveDown(0.15);
  doc.font("bodyBold").fontSize(11.5).fillColor(C.accent).text(cv.role);
  doc.moveDown(0.3);
  doc.font("body").fontSize(BODY).fillColor(C.muted);
  doc.text(cv.location + "   ", { continued: true });
  cv.links.forEach((l, i) => {
    const last = i === cv.links.length - 1;
    doc.fillColor(C.accent).text(l.label, { link: l.url, continued: !last });
    if (!last) doc.fillColor(C.muted).text("   ·   ", { continued: true });
  });
  doc.moveDown(0.6);
  doc
    .moveTo(left, doc.y)
    .lineTo(left + width, doc.y)
    .lineWidth(0.6)
    .strokeColor(C.rule)
    .stroke();
  doc.moveDown(0.4);

  const section = (title: string) => {
    ensure(60);
    doc.moveDown(0.45);
    const y = doc.y;
    wave(doc, left, y + 7, 26);
    doc
      .font("display")
      .fontSize(13)
      .fillColor(C.text)
      .text(title, left + 36, y);
    doc.moveDown(0.35);
  };

  /** Two-column row: muted label/date on the left, content on the right. */
  const row = (label: string, draw: () => void, measure: () => number) => {
    ensure(measure() + 4);
    const y = doc.y;
    doc
      .font("body")
      .fontSize(BODY)
      .fillColor(C.muted)
      .text(label, left, y + 0.5, {
        width: PAGE.dateCol,
      });
    const afterLabel = doc.y;
    doc.y = y;
    doc.x = bodyX;
    draw();
    doc.y = Math.max(doc.y, afterLabel);
    doc.x = left;
    doc.moveDown(0.32);
  };

  const entry = (
    when: string,
    title: string,
    org: string,
    loc: string | undefined,
    text: string | undefined,
  ) => {
    const heading = () => {
      doc
        .font("bodyBold")
        .fontSize(10.5)
        .fillColor(C.text)
        .text(`${title}, `, bodyX, doc.y, {
          width: bodyW,
          continued: true,
        });
      doc.font("bodyItalic").text(org, { continued: !!loc });
      if (loc) doc.font("body").fillColor(C.muted).text(`, ${loc}`);
    };
    const measure = () => {
      doc.font("bodyBold").fontSize(10.5);
      let h = doc.heightOfString(`${title}, ${org}${loc ? `, ${loc}` : ""}`, {
        width: bodyW,
      });
      if (text) {
        doc.font("body").fontSize(BODY);
        h += doc.heightOfString(text, { width: bodyW, lineGap: 1 }) + 2;
      }
      return h;
    };
    row(
      when,
      () => {
        heading();
        if (text) {
          doc.moveDown(0.15);
          doc
            .font("body")
            .fontSize(BODY)
            .fillColor(C.text)
            .text(text, bodyX, doc.y, {
              width: bodyW,
              lineGap: 1,
            });
        }
      },
      measure,
    );
  };

  const pair = (label: string, value: string) => {
    const measure = () => {
      doc.font("body").fontSize(BODY);
      return doc.heightOfString(value, { width: bodyW, lineGap: 1 });
    };
    row(
      label,
      () => {
        doc
          .font("body")
          .fontSize(BODY)
          .fillColor(C.text)
          .text(value, bodyX, doc.y, {
            width: bodyW,
            lineGap: 1,
          });
      },
      measure,
    );
  };

  section("Profile");
  doc
    .font("body")
    .fontSize(BODY)
    .fillColor(C.text)
    .text(cv.profile, left, doc.y, {
      width,
      lineGap: 1,
    });
  doc.moveDown(0.3);

  section("Experience");
  for (const e of cv.experience)
    entry(formatSpan(e.start, e.end), e.title, e.org, e.location, e.summary);

  section("Education");
  for (const e of cv.education)
    entry(
      formatSpan(e.start, e.end),
      e.degree,
      e.institution,
      e.location,
      e.details,
    );

  section("Technical skills");
  for (const s of cv.skills) pair(s.group, s.items.join(", "));

  section("Languages");
  pair(
    "",
    cv.languages
      .map((l) => `${l.name} (${l.level.toLowerCase()})`)
      .join("  ·  "),
  );

  section("Interests");
  for (const i of cv.interests) pair(i.label, i.text);

  doc.end();
  return done;
}
