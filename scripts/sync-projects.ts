/**
 * Build-time sync of project cards from GitHub.
 *
 *   node scripts/sync-projects.ts            (runs before `astro build`)
 *
 * For each repo in projects.config.yml:
 *   - GitHub API: description, language, stars, last push, default branch
 *   - raw portfolio.yml from the default branch (optional)
 *   - local overrides from src/content/projects/<slug>.md front matter
 *   - downloads the screenshot into src/assets/projects/<slug>.<ext>
 * Merge order: repo facts < portfolio.yml < local override.
 *
 * Writes src/generated/projects.json. Never fails the build because GitHub is
 * unreachable: any repo that can't be fetched keeps its entry (and image) from
 * the last committed projects.json.
 *
 * Set GITHUB_TOKEN to raise the API rate limit or read private repos.
 */
import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = join(ROOT, "projects.config.yml");
const OVERRIDES = join(ROOT, "src/content/projects");
const OUT = join(ROOT, "src/generated/projects.json");
const IMG_DIR = join(ROOT, "src/assets/projects");
// Image paths in the JSON are relative to the JSON file (Astro image() resolves them).
const IMG_REL = "../assets/projects";

const STATUSES = ["live", "demo", "wip", "archived"] as const;
type Status = (typeof STATUSES)[number];

interface Project {
  slug: string;
  repo: string;
  repoUrl: string;
  title: string;
  tagline: string;
  status: Status;
  featured: boolean;
  tags: string[];
  demoUrl?: string | undefined;
  screenshot?: string | undefined;
  screenshotFit: "cover" | "contain";
  screenshotAlt?: string | undefined;
  language?: string | undefined;
  stars: number;
  pushedAt?: string | undefined;
  body?: string | undefined;
}

