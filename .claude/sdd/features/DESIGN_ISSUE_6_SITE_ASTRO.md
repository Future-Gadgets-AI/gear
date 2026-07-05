# DESIGN — gear issue #6: Site (Astro + deploy-on-merge)

> Source: `DEFINE_ISSUE_6_SITE_ASTRO.md`. Astro APIs verified live 2026-07-04 against docs.astro.build, `withastro/astro` source on GitHub, the npm registry, and the GitHub Actions API — not from training memory (full list in the log below). Confidence 0.70: no KB domain and no matching specialist agent for Astro/frontend or plain GitHub-Pages CI in this catalog (`ci-cd-specialist` is Azure DevOps/Terraform/Lambda-scoped) — compensated with primary-source verification throughout.
## File tree
```
gear/
├── content/posts/.gitkeep
├── .github/workflows/deploy-site.yml
└── site/
    ├── package.json · package-lock.json · tsconfig.json · astro.config.mjs
    ├── src/content.config.ts
    ├── src/layouts/Layout.astro
    ├── src/pages/index.astro · src/pages/rss.xml.js · src/pages/posts/[slug].astro
    └── public/robots.txt
```
`package-lock.json` generated + committed by the first `npm install`. `tsconfig.json`: `{ "extends": "astro/tsconfigs/base" }` (ships inside `astro`, zero new deps).
## astro.config.mjs
```js
import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://future-gadgets-ai.github.io', base: '/gear' });
```
## site/package.json
```json
{
  "name": "site",
  "private": true,
  "type": "module",
  "scripts": { "dev": "astro dev", "build": "astro build", "preview": "astro preview" },
  "dependencies": { "astro": "^5.18.2", "@astrojs/rss": "^4.0.19" }
}
```
## src/content.config.ts
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const posts = defineCollection({
  loader: glob({ pattern: '*/article.md', base: '../content/posts' }),
  schema: z.object({ title: z.string(), slug: z.string(), date: z.coerce.date(), tl_dr: z.array(z.string()), tags: z.array(z.string()).default([]) }),
});
export const collections = { posts };
```
Empty/absent `content/posts`: the loader only warns, doesn't fail the build (verified — see log #3); `content/posts/.gitkeep` is committed as belt-and-suspenders. Schema is a deliberate subset of issue #3's fuller `content-spec.md` contract — `z.object()` strips unrecognized keys by default, so it stays forward-compatible.
## src/layouts/Layout.astro
```astro
---
interface Props { title: string }
const { title } = Astro.props;
---
<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>{title}</title></head>
<body><slot /></body>
</html>
```
## src/pages/index.astro — post list (title, date, first tl_dr bullet)
```astro
---
import { getCollection } from 'astro:content';
import Layout from '../layouts/Layout.astro';
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const posts = (await getCollection('posts')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<Layout title="gear">
<h1>gear</h1>
<ul>
{posts.map((post) => (
<li><a href={`${base}/posts/${post.data.slug}/`}>{post.data.title}</a><div>{post.data.date.toISOString().slice(0, 10)}</div>{post.data.tl_dr[0] && <p>{post.data.tl_dr[0]}</p>}</li>
))}
</ul>
</Layout>
```
## src/pages/posts/[slug].astro — H1, TL;DR block, then body
```astro
---
import { getCollection, render } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
export async function getStaticPaths() { return (await getCollection('posts')).map((post) => ({ params: { slug: post.data.slug }, props: { post } })); }
const { post } = Astro.props;
const { Content } = await render(post);
---
<Layout title={post.data.title}>
<h1>{post.data.title}</h1><h2>TL;DR</h2>
<ul>{post.data.tl_dr.map((point) => <li>{point}</li>)}</ul>
<Content />
</Layout>
```
Routes by frontmatter `slug`, not the loader's default `entry.id`. `<h2>TL;DR</h2>` is the literal grep anchor for AT-3.
## src/pages/rss.xml.js
```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
export async function GET(context) {
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const posts = (await getCollection('posts')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
return rss({
title: 'gear',
description: 'Future Gadgets — gear posts',
site: context.site,
items: posts.map((post) => ({
title: post.data.title, pubDate: post.data.date, description: post.data.tl_dr[0],
link: `${base}/posts/${post.data.slug}/`, categories: post.data.tags,
})),
});
}
```
`link` is a bare string — `@astrojs/rss` can't see `astro.config`'s `base`, so it needs the same manual `BASE_URL` join as the index page.
## site/public/robots.txt
```
User-agent: *
Allow: /
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
```
## .github/workflows/deploy-site.yml
```yaml
name: Deploy site
on:
  push: { branches: [main], paths: ["content/**", "site/**"] }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: "pages", cancel-in-progress: false }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v6
        with: { node-version: 24 }
      - working-directory: site
        run: npm ci && npx astro build
      - uses: actions/upload-pages-artifact@v5
        with: { path: site/dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```
Flow-style compaction validated by direct YAML parse (Ruby Psych) before drafting, including the quoted `${{ }}` expression, to rule out a `{{`-vs-flow-mapping collision. No `configure-pages`/`workflow_dispatch`: not in DEFINE's 5 steps; Pages state is verified separately via `gh api .../pages` (AT-5).
## Local smoke plan (AT-1 / AT-3 / AT-4)
```bash
cd site && npm install                          # first run — generates + commits package-lock.json
npx astro build                                  # AT-1a: empty collection must not break the build
mkdir -p ../content/posts/smoke-fixture          # AT-1b/AT-3 fixture — created & removed by this smoke only
cat > ../content/posts/smoke-fixture/article.md <<'EOF'
---
{ title: "Smoke Fixture", slug: "smoke-fixture", date: 2026-07-04, tl_dr: ["Throwaway smoke-test bullet."], tags: [] }
---
## Body
Smoke-test article body text for AT-3.
EOF
npx astro build
grep -q "TL;DR" dist/posts/smoke-fixture/index.html && echo "AT-3 TL;DR: PASS"
grep -q "Smoke-test article body text" dist/posts/smoke-fixture/index.html && echo "AT-3 body: PASS"
rm -rf ../content/posts/smoke-fixture            # cleanup — must not survive to PR
grep -A4 "^on:" ../.github/workflows/deploy-site.yml   # AT-4: static trigger check (path-push can't run locally; true confirm is post-merge)
```
## Decisions & verified-API facts log (live, 2026-07-04)
| # | Item | Detail (source) |
|---|---|---|
| 1 | Astro + rss versions | Pin `astro@^5.18.2` (latest 5.x). npm's overall `latest` is **7.0.6** (2026-07-02) — two majors past DEFINE's "~5.x"; flagged rather than silently bumped. Engines `node "18.20.8\|\|^20.3.0\|\|>=22.0.0"`. `@astrojs/rss@^4.0.19` (2026-06-30), no `astro` peer — version-agnostic. *(npm registry, live)* |
| 2 | `content.config.ts` location | Astro 5+ moved this to `src/content.config.ts`, not `src/content/config.ts` (legacy-only). *(docs.astro.build/guides/content-collections + upgrade-to/v5)* |
| 3 | `glob()` loader + `base` resolution + missing-dir tolerance | `glob({ pattern, base })` from `astro/loaders`; `base` resolves via `new URL(base, config.root)` — relative to the **project root** (`site/`), so `"../content/posts"` escapes to repo-root `content/posts/`. A missing base dir only `logger.warn`s, doesn't fail the build. Verified directly in `packages/astro/src/content/loaders/glob.ts` L245 + L255-260 on `withastro/astro` `main`, not memory. |
| 4 | `render()` API | Astro 5 exports a standalone `render(entry)` from `astro:content` (not Astro-4's `entry.render()` method) — used in `[slug].astro`. *(docs.astro.build/reference/modules/astro-content)* |
| 5 | `BASE_URL` gotcha | `base: '/gear'` (no trailing slash, official GH-Pages example) + default `trailingSlash: "ignore"` ⇒ `import.meta.env.BASE_URL` is literally `/gear`, no auto-slash. Naive `${BASE_URL}posts/...` renders `/gearposts/...`. Fixed with `.replace(/\/$/, '')` + explicit `/` in every href/RSS link. *(withastro/astro issues #6623, #3567; configuration-reference)* |
| 6 | Routing key | Route by frontmatter `data.slug`, not the loader's default `entry.id`/slugger — avoids depending on unverified default-id behavior on nested `<dir>/article.md` paths. |
| 7 | Workflow shape + action versions | `actions/checkout@v7`, `setup-node@v6` (`node-version: 24`, LTS "Krypton", satisfies Astro 5 engines), `upload-pages-artifact@v5`, `deploy-pages@v5` — verified via `api.github.com` releases+tags (live; web-search snippets disagreed with each other). Kept DEFINE's manual steps over Astro's own current default (`withastro/action@v6`), honoring the approved DEFINE over the upstream default. |
| 8 | Schema scope | `title, slug, date, tl_dr, tags` is intentionally a subset of issue #3's fuller `content-spec.md` (`status, audience, canonical_url, translation_of` not projected) — `z.object()` strips unrecognized keys by default. |
## File manifest
| File | Action | Purpose | Agent | Rationale |
|---|---|---|---|---|
| `content/posts/.gitkeep` | Create | Tolerate absent canonical content dir | (general-purpose) | Trivial placeholder |
| `site/package.json` | Create | Project manifest, minimal deps | (general-purpose) | No frontend/Astro specialist in this KB catalog |
| `site/package-lock.json` | Generate | Committed lockfile | (general-purpose) | Produced by `npm install`, not hand-authored |
| `site/tsconfig.json` | Create | Astro base TS config | (general-purpose) | Standard starter boilerplate |
| `site/astro.config.mjs` | Create | Site + base config | (general-purpose) | No frontend/Astro specialist in this KB catalog |
| `site/src/content.config.ts` | Create | Glob-loader collection + schema | (general-purpose) | Novel API surface, hand-verified above |
| `site/src/layouts/Layout.astro` | Create | Minimal HTML shell | (general-purpose) | Starter-minimal, zero design flourish |
| `site/src/pages/index.astro` | Create | Post list | (general-purpose) | — |
| `site/src/pages/posts/[slug].astro` | Create | Post page (H1 + TL;DR + body) | (general-purpose) | — |
| `site/src/pages/rss.xml.js` | Create | RSS feed endpoint | (general-purpose) | `@astrojs/rss` usage verified above |
| `site/public/robots.txt` | Create | Allow-all + 4 named AI crawlers | (general-purpose) | — |
| `.github/workflows/deploy-site.yml` | Create | Build + deploy on merge | (general-purpose) | No matching CI/CD specialist: `ci-cd-specialist` is Azure DevOps/Terraform/Lambda/Lakeflow-scoped, not GitHub Pages |
