# DESIGN — gear issue #14: Upgrade site to Astro 7.x

> Source: `DEFINE_ISSUE_14_ASTRO_7_UPGRADE.md`. Confidence **0.90**: no KB domain and no
> matching specialist agent for Astro/frontend in this catalog (the same gap
> `DESIGN_ISSUE_6_SITE_ASTRO.md` logged at 0.70) — compensated with (a) primary-source
> citations from `docs.astro.build`'s official v6/v7 upgrade guides and the `astro` /
> `@astrojs/rss` GitHub Changesets changelogs, (b) live npm-registry resolution of current
> versions/engines, and (c) an **actual executed proof-of-concept upgrade** — this repo's
> verbatim `site/` source, bumped to `astro@7.0.6` in an isolated scratch clone outside the
> working tree, run through every AT scenario below — not just documentation review.

## Context

`site/` is pinned to `astro@^5.18.2` / `@astrojs/rss@^4.0.19`. `npm audit` on that line
reports a high advisory resolvable only by jumping the current major (re-confirmed at
pickup — see DEFINE). This design bumps to the latest stable 7.x and migrates whatever
5→7 API surface this specific codebase actually touches — no theme/feature changes.

## Shape of the change

No topology change — same static site, same request flow, same file tree. Only the
version underneath moves, plus one deprecated import line:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  content/posts/*/article.md  (unchanged: 4 real posts + draft fixture)   │
│              │ glob({pattern:'*/article.md'}) — unchanged loader          │
│              ▼                                                           │
│  site/src/content.config.ts  (schema unchanged; z import source only)    │
│              │ getCollection('posts', status!=='draft') — unchanged x3   │
│      ┌───────┼────────────────┬──────────────────┐                       │
│      ▼       ▼                ▼                  ▼                      │
│  index.astro [slug].astro  rss.xml.js      public/robots.txt (static)    │
│      │       │ render()        │                  │                     │
│      └───────┴────────┬────────┘                  │                     │
│                        ▼                            ▼                    │
│              site/dist/ (astro build) ──── actions/upload-pages-artifact │
└──────────────────────────────────────────────────────────────────────────┘
   astro ^5.18.2 ──────────────────────────────►  astro ^7.0.6   (only diff)
   @astrojs/rss ^4.0.19 ───────────────────────►  @astrojs/rss ^4.0.19 (same)
