# Personal website: working brief for Claude Code

Owner: Kacper (Vienna). This repo is his personal site: CV, project portfolio, and room to grow (scouts, Instagram, blog).
He works casually and wants direct answers. Don't pad, don't hedge, flag real risks.

## Goals
1. Landing page + CV page (printable / "download PDF" from the same source data).
2. Projects page: one card per GitHub project (title, tagline, tags, screenshot, repo link, "Live demo" link to that project's own frontend).
3. Extensible sections later: blog, scouts, Instagram feed/links. Structure the code so adding a section = adding a folder + content collection, not a refactor.
4. Fast, accessible, no tracking cookies. Static output.

## Stack (decided, don't re-litigate without asking)
- Astro (static output), TypeScript, content collections (Markdown/MDX) for projects, blog, CV entries.
- Styling: Tailwind or plain CSS, your call, but keep it small. No component library.
- Hosting: Cloudflare Pages, git-connected to this repo. `main` = production, every PR = preview URL.
- Domain DNS lives on Cloudflare (registrar stays Hostinger). Project demos live on subdomains: `<slug>.<domain>`.
- Package manager: pnpm. Node version pinned in `.nvmrc` and `package.json` engines.

## Data model
- CV data: `src/data/cv.yml` (single source of truth; renders the CV page AND the PDF).
- Projects: `src/content/projects/<slug>.md` front matter = curated overrides. At build time `scripts/sync-projects.ts`:
  - reads `projects.config.yml` (list of `owner/repo` + optional overrides),
  - fetches each repo's `portfolio.yml` from its default branch (raw GitHub, public repos; token via `GITHUB_TOKEN` env if private),
  - fetches repo facts (description, language, stars, last push) from the GitHub API,
  - merges: repo `portfolio.yml` < local override file,
  - writes `src/generated/projects.json`. Build must NOT fail if GitHub is unreachable: fall back to the last committed copy of the JSON.
- Never call the GitHub API from the browser. Everything is build-time.

### `portfolio.yml` contract (lives in each project repo root)
```yaml
title: string
tagline: string          # <= 100 chars
status: live | demo | wip | archived
featured: boolean
tags: [string]
demo_url: https://<slug>.<domain>   # optional
screenshot: docs/screenshot.png      # relative to repo root, 1600x900 preferred
```

## Workflow rules
- Work on a branch `feat/<thing>`, open a PR, never push to `main`.
- Use a git worktree if another session is active in this repo. One concern per PR.
- Small PRs: layout/design, CV page, projects page, sync script, CI, each separate.
- Before saying a PR is ready: `pnpm build`, `pnpm astro check`, `pnpm lint` pass; run Lighthouse locally on home + projects (target 95+ on all four); screenshot desktop + mobile and include in the PR description.
- Rebuild trigger: Cloudflare Pages deploy hook URL is stored as GitHub secret `CF_DEPLOY_HOOK` (set by Kacper). A scheduled workflow (daily) and `repository_dispatch` from project repos call it so the projects page stays fresh.

## Do not
- Do not put real phone number or home address anywhere. Email via a contact page using an alias (set up by Kacper), not plain text where avoidable.
- Do not publish photos of minors (scouts section). Text-only or group-level, no faces/names of children, ever.
- Do not commit secrets, tokens, `.env` files. Do not ask Kacper to paste API tokens into the chat; instruct him to set them in the Cloudflare / GitHub UI.
- Do not invent CV content. Anything not in `cv.yml` or provided by Kacper is a TODO placeholder, listed in the PR.
- Do not add analytics/trackers without asking. If analytics is wanted: Cloudflare Web Analytics (cookieless).
- Do not add heavy client JS frameworks for decoration.

## Legal / compliance (Austria)
A personal site with a CV and contact info likely needs an Impressum / Offenlegung page. Add `/impressum` and `/datenschutz` stubs with clearly marked TODOs for Kacper to fill. Say plainly in the PR that this is not legal advice.

## Design direction
Ask Kacper for 2-3 reference sites he likes before designing. Until then: clean, text-forward, dark/light via `prefers-color-scheme`, one accent colour, good typography, no stock gradients. Projects page leads with screenshots.

## Definition of done for the first launch
- [ ] Home, CV, Projects, Contact, Impressum, Datenschutz, 404
- [ ] CV PDF generated from `cv.yml` at build
- [ ] Projects page populated from at least 3 repos via sync script
- [ ] Open Graph images + sitemap + robots.txt + favicon
- [ ] Preview deploy works on a PR; production deploy on merge to `main`
- [ ] README: how to add a project, how to add a blog post, how DNS/hosting is wired (so Kacper can debug without you)