const token = process.env.GITHUB_TOKEN;
const headers: Record<string, string> = {
  "User-Agent": "kacperzaleskicom-sync",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const log = (msg: string) => console.log(`[sync-projects] ${msg}`);
const warn = (msg: string) => console.warn(`[sync-projects] WARN ${msg}`);

async function get(url: string, accept: string): Promise<Response> {
  return fetch(url, {
    headers: { ...headers, Accept: accept },
    signal: AbortSignal.timeout(10_000),
  });
}

async function getJson<T>(url: string): Promise<T> {
  const res = await get(url, "application/vnd.github+json");
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return (await res.json()) as T;
}

/** Raw file from a repo; undefined on 404, throws on other errors. */
async function getRaw(
  repo: string,
  ref: string,
  path: string,
): Promise<Response | undefined> {
  const url = `https://raw.githubusercontent.com/${repo}/${ref}/${path.replace(/^\/+/, "")}`;
  const res = await get(url, "*/*");
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res;
}

function readOverride(slug: string): {
  data: Record<string, unknown>;
  body?: string | undefined;
} {
  const file = join(OVERRIDES, `${slug}.md`);
  if (!existsSync(file)) return { data: {} };
  const text = readFileSync(file, "utf8");
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return { data: {}, body: text.trim() || undefined };
  return {
    data: (parse(m[1] ?? "") as Record<string, unknown> | null) ?? {},
    body: m[2]?.trim() || undefined,
  };
}

const str = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

function pick(...layers: Record<string, unknown>[]) {
  return (key: string): unknown => {
    for (let i = layers.length - 1; i >= 0; i--) {
      const v = layers[i]?.[key];
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  };
}

function removeImages(slug: string) {
  for (const f of readdirSync(IMG_DIR)) {
    if (f.replace(extname(f), "") === slug) rmSync(join(IMG_DIR, f));
  }
}

interface RepoFacts {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  default_branch: string;
  homepage: string | null;
  topics?: string[];
}

async function syncOne(
  entry: { repo: string; slug?: string },
  previous: Project | undefined,
): Promise<Project> {
  const slug = entry.slug ?? entry.repo.split("/")[1]!.toLowerCase();
  const override = readOverride(slug);

  try {
    const facts = await getJson<RepoFacts>(
      `https://api.github.com/repos/${entry.repo}`,
    );
    const ref = facts.default_branch;

    let portfolio: Record<string, unknown> = {};
    const pf = await getRaw(entry.repo, ref, "portfolio.yml");
    if (pf)
      portfolio =
        (parse(await pf.text()) as Record<string, unknown> | null) ?? {};

    const base: Record<string, unknown> = {
      title: facts.name,
      tagline: facts.description ?? "",
      tags: facts.topics ?? [],
      status: "wip",
      featured: false,
      demo_url: facts.homepage || undefined,
    };
    const v = pick(base, portfolio, override.data);

    const status = String(v("status"));
    if (!STATUSES.includes(status as Status)) {
      throw new Error(
        `invalid status "${status}" (use ${STATUSES.join(" | ")})`,
      );
    }
    const tagline = str(v("tagline")) ?? "";
    if (tagline.length > 100)
      warn(`${slug}: tagline is ${tagline.length} chars (limit 100)`);

    // Screenshot: always a path inside the repo, downloaded and committed.
    let screenshot: string | undefined;
    const shotPath = str(v("screenshot"));
    if (shotPath) {
      const res = await getRaw(entry.repo, ref, shotPath);
      if (!res) {
        warn(
          `${slug}: screenshot ${shotPath} not found in ${entry.repo}@${ref}`,
        );
      } else {
        const ext = extname(shotPath).toLowerCase() || ".png";
        removeImages(slug);
        writeFileSync(
          join(IMG_DIR, `${slug}${ext}`),
          Buffer.from(await res.arrayBuffer()),
        );
        screenshot = `${IMG_REL}/${slug}${ext}`;
      }
    } else {
      removeImages(slug);
    }

    const fit = str(v("screenshot_fit"));
    return {
      slug,
      repo: entry.repo,
      repoUrl: facts.html_url,
      title: str(v("title")) ?? facts.name,
      tagline,
      status: status as Status,
      featured: v("featured") === true,
      tags: Array.isArray(v("tags"))
        ? (v("tags") as unknown[]).map(String)
        : [],
      demoUrl: str(v("demo_url")),
      screenshot,
      screenshotFit: fit === "contain" ? "contain" : "cover",
      screenshotAlt: str(v("screenshot_alt")),
      language: facts.language ?? undefined,
      stars: facts.stargazers_count,
      pushedAt: facts.pushed_at,
      body: override.body,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    if (previous) {
      warn(`${slug}: ${reason}; keeping last committed data`);
      return previous;
    }
    throw new Error(
      `${slug}: ${reason}, and no previous data to fall back to`,
      {
        cause: err,
      },
    );
  }
}

async function main() {
  const config = parse(readFileSync(CONFIG, "utf8")) as {
    projects: { repo: string; slug?: string }[];
  };
  const previous: Project[] = existsSync(OUT)
    ? (JSON.parse(readFileSync(OUT, "utf8")) as Project[])
    : [];
  const prevBySlug = new Map(previous.map((p) => [p.slug, p]));

  const results = await Promise.allSettled(
    config.projects.map((e) =>
      syncOne(e, prevBySlug.get(e.slug ?? e.repo.split("/")[1]!.toLowerCase())),
    ),
  );

  const projects: Project[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") projects.push(r.value);
    else
      warn(
        `skipped: ${r.reason instanceof Error ? r.reason.message : r.reason}`,
      );
  }

  projects.sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""),
  );

  writeFileSync(OUT, JSON.stringify(projects, null, 2) + "\n");
  log(`wrote ${projects.length} project(s) to ${OUT.replace(ROOT + "/", "")}`);
}

main().catch((err) => {
  // Last resort: never break the build if a committed copy exists.
  if (existsSync(OUT)) {
    warn(
      `sync failed (${err instanceof Error ? err.message : err}); using committed projects.json`,
    );
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