```

## Resolved target version(s)

| Package | Current | Resolved target | Evidence |
|---|---|---|---|
| `astro` | `^5.18.2` | **`^7.0.6`** | `npm view astro dist-tags --json` → `"latest": "7.0.6"`, live lookup 2026-07-05. `npm view astro versions --json` confirms no `7.0.x` release newer than `7.0.6` exists yet — the version the issue was filed against **is still current latest-stable**, not just a floor that's since moved. |
| `@astrojs/rss` | `^4.0.19` | **`^4.0.19` (unchanged)** | `npm view @astrojs/rss dist-tags --json` → `"latest": "4.0.19"` — identical to what's already pinned. There is no `5.x`/`6.x`/`7.x` line for this package; it has stayed on `4.x` straight through Astro's 5→6→7 jumps (confirmed: no `astro` entry in its `peerDependencies` — `npm view @astrojs/rss peerDependencies` returns empty). **No dependency-line change needed for this package at all.** |

Caret convention preserved exactly as the existing line's style (`^7.0.6`, patch-floor with
caret range — same shape as the current `^5.18.2`).

### Node engine floor (raised twice between 5→7 — verified per-version, not just at latest)

| astro version | `engines.node` | Source |
|---|---|---|
| 5.18.2 (current) | `"18.20.8 \|\| ^20.3.0 \|\| >=22.0.0"` | `npm view astro@5.18.2 engines --json` |
| 6.0.0 | `"^20.19.1 \|\| >=22.12.0"` | `npm view astro@6.0.0 engines --json` — **not** a full Node-20 drop despite some secondary sources claiming so; Node 20.19.1+ still works on 6.0.0 |
| 7.0.0 / 7.0.6 (target) | `">=22.12.0"` | `npm view astro@7.0.0 / @7.0.6 engines --json` — Node 20.x fully dropped at v7 |

`.github/workflows/deploy-site.yml` pins `actions/setup-node@v6` with `node-version: 24` —
already `>=22.12.0`, so **no workflow change required** for the engine floor. Flagging for
whoever runs `npm install`/`astro dev` locally: local Node must also be `>=22.12.0` (no
`.nvmrc`/`.node-version` file exists in this repo to update — consistent with
`DESIGN_ISSUE_6`'s precedent of noting engine constraints here rather than encoding them
in `package.json`, which has no `engines` field today and isn't being given one by this
design either, to keep the diff to exactly what AT-1..AT-4 require).

## Migration surface — checked against this repo's actual code, not a generic checklist

Astro's own Changesets changelogs (`astro` core package,
[`packages/astro/CHANGELOG.md`](https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md))
list every major change verbatim, PR-linked. Cross-referenced against the curated guides at
[`docs.astro.build/en/guides/upgrade-to/v6/`](https://docs.astro.build/en/guides/upgrade-to/v6/)
and [`.../v7/`](https://docs.astro.build/en/guides/upgrade-to/v7/). Every item below was
checked against this repo's actual files (`site/astro.config.mjs`, `site/src/content.config.ts`,
`site/src/layouts/Layout.astro`, `site/src/pages/index.astro`, `site/src/pages/posts/[slug].astro`,
`site/src/pages/rss.xml.js`, `content/posts/*/article.md`) — not assumed.

### v6.0.0 major changes

| Change | Source | Applies here? |
|---|---|---|
| Adapter API changes (7 items: `entryPoints`/`routes`/`setManifestData` removed, `loadManifest`/`loadApp`/`NodeApp`/`createExports`/`start` deprecated, `entryType`→`entrypointResolution` renamed, `SSRManifest` shape changed, old `app.render()` signature removed) | [v6 CHANGELOG, "Adapter API" PRs](https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md#600) | **N/A wholesale** — `astro.config.mjs` has no `adapter:` key; this is a static GH-Pages site (`output: "static"`, confirmed by this design's own POC build log) |
| Image API changes (SVG rasterization, `getImage()` client-throw, responsive-image style emission) | [same CHANGELOG](https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md#600) | **N/A wholesale** — no `astro:assets` / `<Image />` import anywhere in `site/src/**` (grepped, zero hits) |
| Sessions API changes (`test` driver removed, driver string signature deprecated) | same | **N/A** — no session usage |
| i18n `redirectToDefaultLocale` default flip | same | **N/A** — no `i18n` key in `astro.config.mjs` |
| `astro:transitions` deprecations/removals, `<ViewTransitions />` removed, `<ClientRouter />` `handleForms` removed | same | **N/A** — no transitions/view-transitions usage |
| Actions API (`rewrite()` removed, internals unexposed) | same | **N/A** — no `astro:actions` usage |
| Vitest container-render removal | same | **N/A** — no test suite in `site/` |
| CommonJS config files removed | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#removed-support-for-commonjs-config-files) | **N/A** — `astro.config.mjs` already ESM (`import`/`export default`) |
| Percent-encoded route removal, endpoint trailing-slash behavior change | same | **N/A** — no such routes; irrelevant to a fully static prerendered output anyway |
| `Astro.glob()` removed | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#removed-astroglob) | **N/A** — never used (grepped, zero hits) |
| Deprecates `Astro` global inside `getStaticPaths()` | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#deprecated-astro-in-getstaticpaths) | **N/A** — `[slug].astro`'s `getStaticPaths()` never references `Astro.` |
| `getStaticPaths()` `params` can no longer be `number` | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#changed-getstaticpaths-cannot-return-params-of-type-number) | **N/A** — `params: { slug: post.data.slug }`, and `slug` is `z.string()` in the schema |
| Content-loader schema-as-function removed, types now inferred not `zod-to-ts`-generated | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#changed-schema-types-are-inferred-instead-of-generated-content-loader-api) | **N/A** — only affects authors of *custom* loaders providing their own `schema`; `content.config.ts` uses the built-in `glob()` loader with the schema supplied at `defineCollection()`, a different code path |
| **Legacy content collections removed entirely** (the thing that motivated most of this repo's original design decisions in `DESIGN_ISSUE_6`) | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#removed-legacy-content-collections) | **N/A** — `content.config.ts` already uses the Content Layer `glob()` loader (the modern API since v5), never the legacy `src/content/<collection>/*.md` convention |
| Markdown heading-ID generation: trailing hyphens on headings ending in special chars no longer stripped | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#changed-markdown-heading-id-generation) | **N/A** — checked every real post's `##` headings; none end in special characters, and nothing in this codebase links to a heading `#id` anchor |
| **Astro v6.0 upgrades to Zod v4** for schema validation | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#zod-4) | **Applies, non-breaking.** `content.config.ts`'s `canonical_url: z.string().url()` uses a Zod-v3-style chained string-format method. Zod v4 keeps `.url()`/`.email()`/etc. working but deprecated in favor of top-level `z.url()` ([zod.dev/v4 migration notes](https://zod.dev/v4)) — confirmed no runtime behavior change, no warning emitted in any of this design's POC build logs. **Decision: leave `.url()` as-is** (deprecated ≠ broken; changing it is an unrequested style diff) |
| **Deprecates `astro:schema` and `z` re-export from `astro:content`**, in favor of importing `z` from `astro/zod` | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#deprecated-astroschema-and-z-from-astrocontent) (uses `src/content.config.ts` as its own literal example) | **Applies directly — this file's exact import line.** `content.config.ts` currently does `import { defineCollection, z } from 'astro:content'`. Still works (deprecated, not removed — confirmed in POC), but this is the one concrete, official, directly-targeted recommendation for the file this task named in scope. **Recommended fix below** (not required for any AT to pass) |
| TypeScript configuration changes | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#changed-typescript-configuration) | **N/A for this project's own file** — `tsconfig.json` only does `{ "extends": "astro/tsconfigs/base" }` with zero overrides; diffed the installed `node_modules/astro/tsconfigs/base.json` under 7.0.6 directly — sane modern preset (`target: ESNext`, `moduleResolution: Bundler`, etc.), inherited automatically, nothing to hand-edit |
| Vite 6→7 bump | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#vite-70) | **N/A** — no `vite:` key in `astro.config.mjs`, no Vite plugins |
| Node.js minimum raised | [v6 guide](https://docs.astro.build/en/guides/upgrade-to/v6/#node-22) | See engine-floor table above — CI already satisfies it |
| Shiki syntax highlighter bumped to v4 | [v6 CHANGELOG](https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md#600) | **N/A today** — grepped every real post's `article.md` for fenced code blocks: zero. Purely informational if a future post adds one |

### v7.0.0 major changes

| Change | Source | Applies here? |
|---|---|---|
| Vite 7→8 bump | [v7 CHANGELOG](https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md#700) | **N/A** — same as above, no direct Vite config; POC confirms `vite@8.1.3` resolves and builds clean |
| AI-agent background dev-server management (new, not breaking) | [v7 CHANGELOG](https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md#700) | **N/A** — `astro dev` only, doesn't touch `astro build`/deploy |
| `@astrojs/db` package removed | same | **N/A** — never a dependency here |
| **Replaces Go compiler with a new Rust-based compiler** — stricter about invalid HTML, unclosed tags now error | [v7 CHANGELOG](https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md#700); [v7 guide](https://docs.astro.build/en/guides/upgrade-to/v7/) | **Checked — passes.** All 4 `.astro` files hand-inspected for unclosed tags (none) and, more importantly, **actually compiled with zero errors** in this design's POC build against `astro@7.0.6` |
| **New default Markdown processor: Sätteri**, replacing the remark/rehype pipeline (`@astrojs/markdown-remark` no longer installed by default) | [v7 guide, "New default Markdown processor: Sätteri"](https://docs.astro.build/en/guides/upgrade-to/v7/#new-default-markdown-processor-s%C3%A4tteri) | **Checked — no impact.** Guide states plainly: *"If you don't use remark or rehype plugins, you don't need to do anything... rendered by Sätteri, which applies GitHub-Flavored Markdown and SmartyPants just like before."* `astro.config.mjs` has no `markdown:` key at all. POC rendered a real post containing a blockquote + bold text + nested headings — output was structurally correct `<blockquote><p>…</p></blockquote>`, smart quotes applied, all 4 real posts' bodies rendered byte-for-byte sane (inspected directly, not just grepped) |
| Advanced routing enabled by default, reserves `src/fetch.ts`/`src/fetch.js` | [v7 guide](https://docs.astro.build/en/guides/upgrade-to/v7/) | **N/A** — no such file in `site/src/` |
| **`compressHTML` default changes from `true` to `'jsx'`** — may drop whitespace between adjacent inline elements | [v7 guide, "New default whitespace handling"](https://docs.astro.build/en/guides/upgrade-to/v7/#new-default-whitespace-handling-compresshtml-jsx) | **Checked — no impact.** `index.astro`'s `<li>` template already has zero inter-element whitespace to lose (`</a><div>...`, hand-authored compact). POC's rendered output for both the empty-state and content-present builds shows no missing spaces anywhere (visually diffed against source) |
| `astro:transitions` deprecated exports removed (concrete APIs) | [v7 CHANGELOG](https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md#700) | **N/A** — not used |

### `render()` / Content Layer / `@astrojs/rss` — the three surfaces DEFINE explicitly flagged

| Surface | Finding |
|---|---|
| Content-layer config (`content.config.ts`'s `defineCollection` + `glob()` loader) | Already the modern (v5+) API. No shape change 5→7. Confirmed: POC build resolves the collection, applies the schema, and the `status:draft` filter still holds (see Verification below) |
| `render()` from `astro:content` | Already the standalone-function form (`const { Content } = await render(post)`), not the removed `entry.render()` method. No change. Confirmed working in POC — post body renders with correct `<h1>` + markdown body |
| `@astrojs/rss` call signature (`rss({ title, description, site, items })`) | Unchanged since Astro 3.0-era (`site` required, `Response`-returning default export — both already how this file calls it). [`@astrojs/rss` CHANGELOG](https://github.com/withastro/astro/blob/main/packages/astro-rss/CHANGELOG.md) shows only patch-level bumps (XML-escaping hardening in 4.0.19, `fast-xml-parser` bumps) since this project's current pin — **no version bump and no code change needed** |

## Concrete file changes

Of every file in `site/` + the deploy workflow, exactly **one required change** and **one recommended (non-blocking) change** were found. Everything else is verified compatible as-is.

### 1. `site/package.json` — required

```json
{
  "name": "site",
  "private": true,
  "type": "module",
  "scripts": { "dev": "astro dev", "build": "astro build", "preview": "astro preview" },
  "dependencies": { "astro": "^7.0.6", "@astrojs/rss": "^4.0.19" }
}
```
Only the `astro` line changes (`^5.18.2` → `^7.0.6`). `@astrojs/rss` line is byte-identical to today.

### 2. `site/package-lock.json` — required, but generated not hand-edited

The existing lockfile is fully resolved against the 5.x tree; `npm ci` will fail against a
bumped `package.json` until it's regenerated. Delete and regenerate via `npm install` (see
migration steps). POC's regenerated lockfile: `lockfileVersion: 3`, 300 resolved packages,
`astro@7.0.6` / `@astrojs/rss@4.0.19` at the top level — and notably **no `esbuild` package
anywhere in the resolved tree**, which incidentally also clears the low-severity `esbuild`
advisory the DEFINE's problem statement mentioned as a secondary (non-blocking) finding.

### 3. `site/src/content.config.ts` — recommended, not required

Current (still works, deprecated import path per the v6 finding above):
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
```
Recommended:
```ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
```
Everything else in the file (the `glob()` call, the full `z.object({...})` schema, the
`collections` export) is unchanged. This is the only line this task's named-in-scope
"content-layer / content-collections config" migration surface actually produces — flagging
it as *recommended* rather than blocking because AT-1..AT-4 pass identically either way (POC
built successfully on the pre-change import); doing it now avoids relitigating a documented,
official deprecation later.

### 4. Everything else — verified compatible, zero changes

| File | Verdict |
|---|---|
| `site/astro.config.mjs` | No change. `defineConfig({ site, base })` shape unchanged; POC confirms correct `BASE_URL` behavior with this exact file, byte-for-byte |
| `site/tsconfig.json` | No change. `astro/tsconfigs/base` preset still exists under 7.0.6, diffed directly |
| `site/src/layouts/Layout.astro` | No change. Compiles clean under the new Rust compiler |
| `site/src/pages/index.astro` | No change. `getCollection('posts', ({data}) => data.status !== 'draft')` + `BASE_URL.replace(/\/$/, '')` guard both verified working |
| `site/src/pages/posts/[slug].astro` | No change. `getStaticPaths()` + standalone `render()` verified working, routes by `data.slug` as before |
| `site/src/pages/rss.xml.js` | No change. `@astrojs/rss` signature verified working, correct absolute + base-prefixed links |
| `site/public/robots.txt` | No change. Static asset, copied verbatim regardless of Astro version — confirmed present with all 5 `Allow: /` rules in `dist/` |
| `.github/workflows/deploy-site.yml` | No change. Node 24 ≥ Astro 7's `>=22.12.0` floor; `npm ci && npx astro build` verified end-to-end against the regenerated lockfile; `site/dist` remains the build output path (`[build] directory: .../site/dist/` in POC log); `actions/checkout@v7`, `actions/setup-node@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5` confirmed still the current major-version tags on their respective repos (`api.github.com/repos/<owner>/<repo>/tags`, live check) |

## Proof-of-concept validation (executed, not just read)

Before writing this doc, the exact repo source (`site/` + `content/posts/`) was copied into
an isolated scratch directory **outside this working tree**, `package.json` bumped to
`astro@^7.0.6`, and run through every AT scenario for real:

| Check | Result |
|---|---|
| `npm install` (fresh, deleted lockfile) | 206 packages, **0 vulnerabilities** at install time |
| `npx astro build` — empty-state (only `_fixture-hello-gear/spec.md`, no `article.md`) | Exit 0. `[WARN] [glob-loader] No files found matching "*/article.md"` (warn, not fatal — same non-fatal behavior `DESIGN_ISSUE_6` documented for Astro 5). `dist/` → `index.html`, `robots.txt`, `rss.xml`. Empty `<ul></ul>`, valid empty `<rss>` |
| `npm audit` (empty-state tree) | `{"info":0,"low":0,"moderate":0,"high":0,"critical":0}` |
| `npx astro build` — content-present (4 real posts restored) | Exit 0, 5 pages + `rss.xml` built |
| `grep -r "gearposts" dist/` | Zero hits (no BASE_URL regression) |
| `grep -o 'href="[^"]*"' dist/index.html` | All 4 links correctly `/gear/posts/<slug>/` |
| `dist/rss.xml` `<link>` values | Correct absolute `https://future-gadgets-ai.github.io/gear/posts/<slug>/` |
| Post page render (`render()` + Sätteri markdown) | `<h1>` title correct; body paragraphs, `##` headings (with clean `id=` slugs), lists, and a blockquote all render structurally correct, smart-quotes applied |
| Draft-gate smoke — temp post derived from `_fixture-hello-gear/spec.md`, `status: draft` | Not built (`dist/posts/` unchanged), absent from `index.html` and `rss.xml` — filter in `index.astro` / `[slug].astro` / `rss.xml.js` still holds |
| `npm ci && npx astro build` (the literal CI command, against the regenerated lockfile) | Exit 0, identical output — confirms the deploy workflow works unmodified |
| Final `npm audit` | 0 vulnerabilities, 0 total |

