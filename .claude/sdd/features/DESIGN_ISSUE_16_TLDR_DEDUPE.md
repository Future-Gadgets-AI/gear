# DESIGN — gear issue #16: Dedupe TL;DR rendering in the post template

## Metadata

- **Issue:** `Future-Gadgets-AI/gear#16` — "[TASK] Dedupe TL;DR rendering: post template AND article body both render it" — `readiness:ready`, DoR verdict READY (2026-07-05). **This issue is the sole requirements source for this design.** Per the issue's own instruction, the `implement` skill's synthesized working file is gitignored/ephemeral and unreviewable in a fresh clone — it is never cited here, including in the line above.
- **Branch:** `fix/tldr-dedupe-post-template` (already checked out).
- **Confidence:** 0.92 — no KB domain applies (Astro/frontend template edit; same 24-domain agentspec KB checked by `DESIGN_ISSUE_6_SITE_ASTRO.md`, none fits) and no specialist agent exists (agentspec catalog + this repo's `.claude/agents/`, confirmed absent — same finding as every prior DESIGN in this repo). Higher than `DESIGN_ISSUE_6`'s 0.70 precedent because the scope is one dictated before/after region in one file (the issue already specifies the literal fix, not an open architecture question), and the one subtle technical unknown feeding the smoke's assertions — whether Astro auto-adds an `id` attribute to rendered headings, and whether output HTML is whitespace-compressed onto fewer lines — was verified directly against the installed `astro@5.18.2` / `@astrojs/markdown-remark@5.18.2` source this session, not assumed (see Grounding).
- **Scope guard:** the committed diff touches only `site/src/pages/posts/[slug].astro` (AT-1), plus this DESIGN and its future `BUILD_REPORT_ISSUE_16_TLDR_DEDUPE.md` under `.claude/sdd/`. Out of scope, per the issue: any contract/renderer/schema change (see Logged trade-off), any file beyond `[slug].astro` in the code diff, and any commit or GitHub write (the composer commits as the bot).

## Problem (per `Future-Gadgets-AI/gear#16`)

`site/src/pages/posts/[slug].astro` hard-renders `<h2>TL;DR</h2>` plus a `<ul>` of `post.data.tl_dr` between the page's `<h1>` and `<Content/>` (confirmed live — see the Before block below), while the article contract (`plugin/contracts/media/article.md`) requires the post body itself to open with a TL;DR block. Once a real post's body carries that contract-mandated block, every non-draft post would render TL;DR twice. This must land before the first `[POST]` issue ships. The owner-decided fix (settled in the issue, not re-litigated here): the **template drops its hard-rendered block**; the body's contract-mandated TL;DR becomes the single source; **the H1 stays**.

## Grounding (read live, this session — not from training memory)

| # | Source | Key fact grounding this design |
|---|---|---|
| 1 | `site/src/pages/posts/[slug].astro` (current, live) | Exact current lines 8–12, incl. the combined `<h1>{post.data.title}</h1><h2>TL;DR</h2>` on one physical line 9 — see Before block below. |
| 2 | `plugin/contracts/media/article.md` | Rule: "One H1, rendered from `title`." Rule: "The TL;DR block sits directly under the H1." |
| 3 | `plugin/skills/render-article/SKILL.md`, step 4a | Body's first element is the spec's TL;DR section verbatim, explicitly "no separate title heading before it; the site's page template renders `title` as the page heading on its own" — confirms the template is the *sole* H1 source, by design. |
| 4 | `content/posts/_fixture-hello-gear/spec.md` | Directory contains only `spec.md` (no `article.md` yet). Body already opens `## TL;DR` + 3 bullets (contract-shaped). Frontmatter: `status: draft`, `slug: _fixture-hello-gear`. |
| 5 | `site/src/content.config.ts` | Loader pattern is `glob({ pattern: '*/article.md', ... })` — the fixture isn't in the Astro content collection *at all* today (no `article.md`). `status` schema is `z.enum(['draft','approved','published'])`. |
| 6 | `site/src/layouts/Layout.astro` | Bare shell (`<!doctype>`/`<head>`/`<body><slot/></body>`) — zero headings of its own. Confirms "first h2 in the whole rendered document" ≡ "first h2 after the h1" for the AT-2 assertion. |
| 7 | `site/node_modules/astro/dist/core/config/schemas/base.js` | `compressHTML: true` is Astro's *default* (this repo's `astro.config.mjs` doesn't override it) — build output HTML may be whitespace-compressed onto very few lines. A naive line-based (`awk`) heading-order check would be unreliable against that; the smoke below uses `grep -o`, which finds matches in left-to-right document order regardless of line length. |
| 8 | `site/node_modules/@astrojs/markdown-remark/dist/rehype-collect-headings.js` | `rehypeHeadingIds` runs unconditionally by default (`markdownConfigDefaults`, `index.js`) — every rendered heading gets a `github-slugger` `id` attribute. The smoke's heading grep must be attribute-tolerant (`<h2[^>]*>TL;DR</h2>`), not a bare exact-string match. |
| 9 | `site/astro.config.mjs`, `site/package.json` | `base: '/gear'` does not prefix `dist/` paths (dist layout is `dist/posts/<slug>/index.html`); `npm run build` == `astro build`; `astro@^5.18.2` pinned, matches installed. |
| 10 | `.claude/sdd/features/DESIGN_ISSUE_6_SITE_ASTRO.md` (committed, reviewable — cited for house style/dist-path precedent only, *not* as a requirements source) | Confirms this repo's existing smoke-script convention (bash + `grep`, temp fixture created and removed by the smoke only). |

## Render pipeline — before vs. after

```text
BEFORE (bug — two TL;DR blocks on one page)
  spec.md --render-article--> article.md (body opens: "## TL;DR" + bullets)
                                                  |
[slug].astro:  <h1/> + <h2>TL;DR</h2> + <ul post.data.tl_dr/>  +  <Content/> --> "## TL;DR" (again)
               \_______ template's hard-coded copy _______/      \_ body's contract copy _/
                                    = TWO TL;DR headings rendered

AFTER (fix — single source, H1 unchanged)
[slug].astro:  <h1/>  +  <Content/> --> "## TL;DR" (body's copy — the only one)
               template: owns the ONE H1        body: sole TL;DR source
                                    = ONE TL;DR heading rendered
```

## The fix — exact edit spec

**Before** (`site/src/pages/posts/[slug].astro`, current, 12 lines):

```astro
---
import { getCollection, render } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
export async function getStaticPaths() { return (await getCollection('posts', ({ data }) => data.status !== 'draft')).map((post) => ({ params: { slug: post.data.slug }, props: { post } })); }
const { post } = Astro.props;
const { Content } = await render(post);
---
<Layout title={post.data.title}>
<h1>{post.data.title}</h1><h2>TL;DR</h2>
<ul>{post.data.tl_dr.map((point) => <li>{point}</li>)}</ul>
<Content />
</Layout>
```

**After** (target, 11 lines):

```astro
---
import { getCollection, render } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
export async function getStaticPaths() { return (await getCollection('posts', ({ data }) => data.status !== 'draft')).map((post) => ({ params: { slug: post.data.slug }, props: { post } })); }
const { post } = Astro.props;
const { Content } = await render(post);
---
<Layout title={post.data.title}>
<h1>{post.data.title}</h1>
<Content />
</Layout>
```

**What changes, precisely:**

- Line 9 (`<h1>{post.data.title}</h1><h2>TL;DR</h2>`) loses only its `<h2>TL;DR</h2>` suffix. The H1 markup itself — `<h1>{post.data.title}</h1>` — is untouched and becomes its own line.
- Line 10 (`<ul>{post.data.tl_dr.map((point) => <li>{point}</li>)}</ul>`) is deleted in full. This is the file's *only* reference to `tl_dr`, so its removal alone satisfies AT-1.
- Every other line — the frontmatter imports, `getStaticPaths`'s draft-gate filter (`data.status !== 'draft'`, line 4), and `<Content />`/`</Layout>` — is untouched.
- Net effect: 12 lines → 11 lines; one line deleted outright, one line shortened in place.

## Why the H1 stays

- The contract (`plugin/contracts/media/article.md`) requires exactly **one** H1, rendered from `title` — not zero.
- The `render-article` skill deliberately does **not** put a title heading in the body: its Procedure step 4a copies the spec's TL;DR section as the body's *first* element specifically because "the site's page template renders `title` as the page heading on its own." The template is the contract's designated, sole producer of that H1.
- Therefore the template's H1 and the template's TL;DR block are not the same kind of duplication: the H1 has no other source anywhere in the pipeline, while the TL;DR block now has two (template + body). Removing the H1 would not fix a duplication — it would delete the page's only H1 and violate the contract outright. Removing the TL;DR block fixes the actual duplication while leaving the H1's single source intact.

## Logged trade-off (carried forward verbatim from the issue — not resolved here)

> The frontmatter render was an accidental backstop for a body that omits its TL;DR block; after this change such a post renders with no TL;DR. Enforcement stays with the render-article skill + review flow. `tl_dr` frontmatter remains schema-required and consumed by other renderers. Contract/renderer/schema changes are **out of scope**.

## Smoke procedure — AT-2 then AT-3 (working tree only; never committed; no commits)

Run from the repo root (`~/workspace/ventures/future-gadgets/repos/gear`), **after** the edit above has been applied to `[slug].astro`:

```bash
# Tooling precondition (per the issue's constraint) — site/node_modules is present today, but
# a fresh clone needs this:
(cd site && { [ -d node_modules ] || npm ci || npm install; })

# ── AT-2 setup: a temporary NON-DRAFT copy of the fixture ──────────────────────────────
# The loader only matches `*/article.md`, and the real fixture ships only `spec.md`, so a
# temp `article.md` is required to get it into the Astro content collection at all.
mkdir -p content/posts/_smoke-tldr-dedupe
sed -e 's/^status: draft$/status: approved/' \
    -e 's/^slug: _fixture-hello-gear$/slug: _smoke-tldr-dedupe/' \
    content/posts/_fixture-hello-gear/spec.md > content/posts/_smoke-tldr-dedupe/article.md
# Direct frontmatter+body copy, not the render-article skill: the fixture's body already opens
# "## TL;DR" + bullets (already contract-shaped), and invoking the renderer skill would pull an
# out-of-scope code path into what is strictly a template smoke.

(cd site && npx astro build)

# ── AT-2 assertions ─────────────────────────────────────────────────────────────────────
OUT=site/dist/posts/_smoke-tldr-dedupe/index.html
test -f "$OUT" || { echo "AT-2 FAIL: no output page emitted"; exit 1; }

# Exactly one TL;DR heading. Attribute-tolerant: rehypeHeadingIds (Astro default) adds id="..."
# to every rendered heading.
count=$(grep -o '<h2[^>]*>TL;DR</h2>' "$OUT" | wc -l | tr -d ' ')
[ "$count" = "1" ] && echo "AT-2 count: PASS" || echo "AT-2 count: FAIL ($count matches)"

# It is the first h2 anywhere in the document, and the document's first heading overall is the
# h1 (Layout.astro carries no headings of its own). Uses `grep -o` rather than a line-based scan
# because compressHTML defaults to true — output may be one long line, and `grep -o` still walks
# matches in left-to-right document order regardless of line length; a naive awk line-scan would
# not be reliable here.
headings=$(grep -oE '<h[1-6][^>]*>[^<]*</h[1-6]>' "$OUT")
first=$(printf '%s\n' "$headings" | sed -n '1p')
second=$(printf '%s\n' "$headings" | sed -n '2p')
{ printf '%s' "$first"  | grep -q '^<h1' && printf '%s' "$second" | grep -q '>TL;DR<'; } \
  && echo "AT-2 order: PASS" || echo "AT-2 order: FAIL (first=$first / second=$second)"

# ── cleanup: the temporary post must not survive to the PR ─────────────────────────────
rm -rf content/posts/_smoke-tldr-dedupe

# ── AT-3 regression: only the real, committed fixture present ──────────────────────────
# `astro build` empties outDir on every run (astro/dist/core/build/static-build.js), so this
# rebuild is not polluted by AT-2's dist output — no manual `rm -rf dist` needed.
(cd site && npx astro build)
[ ! -e site/dist/posts/_fixture-hello-gear ] \
  && echo "AT-3: PASS (no page emitted)" || echo "AT-3: FAIL"
```

**Honesty note on AT-3's rigor:** as scoped by the issue ("with only the real fixture (status: draft) present"), this check is satisfied *doubly* — the real fixture has no `article.md` at all (so it isn't in the collection regardless of status) **and** its `status: draft` would be filtered by `getStaticPaths` even if it were. This design does not attempt to isolate the two causes (that would need a second synthetic draft-`article.md` fixture, which is out of scope for this narrow fix); it verifies the regression exactly as the issue scoped it — the repo's checked-in state still yields zero fixture pages post-edit — and doubles as proof that AT-2's temporary fixture left no residue.

