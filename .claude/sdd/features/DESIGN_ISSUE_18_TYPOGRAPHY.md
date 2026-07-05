# DESIGN — gear issue #18: Minimal typographic styling for the site (v0 design pass)

## Metadata

- **Issue:** `Future-Gadgets-AI/gear#18` — "[TASK] Minimal typographic styling for the site (v0 design pass)" — DoR verdict **READY** (audited 2026-07-05), one logged assumption (aesthetic values are the delegate's call, veto at review). **This issue is the sole requirements source for this design** — the `implement` skill's synthesized working file is gitignored/ephemeral and is never cited here, per this repo's established precedent (`DESIGN_ISSUE_16_TLDR_DEDUPE.md`, Resolved decision #1).
- **Branch:** `feat/site-typography` (already checked out; working tree clean at design time).
- **Confidence:** 0.90 — no KB domain applies (css/frontend/typography is not among the 24 domains in the agentspec KB catalog, `/Users/lucas/.claude/plugins/cache/agentspec/agentspec/3.2.0/kb/`, checked live this session) and no specialist agent exists (same catalog's `agents/` tree is exclusively data-engineering/cloud/platform/python/workflow-meta; this repo's own `.claude/agents/` directory does not exist at all — confirmed live, same finding as every prior DESIGN in this repo). Raised above the confidence-matrix floor (0.70 for zero-KB/zero-agent) because every load-bearing technical claim in this design was verified against a primary source this session, not assumed from training data — most consequentially, Astro's scoped-`<style>`-vs-slotted-content limitation (Grounding #8), which would have silently broken nearly every selector in this stylesheet had an inline, non-`is:global` `<style>` block been chosen instead. Kept marginally below `DESIGN_ISSUE_16`'s 0.92 precedent because that issue's fix was one fully-dictated before/after edit, whereas this issue explicitly delegates real aesthetic authorship (palette, scale, spacing) to this design.
- **Scope guard:** the committed diff touches only `site/src/layouts/Layout.astro` (one-line edit) and one new file, `site/src/styles/global.css`, plus this DESIGN and a future `BUILD_REPORT_ISSUE_18_TYPOGRAPHY.md`. Out of scope, per the issue: web fonts, CDNs, JS, any change to rendered markup/component structure, any redesign beyond typography.

## Problem (per `Future-Gadgets-AI/gear#18`)

The live site ships completely unstyled HTML — browser-default serif on white, no measure, no spacing — while the first post's credibility (and its click-throughs) lands on this page. This design adds a minimal, quiet, framework-free typographic pass: system fonts, a centered measure, a heading scale, spaced lists, readable links, styled blockquotes/tables/code, and a no-JS dark mode.

## Grounding (read live this session, not from training memory)

| # | Source | Key fact grounding this design |
|---|--------|--------------------------------|
| 1 | `site/src/layouts/Layout.astro` (live) | Bare shell: `<body><slot /></body>`, zero wrapper element, zero existing styles. Confirms the centered column must be achieved by styling `body` itself. |
| 2 | `site/src/pages/index.astro`, `site/src/pages/posts/[slug].astro` (live) | Both place their markup (`<h1>`, `<ul>`, `<Content />`) directly inside `<Layout>...</Layout>` — i.e. as direct children of `body` once slotted. No selector in this design needs a fragile ancestor assumption beyond that. |
| 3 | `content/posts/_fixture-hello-gear/spec.md` (live) | Real shapes to style: `##` headings, unordered lists, a `> **pull-quote:** ...` blockquote, a 3-column `| claim | source URL | date accessed |` table. |
| 4 | `site/astro.config.mjs`, `site/package.json` (live) | `base: '/gear'`; `astro@^5.18.2` (matches installed `site/node_modules/astro` — confirmed by `package.json`'s `"version": "5.18.2"`). |
| 5 | `site/node_modules/astro/dist/types/public/config.d.ts` + `dist/core/config/schemas/base.js` (live, installed source) | `build.inlineStylesheets` default is `"auto"` (not overridden in this repo's `astro.config.mjs`): "only stylesheets smaller than `ViteConfig.build.assetsInlineLimit` (default 4kb) are inlined [as `<style>`]. Otherwise ... external stylesheets." |
| 6 | `site/node_modules/astro/dist/core/build/plugins/util.js` (live, installed source) | Exact mechanism: `shouldInlineAsset` returns `Buffer.byteLength(assetContent) < Number(assetsInlineLimit)` — a hard byte-count check, not a heuristic. |
| 7 | `docs.astro.build/guides/imports` / `docs.astro.build/guides/styling` (web, live) | Official pattern: `import '../styles/global.css'` at the top of a component's frontmatter; "a common pattern in Astro is to import global CSS inside a Layout component." Imported CSS is **not** subject to Astro's component-scoping — it "can leak," applying globally, unlike `<style>` blocks. |
| 8 | Astro docs + community sources (web, live) | Astro's default *scoped* `<style>` tag adds a `data-astro-cid-*` attribute only to elements the compiler can see inside that same component's own template. **Slotted content from a different component (e.g. everything `index.astro`/`[slug].astro` pass into `<Layout>`) does not receive that attribute**, so scoped rules would silently fail to apply to it. `:global()` or `is:global` are the documented escape hatches. **This is the deciding fact for choosing an imported stylesheet over an inline `<style>` block below.** |
| 9 | Web sources (multiple, live) confirming a standard CSS-only responsive-table pattern | `table { display: block; overflow-x: auto; }`, with no wrapper `<div>`, is an established technique — the outer table box scrolls independently while `tr`/`td` keep their table layout, because only the table element's own `display` changes. |
| 10 | `.claude/sdd/features/DESIGN_ISSUE_16_TLDR_DEDUPE.md` (committed, house-style/precedent only) | `base: '/gear'` does not prefix `dist/` output paths (`dist/posts/<slug>/index.html`, `dist/index.html`, no `dist/gear/...`). Smoke-script convention: bash + `grep`, temp fixture created and removed by the smoke only. |
| 11 | `.claude/sdd/reports/BUILD_REPORT_ISSUE_16_TLDR_DEDUPE.md` (committed) | Astro's content-layer cache (`site/node_modules/.astro/data-store.json`) survives content deletion and does **not** self-heal on a plain rebuild — confirmed empirically in that build. Any smoke that creates/deletes a temp `article.md` must `rm -f` that cache file before a "clean" regression rebuild. |
| 12 | `git status`/`git log` (live, this session) | Working tree clean on `feat/site-typography`; `site/node_modules` is already present in this clone (confirmed via `ls`), so no `npm install` is required for the smoke below — mirrors `BUILD_REPORT_ISSUE_16`'s own finding. |

## The decisive design choice: imported stylesheet, not an inline `<style>` block

The issue pre-approves either "a single inline `<style>` block in `Layout.astro`, or one new `site/src/styles/global.css` file it imports." Grounding #8 makes this a real choice, not a coin flip: `Layout.astro`'s own template contributes only `<html>`, `<head>`, `<body>` — every single element this design needs to style (`h1`–`h3`, `ul`/`ol`/`li`, `a`, `blockquote`, `table`/`th`/`td`, `pre`/`code`) arrives as **slotted content from a different component**. An Astro-scoped `<style>` block in `Layout.astro` would compile its selectors to `selector[data-astro-cid-xxxx]` and that attribute is never applied to slotted children — so every rule except ones matching `html`/`head`/`body` directly would silently no-op. The fix would be `<style is:global>`, but that depends on every future editor remembering one keyword.

**Decision:** new file `site/src/styles/global.css`, imported as a side-effect import in `Layout.astro`'s frontmatter (`import '../styles/global.css';` — the exact form Astro's own docs recommend for site-wide styles). A plain CSS-file import is never run through Astro's scoping compiler at all (Grounding #7), so this risk cannot recur, with no reliance on a magic keyword.

## The stylesheet

### `site/src/layouts/Layout.astro` — before / after (one line added, no markup change)

**Before** (current, live, 9 lines):

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

**After** (target, 10 lines — one import line added, zero markup change):

```astro
---
import '../styles/global.css';
interface Props { title: string }
const { title } = Astro.props;
---
<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>{title}</title></head>
<body><slot /></body>
</html>
```

`<body><slot /></body>` is untouched character-for-character — this is what satisfies AT-1's "element tree identical" requirement. Styling reaches the centered column purely via the `body` selector below.

### `site/src/styles/global.css` (new file, complete, copy-paste ready)

```css
/* gear -- v0 minimal typographic pass (Future-Gadgets-AI/gear#18) */

:root {
  color-scheme: light dark;
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-link: #0552b5;
  --color-link-visited: #6b3fa0;
  --color-border: #d8d8d8;
  --color-code-bg: #f2f2f2;
  --color-blockquote-border: #b0b0b0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #121212;
    --color-text: #e0e0e0;
    --color-link: #7db8ff;
    --color-link-visited: #c79bf0;
    --color-border: #3a3a3a;
    --color-code-bg: #1e1e1e;
    --color-blockquote-border: #5a5a5a;
  }
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  max-width: 68ch;
  margin: 0 auto;
  padding: 2rem 1.25rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
}

body > h1 {
  margin-top: 0;
}

code, pre {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
}

h1, h2, h3 {
  line-height: 1.25;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.2rem; }

p, ul, ol, table, pre {
  margin-top: 0;
  margin-bottom: 1.25rem;
}

ul, ol {
  padding-left: 1.5rem;
}

li + li {
  margin-top: 0.35rem;
}

a {
  color: var(--color-link);
  text-decoration: underline;
}

a:visited {
  color: var(--color-link-visited);
}

a:hover {
  text-decoration: none;
}

blockquote {
  margin: 0 0 1.25rem 0;
  padding: 0.5rem 1rem;
  border-left: 3px solid var(--color-blockquote-border);
  font-style: italic;
}

table {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
}

th, td {
  border: 1px solid var(--color-border);
  padding: 0.5rem 0.75rem;
  text-align: left;
  overflow-wrap: break-word;
}

pre {
  background: var(--color-code-bg);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  max-width: 100%;
}

code {
  background: var(--color-code-bg);
  padding: 0.15em 0.4em;
  border-radius: 3px;
}

pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}
```

Size: 2,140 raw bytes / ~1.65KB under a naive minify pass (comments + whitespace stripped) — comfortably under Vite's 4,096-byte `assetsInlineLimit` (Grounding #5/#6), so under Astro's default `inlineStylesheets: "auto"` this is expected to be **inlined** as a literal `<style>` tag in built pages' `<head>`, not emitted as a separate linked file. The smoke procedure below checks for either outcome rather than assuming this.

**Deliberately excluded:** `img` styling — not named in the issue's scope, and no content (fixture or otherwise) in this repo renders an `<img>` today; adding it would be unrequested scope growth.

## Dark-mode contrast — WCAG AA computation (not asserted, derived)

Formula (WCAG 2.x relative luminance): for each sRGB channel `c` (0–1, `c = channel/255`):
`c_lin = c/12.92` if `c ≤ 0.03928`, else `c_lin = ((c+0.055)/1.055)^2.4`; `L = 0.2126·R_lin + 0.7152·G_lin + 0.0722·B_lin`. Contrast ratio `= (L_lighter + 0.05) / (L_darker + 0.05)`.

Mandated pair — dark-mode body text `#e0e0e0` vs. background `#121212` (both are gray, so R=G=B and `L` reduces to the single linearized channel value, since the three weights sum to exactly 1.0):

| Color | 8-bit | sRGB (`c`) | `c > 0.03928`? | Linearized (`c_lin`) | `L` |
|-------|------:|-----------:|:---:|---:|---:|
| `#121212` (bg) | 18 | 0.070588 | yes | `((0.070588+0.055)/1.055)^2.4 = 0.119041^2.4` | **0.006035** |
| `#e0e0e0` (text) | 224 | 0.878431 | yes | `((0.878431+0.055)/1.055)^2.4 = 0.884769^2.4` | **0.745404** |

Contrast ratio = `(0.745404 + 0.05) / (0.006035 + 0.05)` = `0.795404 / 0.056035` = **14.19 : 1**.

`14.19 ≥ 4.5` → **clears WCAG AA for normal text** (it also clears AAA's 7:1 bar). Same formula applied to the other dark-mode pairs for completeness: link `#7db8ff` on `#121212` = 9.07:1 (AA pass); visited `#c79bf0` on `#121212` = 8.36:1 (AA pass). Light-mode default (`#1a1a1a` on `#ffffff`) = 17.40:1 — not mandated by the issue but confirmed in passing.

## Responsive: zero horizontal scroll at 360px

| Risk | Mitigation (in `global.css`) |
|------|-------------------------------|
| Any padded element pushing wider than the viewport | `*, *::before, *::after { box-sizing: border-box; }` — padding is subtracted from, not added to, each box's width |
| `body`'s own `max-width: 68ch` | Never binds at 360px — 68ch renders well above 360px in any of the stacked fonts, so the viewport (not the measure) is the controlling width at phone sizes |
| Wide `table` (the Claims & Sources columns) | `table { display: block; overflow-x: auto; max-width: 100%; }` — table scrolls internally, page does not (Grounding #9); `th, td { overflow-wrap: break-word; }` as a second line of defense against a single long unbroken URL |
| Long unwrapped `pre`/code line | `pre { overflow-x: auto; max-width: 100%; }` — scrolls internally rather than forcing the page wider, preserving code indentation (the standard treatment, vs. force-wrapping which would corrupt formatting) |

## Smoke procedure (bash, runnable; mirrors `DESIGN_ISSUE_16`'s style)

Run from the repo root, after the edits above are applied.

```bash
# Tooling precondition — this clone already has site/node_modules (confirmed
# via `ls`); a genuinely fresh checkout would not.
(cd site && { [ -d node_modules ] || npm ci || npm install; })

# ── AT-1/AT-2 setup: a temporary NON-DRAFT post derived from the fixture ──
# Direct sed copy (not the render-article skill) -- a style-only smoke does
# not need the renderer's own transforms, matching DESIGN_ISSUE_16's choice.
mkdir -p content/posts/_smoke-typography
sed -e 's/^status: draft$/status: approved/' \
    -e 's/^slug: _fixture-hello-gear$/slug: _smoke-typography/' \
    content/posts/_fixture-hello-gear/spec.md > content/posts/_smoke-typography/article.md

(cd site && npx astro build)

# ── stylesheet-presence assertion, tolerant of either bundling shape ──────
# Astro's build.inlineStylesheets defaults to "auto": stylesheets under
# Vite's 4096-byte assetsInlineLimit are inlined as a literal <style> tag;
# larger ones are emitted as a linked, hashed dist/_astro/*.css file. This
# design's global.css is ~2.1KB raw (~1.65KB naive-minified) -- comfortably
# under 4096B, so inlining is expected -- but this check accepts either
# shape rather than assuming which one the real build produces.
assert_stylesheet() {
  local out="$1"
  test -f "$out" || { echo "SMOKE FAIL: $out was not built"; exit 1; }
  if grep -q '68ch' "$out"; then
    echo "PASS: $out -- inline <style> carries the stylesheet (68ch measure found)"
    return
  fi
  local href
  href=$(grep -oE 'href="[^"]*\.css"' "$out" | head -1 | sed -E 's/^href="(.*)"$/\1/')
  if [ -n "$href" ]; then
    local cssfile="site/dist/_astro/$(basename "$href")"
    if [ -f "$cssfile" ] && grep -q '68ch' "$cssfile"; then
      echo "PASS: $out -- links $cssfile, which carries the stylesheet"
      return
    fi
  fi
  echo "SMOKE FAIL: $out has neither an inline nor a linked stylesheet with expected content"
  exit 1
}

assert_stylesheet site/dist/posts/_smoke-typography/index.html
assert_stylesheet site/dist/index.html

# ── AT-2 responsive check, by CSS inspection (explicitly issue-approved in
# lieu of a headless browser) ─────────────────────────────────────────────
CSS_SRC=site/src/styles/global.css
grep -q 'box-sizing: border-box' "$CSS_SRC" \
  && echo "PASS: universal box-sizing:border-box present" \
  || { echo "SMOKE FAIL: box-sizing:border-box missing"; exit 1; }
[ "$(grep -c 'overflow-x: auto' "$CSS_SRC")" = "2" ] \
  && echo "PASS: overflow-x:auto present on both table and pre" \
  || { echo "SMOKE FAIL: expected exactly 2 overflow-x:auto rules (table, pre)"; exit 1; }

# ── cleanup: the temp post must not survive to the PR ──────────────────────
rm -rf content/posts/_smoke-typography

# ── AT-4 regression: only the real fixture (status: draft) present ────────
# Clear Astro's content-layer cache before the "clean" rebuild -- confirmed
# by BUILD_REPORT_ISSUE_16_TLDR_DEDUPE.md that this cache survives content
# deletion and does NOT self-heal on a plain rebuild (Grounding #11).
rm -f site/node_modules/.astro/data-store.json
(cd site && npx astro build)
[ ! -e site/dist/posts/_fixture-hello-gear ] \
  && echo "AT-4: PASS (no page emitted for the draft fixture)" \
  || { echo "AT-4: FAIL"; exit 1; }
```

## Resolved decisions (headless run — no open forks left for the build phase)

1. **Citation convention:** cite `Future-Gadgets-AI/gear#18` directly; never print the `_synthesized/` path anywhere in this document — same convention as `DESIGN_ISSUE_16_TLDR_DEDUPE.md`, Resolved decision #1.
2. **Imported `site/src/styles/global.css` over an inline `<style>` block** — the load-bearing decision of this design (see "The decisive design choice" above): avoids Astro's scoped-`<style>`/slot limitation entirely rather than depending on every future editor remembering `is:global`.
3. **Color palette + scale are this design's own aesthetic call** per the issue's logged assumption ("aesthetic values ... are the delegate's call — veto at review"), except `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`, `~68ch`, and `line-height ≈ 1.6`, which are taken verbatim from the issue itself, not invented here.
4. **`table { display: block; overflow-x: auto; }` with no wrapper element** for responsive tables, since AT-1 forbids adding any markup (Grounding #9).
5. **`color-scheme: light dark;`** added at `:root` (unconditional) as a small, well-established complementary hint so native UI (scrollbars, form controls) also renders in the correct scheme — directly serves "dark mode ... readable," not a competing mechanism to the `prefers-color-scheme` media query.
6. **Smoke fingerprint chosen as the literal string `68ch`** (unique in this stylesheet, confirmed via `grep -c` — appears exactly once) and the presence check is written to accept either Astro bundling outcome (inline vs. linked), since this design phase is constrained to zero writes under `site/`/`content/` and therefore could not run the real build to observe which outcome occurs.
7. **Temp fixture/slug named `_smoke-typography`** (leading underscore, matching this repo's established non-published naming convention from `DESIGN_ISSUE_16`'s `_smoke-tldr-dedupe`).
8. **`img` styling excluded** — not named in the issue's scope and no content anywhere in this repo renders an `<img>` today; adding it would be unrequested scope growth.
9. **No wrapper element used** — the load-bearing constraint's default expectation (style `body` directly) fully satisfies every item in scope; no deviation needed or logged.

## File manifest

| File | Action | Purpose | Agent | Rationale |
|------|--------|---------|-------|-----------|
| `site/src/styles/global.css` | Create | Full typography/color/dark-mode/responsive stylesheet | (general-purpose) | No CSS/frontend/Astro specialist in the agentspec catalog (24 KB domains checked, none apply) or this repo's `.claude/agents/` (directory does not exist) — matches every prior DESIGN in this repo |
| `site/src/layouts/Layout.astro` | Edit | Add one-line side-effect import of the new stylesheet | (general-purpose) | Same reason; single-line, fully-dictated edit, no specialist judgment required beyond what's in this DESIGN |

## Acceptance-test mapping

| AT | Requirement (from the issue) | How this design satisfies it |
|----|-------------------------------|-------------------------------|
| AT-1 | Diff touches only `Layout.astro` (+ optionally one new CSS file); element tree identical before/after | `Layout.astro` gains exactly one import line; `<body><slot /></body>` untouched character-for-character; centered column achieved by styling `body`, not by adding a wrapper |
| AT-2 (smoke) | `astro build` passes; temp non-draft post's page + index carry the stylesheet; no horizontal overflow at 360px | Smoke procedure above: temp `_smoke-typography` post, build, `assert_stylesheet` on both built pages (inline-or-linked tolerant), CSS-inspection checks for `box-sizing:border-box` + both `overflow-x:auto` rules, cleanup |
| AT-3 | Dark variant via `prefers-color-scheme: dark`, contrast ≥ WCAG AA | `@media (prefers-color-scheme: dark)` block overrides 7 custom properties; body-text-vs-background computed at **14.19:1**, clears the 4.5:1 AA bar (see computation above) |
| AT-4 (regression) | Real fixture (`status: draft`) still yields no page | CSS-only change touches no schema/filter/loader logic; smoke procedure's final rebuild (after clearing the content-layer cache) re-confirms `site/dist/posts/_fixture-hello-gear` does not exist |
