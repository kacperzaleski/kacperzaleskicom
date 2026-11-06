# kacperzaleski.com

Personal site: CV, projects, contact. Static [Astro](https://astro.build) site on
Cloudflare Pages. No cookies, no trackers, no client framework.

## Quick start

```sh
corepack enable          # once, provides pnpm
pnpm install
pnpm dev                 # http://localhost:4321
```

| Command        | What it does                                             |
| -------------- | -------------------------------------------------------- |
| `pnpm dev`     | Dev server with hot reload                               |
| `pnpm sync`    | Refresh project data from GitHub only                    |
| `pnpm build`   | `sync` + static build into `dist/`                       |
| `pnpm preview` | Serve `dist/` locally                                    |
| `pnpm check`   | Type-check (`astro check`)                               |
| `pnpm lint`    | ESLint + Prettier check (`pnpm format` fixes formatting) |

Node version: `.nvmrc` (24). TypeScript is pinned to 6.x because `astro check`
and `typescript-eslint` don't support TS 7 yet.

## Where things live

```
src/
  data/cv.yml                  CV content (source for /cv AND /cv.pdf)
  content/projects/<slug>.md   Local overrides for project cards
  generated/projects.json      Written by the sync script (committed)
  assets/projects/             Project screenshots (written by sync, committed)
  assets/brand/                Logo source files
  pages/[...locale]/           Pages in EN (/cv) and DE (/de/cv), one file each
  pages/impressum, datenschutz German-only legal pages
  i18n/index.ts                UI strings (en/de) and language/path helpers
  pages/og/[slug].png.ts       Social preview images, built at build time
  lib/cv.ts, lib/cv-pdf.ts     CV loader/validation and PDF renderer
  lib/og.ts                    OG image list + renderer
  components/Waves.astro       The wave pattern
  styles/global.css            Colours, fonts, base styles (tokens at the top)
  consts.ts                    Site title, nav, contact email
projects.config.yml            Which GitHub repos appear on /projects
scripts/sync-projects.ts       Build-time GitHub sync
public/                        Copied as-is (favicons, manifest)
```

## Languages (English / German)

- English lives at `/…`, German at `/de/…`. Every page in
  `src/pages/[...locale]/` is built twice. The EN | DE switch in the header
  links to the same page in the other language; `hreflang` links are in each
  page and in the sitemap.
- **UI text** (nav, buttons, headings): `src/i18n/index.ts`, one entry per
  language. A missing German string falls back to English.
- **CV**: any text in `cv.yml` is either a plain string (same in both) or
  `{ en: …, de: … }`. Quote values containing commas, or use the block form
  (`en: …` / `de: …` on separate lines); the build fails on a stray key.
- **Projects**: add a `de:` block to `src/content/projects/<slug>.md` with
  `title`, `tagline`, `body`, `screenshot_alt` (all optional).
- `/impressum` and `/datenschutz` are German only, on purpose.
- New page: put it in `src/pages/[...locale]/`, add
  `export const getStaticPaths = localeStaticPaths;` and read `lang` from
  `Astro.props` (see any existing page).

## Edit the CV

Edit `src/data/cv.yml`. `/cv`, `/de/cv`, `/cv.pdf` and `/de/cv.pdf` are all generated from it, so
they can't drift apart. The build fails with a clear message if a date is
malformed or a field is missing.

- Never put a phone number, home address or plain email in it: it's public.
- The PDF must stay one page; check `dist/cv.pdf` after bigger edits.
- If you use a character outside basic Latin (e.g. Polish "ł"), the build
  stops and tells you which font subset to add in `src/lib/cv-pdf.ts`.

## Add a project

1. In the project repo, add `portfolio.yml` at the root:

   ```yaml
   title: My Project
   tagline: One line, max 100 characters
   status: live # live | demo | wip | archived ("archived" shows as "Completed")
   featured: false
   tags: [PyTorch, FastAPI]
   demo_url: https://my-project.kacperzaleski.com # optional
   screenshot: docs/screenshot.png # path in that repo, 1600x900 preferred
   ```

2. Add the repo to `projects.config.yml`:

   ```yaml
   - repo: kacperzaleski/my-project
     slug: my-project
   ```

3. Optional: `src/content/projects/my-project.md` overrides any field from
   `portfolio.yml` (front matter), and its body becomes the longer
   description on featured cards. Extra local-only fields:
   `screenshot_fit: contain` (letterbox instead of crop) and `screenshot_alt`.

4. `pnpm build`, commit the updated `src/generated/projects.json` and
   `src/assets/projects/*`, open a PR.

**Priority:** GitHub repo facts < `portfolio.yml` < local `.md` override.

**If GitHub is down or rate-limited** during a build, each project falls back
to its entry in the committed `projects.json`, with your local override files
still applied on top. The build never fails because of GitHub. Local builds:
`GITHUB_TOKEN=$(gh auth token) pnpm build` avoids the rate limit.

## Add a blog post (or any new section)

There is no blog yet. Adding a section is a folder + a collection, no
refactor:

1. Define a collection in `src/content.config.ts`:

   ```ts
   import { glob } from "astro/loaders";
   const blog = defineCollection({
     loader: glob({ pattern: "**/*.md", base: "src/content/blog" }),
     schema: z.object({
       title: z.string(),
       date: z.coerce.date(),
       draft: z.boolean().default(false),
     }),
   });
   export const collections = { projects, blog };
   ```

2. Write posts as `src/content/blog/<slug>.md` with that front matter.
3. Add `src/pages/[...locale]/blog/index.astro` (list) and a post page
   (via `getCollection("blog")` + `render()`), following the existing pages.
4. Add `{ href: "/blog", key: "nav.blog" }` to `NAV` in `src/consts.ts` and
   `"nav.blog"` in both languages in `src/i18n/index.ts`.
5. Optional: an OG image entry in `OG_PAGES` (`src/lib/og.ts`).

Scouts section rule: text only or group-level. Never photos of minors,
never children's names.

## Hosting, DNS and deploys

```
GitHub repo ──push──▶ Cloudflare Pages ──▶ kacperzaleski.com
     │                    ▲                 www → 301 → apex
     │ PR ───────────────▶│ preview URL per branch
     │                    │
GitHub Actions ──deploy hook (daily / on demand)──┘
```

- **Registrar:** Hostinger. Only the nameservers are set there
  (`athena.ns.cloudflare.com`, `john.ns.cloudflare.com`). Don't edit DNS in
  Hostinger: it isn't used.
- **DNS:** Cloudflare dashboard → `kacperzaleski.com` → DNS. The apex and
  `www` records were created by Pages "Custom domains"; don't edit them by hand.
- **www → apex redirect:** Cloudflare → `kacperzaleski.com` → Rules →
  Redirect Rule, condition `http.host eq "www.kacperzaleski.com"`, 301 to
  `concat("https://kacperzaleski.com", http.request.uri.path)`, keep query string.
- **Pages project** `kacperzaleskicom`: build `pnpm build`, output `dist`,
  env `NODE_VERSION=24`, production branch `main`. Optional env
  `GITHUB_TOKEN` (fine-grained, public repos read-only) to avoid GitHub API
  rate limits during the sync.
- **Deploys:** merge to `main` → production. Every PR/branch →
  `https://<branch>.kacperzaleskicom.pages.dev`, linked on the PR.
  Rollback: Pages project → Deployments → pick an older one → "Rollback".
- **Scheduled rebuild:** `.github/workflows/rebuild.yml` POSTs to the deploy
  hook stored in the GitHub secret `CF_DEPLOY_HOOK`: daily at 04:17 UTC,
  manually (Actions → Rebuild site → Run workflow), or when a project repo
  sends a `repository_dispatch` of type `project-updated`:

  ```yaml
  # in a project repo's workflow, after pushing
  - run: gh api repos/kacperzaleski/kacperzaleskicom/dispatches -f event_type=project-updated
    env:
      GH_TOKEN: ${{ secrets.SITE_DISPATCH_TOKEN }} # PAT with Contents: write on this repo
  ```

- **Project demos** live on `<slug>.kacperzaleski.com`: give each demo its
  own Pages project (or other host) and add the subdomain under that
  project's "Custom domains".
- **CI:** `.github/workflows/ci.yml` runs lint, check and build on every PR.

### Debugging

| Symptom                                                               | Likely cause                                                                                                                                               |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| You see Hostinger's "parked domain" page                              | Your DNS resolver still caches the old nameservers. Check `dig NS kacperzaleski.com @1.1.1.1` (should be Cloudflare); flush your DNS or switch to 1.1.1.1. |
| `www` doesn't redirect / redirect loop                                | Redirect rule condition must be `www.kacperzaleski.com`, not the apex.                                                                                     |
| Projects page shows old data                                          | Sync fell back to committed JSON (rate limit / GitHub down). See the build log for `[sync-projects] WARN`; set `GITHUB_TOKEN` in Cloudflare.               |
| Build fails on the CV                                                 | Message names the bad field or missing glyph in `cv.yml`.                                                                                                  |
| Pages build fails with "No preset version installed for command pnpm" | Branch has no `pnpm-lock.yaml` / `package.json` (e.g. an empty branch).                                                                                    |

## Contact email

Set in `src/consts.ts` (`EMAIL`). It's never written into the HTML as a
plain address; a small inline script builds the link. Planned: switch to a
Cloudflare Email Routing alias.

## Legal pages

`/impressum` and `/datenschutz` are drafts (visible "Entwurf" notice) and not
legal advice. Have them reviewed, then set `draft={false}` in both pages.
Update the Datenschutz text if you ever add analytics, embeds or forms. If
analytics is wanted, use Cloudflare Web Analytics (cookieless).