## Resolved decisions (headless run — no open forks left for the build phase)

1. **Citation convention:** cite `Future-Gadgets-AI/gear#16` directly; never print the `_synthesized/` path anywhere in this document. This intentionally diverges from `DESIGN_ISSUE_2/3/4/6`'s existing `**DEFINE:** .claude/sdd/_synthesized/...` metadata line, which cited a gitignored, unreviewable-in-a-fresh-clone path — exactly the gap this issue's own header calls out.
2. **Temp-fixture construction for AT-2:** a direct `sed` copy of `spec.md` into a temp `article.md` (swap `status` and `slug` only), not an invocation of the `render-article` skill — the fixture's body is already contract-shaped, and the skill's transform (pull-quote/Claims-table handling) is irrelevant to a template-only smoke and would widen its scope.
3. **Heading-match pattern made attribute-tolerant** (`<h2[^>]*>TL;DR</h2>`) after confirming, directly in the installed `@astrojs/markdown-remark@5.18.2` source, that `rehypeHeadingIds` unconditionally adds a slug `id` to every rendered heading.
4. **"First h2 after h1" implemented as "first h2 in the whole document"** after confirming `Layout.astro` carries no headings of its own — same guarantee, simpler check, grounded rather than assumed.
5. **Order check implemented with `grep -o`, not `awk`,** after confirming Astro's `compressHTML` default is `true` — a line-based scan could be fooled by whitespace-compressed single-line output; `grep -o` is immune to that because it enumerates matches in document order independent of line breaks.
6. **Temp directory/slug named `_smoke-tldr-dedupe`** (leading underscore, matching the fixture's own non-published naming convention) to avoid any collision with the real fixture and keep the `dist/` output path unambiguous.
7. **No explicit `rm -rf dist` between AT-2 and AT-3** — confirmed Astro's build pipeline empties `outDir` on every `astro build` invocation, so each run is already self-cleaning.

## File manifest

| File | Action | Purpose | Agent | Rationale |
|---|---|---|---|---|
| `site/src/pages/posts/[slug].astro` | Edit | Remove the template's hard-rendered TL;DR block; H1 + `<Content/>` unchanged in shape | (general-purpose) | No Astro/frontend specialist in the agentspec catalog (matches `DESIGN_ISSUE_6` precedent); single-file edit, fully dictated by the issue — no specialist judgment required beyond what's in this DESIGN |

## Acceptance-test mapping

| AT | Requirement (from the issue) | How this design satisfies it |
|---|---|---|
| AT-1 | `[slug].astro` no longer references `tl_dr`; git diff touches only that file | The edit deletes line 10 — the file's only `post.data.tl_dr` reference — in full; this design's only deliverables are `[slug].astro` itself plus the SDD docs |
| AT-2 (smoke) | Temp non-draft fixture copy → build has exactly one TL;DR heading, first h2 after h1 → temp post deleted after | Smoke procedure above: temp `_smoke-tldr-dedupe/article.md` (`status: approved`), `astro build`, `grep -o` count + order assertions, `rm -rf` cleanup |
| AT-3 (regression) | Only the real fixture (`status: draft`) present → build emits no page for it | Rebuild after cleanup; asserts `site/dist/posts/_fixture-hello-gear` doesn't exist (see Honesty note above) |