**One honest discrepancy to flag, not to override:** DEFINE documents a house fact that
`site/node_modules/.astro/data-store.json` "survives rebuilds and does not self-heal when a
content file is deleted." This design treats that as ground truth per its own instructions
and keeps the `rm -f .../data-store.json` step in the verification plan below unconditionally.
However, in this POC (Astro **7.0.6**), the deletion case was retested twice independently
(a freshly-created temp-post directory, and an in-place `article.md` derived and then removed
from inside `_fixture-hello-gear/` itself — matching the DEFINE's own described repro pattern)
and **neither attempt reproduced a stale-entry leak** across a sequential `astro build` →
delete → `astro build` cycle; the deleted entry was absent from both the rebuilt `dist/` and
the cache file itself afterward. This may mean the underlying content-layer incremental-sync
robustness improved somewhere across 5→6→7, or that the original repro needs a condition (e.g.
`astro dev` watch mode, or a different sequencing) not exercised here. The defensive `rm -f`
step is kept regardless — it is zero-cost insurance — but the build/verification phase should
not be surprised if the "gotcha" doesn't reproduce; that would be consistent with this finding,
not a sign something else is wrong.

## Ordered migration steps

1. In `site/package.json`, change `"astro": "^5.18.2"` → `"astro": "^7.0.6"` (leave
   `@astrojs/rss` untouched).
2. (Recommended) In `site/src/content.config.ts`, split the `astro:content` import as shown
   above (drop `z` from it, add `import { z } from 'astro/zod'`).
3. `rm -f site/package-lock.json` — the old lockfile is resolved against the 5.x tree and
   `npm ci` will reject it against the bumped manifest.
4. `cd site && npm install` — regenerates the lockfile against the Astro 7 tree.
5. `rm -f site/node_modules/.astro/data-store.json` if any prior local build's cache exists
   (defensive, before the first post-bump build — see the cache-gotcha note above).
6. Empty-state build: with `content/posts/` containing only `_fixture-hello-gear/` (no
   derived `article.md`), run `npx astro build`; confirm exit 0 and `dist/{index.html,
   robots.txt,rss.xml}` (AT-2, empty-state half).
7. `npm audit` in `site/`; confirm `0 high/critical` (AT-1).
8. Content-present build: with the 4 real posts present, run `npx astro build`; confirm
   exit 0 and 4 post pages + `index.html` + `rss.xml` (AT-2, content-present half).
9. Regression greps against `dist/`: zero hits for `gearposts`; `/gear/posts/<slug>/` present
   in both `dist/index.html` and `dist/rss.xml` (AT-3, BASE_URL half).
10. Draft-gate smoke: derive a temp `article.md` from `_fixture-hello-gear/spec.md` (keep
    `status: draft`), rebuild, confirm it produces no page and appears in neither
    `index.html` nor `rss.xml`; delete the temp file; `rm -f
    site/node_modules/.astro/data-store.json`; rebuild clean; confirm the tree is
    fixture-free (AT-3, draft-gate half).
11. Confirm `dist/robots.txt` present with the wildcard rule + all 4 named AI-crawler
    `Allow: /` rules intact (AT-4, robots half).
12. Confirm `.github/workflows/deploy-site.yml` needs no edits: re-run
    `npm ci && npx astro build` from a clean `node_modules` and diff against the same
    expectations as steps 6–11; verify `site/dist` is still what
    `actions/upload-pages-artifact@v5` expects (`path: site/dist`) (AT-4, workflow half).
13. `git status --short` — only `site/package.json` and `site/package-lock.json` (plus
    `site/src/content.config.ts` if step 2 is taken) should show as modified; no leftover
    temp/fixture artifacts.

## Verification / test plan — mapped to AT-1..AT-4

| AT | What it checks | How this design verifies it |
|---|---|---|
| **AT-1** | `npm audit` on upgraded tree: 0 high/critical | Step 7 above. POC already confirmed this exact outcome (`0/0/0/0/0`) against the identical dependency bump |
| **AT-2** | Both build modes green (empty-state + content-present) | Steps 6 and 8. Both independently exit-0 in the POC, using this repo's real `astro.config.mjs`/`content.config.ts`/pages verbatim |
| **AT-3** | No `/gearposts` regression; `status:draft` gate holds in code | Steps 9 (BASE_URL grep) and 10 (temp-post smoke). The gate is enforced by the `({ data }) => data.status !== 'draft'` predicate duplicated at **three call sites** — `site/src/pages/index.astro`, `site/src/pages/posts/[slug].astro`'s `getStaticPaths()`, and `site/src/pages/rss.xml.js` — not inside `content.config.ts`'s schema (the schema only validates that `status` is one of the enum values; it doesn't filter). All three re-verified unchanged and functioning in the POC |
| **AT-4** | RSS + `robots.txt` intact; deploy workflow still valid for Astro 7 | Step 11 (robots.txt) plus the RSS checks already covered under AT-2/AT-3's builds; step 12 for the workflow (Node floor, build command, output path, action versions — all re-confirmed against live sources, no workflow file edit required) |

## Decisions & verified-API facts log

| # | Item | Detail (source) |
|---|---|---|
| 1 | Target versions | `astro@^7.0.6` (npm `latest` dist-tag, live, unchanged from the issue's filing-time version — no newer 7.x has shipped). `@astrojs/rss@^4.0.19` **unchanged** — already latest, no `astro` peer dependency, version-agnostic. |
| 2 | Node engine floor | Raised in two steps: 5.x allows Node 18.20.8/20.3+/22+; 6.x drops 18 but keeps 20.19.1+; **7.x requires `>=22.12.0`, full Node-20 drop**. CI's `node-version: 24` already clears this; no workflow change. |
| 3 | Zod v4 (bundled by Astro 6+) | `z.string().url()` remains valid but deprecated in favor of top-level `z.url()`. Left unchanged — deprecated, not broken, and changing it isn't part of this task's scope. |
| 4 | `z` re-export from `astro:content` | Deprecated in v6 in favor of `astro/zod`; official guide uses `src/content.config.ts` as its own example. Recommended (not required) fix applied to this exact file. |
| 5 | Legacy content collections removal (v6) | Doesn't affect this repo — already on the Content Layer `glob()` loader since the original `DESIGN_ISSUE_6` build, never the legacy `src/content/<collection>` convention. |
| 6 | Rust-based compiler (v7) | Stricter HTML validation (unclosed tags now error). All 4 `.astro` files hand-verified closed-tag-clean and **actually compiled with zero errors** in the POC. |
| 7 | Sätteri Markdown processor (v7, replaces remark/rehype default) | No config migration needed — project has zero `markdown:` config. Verified by rendering real post content (blockquote, bold, nested headings) and inspecting the output HTML directly, not just grepping for one string. |
| 8 | `compressHTML` default `true`→`'jsx'` (v7) | Checked for whitespace regressions in the hand-authored `.astro` templates (none — templates already have zero inter-tag whitespace to lose) and in rendered post bodies (none observed). |
| 9 | Content-layer cache gotcha (DEFINE house fact) | Retained as a mandatory defensive step per DEFINE's instruction; empirically retested twice under Astro 7.0.6 and did not reproduce a stale-entry leak in either attempt — reported transparently, not used to drop the step. |
| 10 | GitHub Actions versions | `actions/checkout@v7`, `actions/setup-node@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5` — all re-confirmed as the current highest major tag on their respective repos via the GitHub API, live. No change. |
| 11 | esbuild (secondary low-severity advisory in DEFINE's problem statement) | Resolved as a side effect — `esbuild` no longer appears anywhere in the Astro-7 resolved dependency tree. |

## File manifest

| File | Action | Purpose | Agent | Rationale |
|---|---|---|---|---|
| `site/package.json` | Modify | Bump `astro` to `^7.0.6` | (general-purpose) | No frontend/Astro specialist in this KB catalog (same gap as `DESIGN_ISSUE_6`) |
| `site/package-lock.json` | Regenerate | Re-resolve full tree against Astro 7 | (general-purpose) | Produced by `npm install`, not hand-authored |
| `site/src/content.config.ts` | Modify (recommended) | Stop importing `z` from the deprecated `astro:content` re-export | (general-purpose) | Directly-named official deprecation fix, verified above |
| `site/astro.config.mjs` | No change | Verified compatible | (n/a — no change) | No frontend/Astro specialist in this KB catalog; nothing to hand off |
| `site/tsconfig.json` | No change | Verified compatible | (n/a — no change) | Same |
| `site/src/layouts/Layout.astro` | No change | Verified compatible (Rust compiler clean) | (n/a — no change) | Same |
| `site/src/pages/index.astro` | No change | Verified compatible (draft gate + BASE_URL) | (n/a — no change) | Same |
| `site/src/pages/posts/[slug].astro` | No change | Verified compatible (`render()`, routing) | (n/a — no change) | Same |
| `site/src/pages/rss.xml.js` | No change | Verified compatible (`@astrojs/rss` signature) | (n/a — no change) | Same |
| `site/public/robots.txt` | No change | Static asset, version-independent | (n/a — no change) | Same |
| `.github/workflows/deploy-site.yml` | No change | Node floor, build command, output path, action versions all re-verified | (n/a — no change) | Same |

## Assumptions logged beyond DEFINE (not already present there)

1. **`@astrojs/rss` requires no version bump.** DEFINE's scope bullet implied a possible
   "RSS feed generation signature" migration; live registry + changelog data show the
   package hasn't moved off `4.x` at all across Astro 5→6→7 and this repo is already on its
   current latest patch. Logged as a finding, not escalated (no ambiguity to resolve).
2. **Declined to modernize `z.string().url()` → `z.url()`.** Zod v4 (bundled since Astro 6)
   keeps the chained form working; treated as out-of-scope style cleanup rather than a
   required migration, to keep the diff to what AT-1..AT-4 need.
3. **Declined to add an `engines` field to `site/package.json`.** The Node floor tightened
   to `>=22.12.0`, but `DESIGN_ISSUE_6` already established the precedent of noting engine
   constraints in the design doc rather than encoding them in `package.json`; kept consistent
   rather than introducing new packaging convention as a side effect of this migration.
4. **The documented content-layer cache gotcha didn't reproduce in this design's POC** (two
   independent attempts, Astro 7.0.6). Treated as a transparency note, not a reason to drop
   DEFINE's mandated defensive step — see the Proof-of-concept section above.
5. **No "DEFINE status → Designed" marker written back.** The input DEFINE doc lives under
   `.claude/sdd/_synthesized/`, which the repo's own root `.gitignore` marks explicitly as
   "throwaway synthesized design-input (never commit)" — it's a single-use, uncommitted
   stand-in, not a tracked artifact with a status field to update. Left untouched rather than
   inventing a status convention this repo doesn't have.
