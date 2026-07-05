# DESIGN — gear issue #4: Renderer + translate skills

## Metadata

- **Issue:** Future-Gadgets-AI/gear #4
- **Branch:** feat/renderer-skills
- **DEFINE:** `.claude/sdd/_synthesized/DEFINE_ISSUE_4_RENDERER_SKILLS.md`
- **Confidence:** 0.90 — no KB domain applies (checked `agentspec` KB: 24 domains, all data/cloud/code) and no specialist agent exists (checked `agentspec` agents — architect/cloud/data-engineering/dev/platform/python/test/workflow — and this repo's `.claude/agents/`, absent), matching DESIGN_ISSUE_3's finding exactly. Offsetting: the DEFINE is exhaustively prescriptive (exact 9 fields, exact char/hashtag limits, exact body order); the residual design judgment — Claims-table→References format, render-substack's re-derivation vs. sibling-read, ptbr's frontmatter scope, and a template-duplication gap found while grounding — is resolved in Decisions. One technical claim underpinning AT-1 (Astro validates a collection's schema before any `getCollection` filter runs) was confirmed via WebSearch, cited below.
- **Scope guard:** touches only the 5 files in the File Manifest (4 `SKILL.md` + 1 fixture). Out of scope per DEFINE's constraints: contract edits, publishing automation/hooks, new agents, GitHub writes, plugin-manifest version bump (composer's job at commit time).

## Common SKILL.md anatomy (decided once, applied to all four)

```markdown
---
name: <kebab-case, matches plugin/skills/<name>/>
description: <one paragraph: what it derives and for whom>. Use when <trigger phrases, e.g. "render the article", "generate linkedin.md">.
---
# <Title>
<one-line purpose>
## Inputs
- <path(s) the skill needs — always under content/posts/<slug>/>
## Procedure
1. Read `plugin/contracts/...` — apply its rules; never restate them here.
2..N. <the load-bearing transformation steps, numbered>
N+1. Write `<sibling output path>`.
## Output
`<path pattern>` — <one-line description of what it contains>.
## Contract
`plugin/contracts/...` — DEFINE calls this the "checklist pointer"; same thing, renamed for this repo.
```

No scripts in v0 — every skill is a procedure the executing agent reads and follows by hand.

**Governing note on the numbers below:** concrete values (210 chars, 3 hashtags, the exact prefix-line text, etc.) are spelled out in this outline for the build phase's clarity only. The shipped `SKILL.md` Procedure text must phrase each as a pointer to its contract rule ("apply the hook length limit in `media/linkedin.md` rule 1") rather than hardcode the value — otherwise a future contract edit would silently drift from the skill, which is exactly what "reference by path, never restate" is meant to prevent.

## Per-skill procedures

**render-article** — renders `spec.md` as the site's `article.md`, the only rendering the Astro build schema-validates. **Inputs:** path to `spec.md`.
1. Read `plugin/contracts/media/article.md` and `plugin/contracts/content-spec.md` — apply, don't restate.
2. Parse the spec's frontmatter and body.
3. Frontmatter: copy all 9 fields verbatim, same keys as content-spec.md's table (`title, slug, date, status, tags, audience, canonical_url, translation_of?, tl_dr`) — omit `translation_of` entirely when the spec doesn't set it, matching the Zod schema's `.optional()`. No invented or derived values.
4. Body, assembled top-to-bottom as a transform pass, never a reorder (the spec is already in this order per content-spec.md's Body Order): (a) copy the spec's `## TL;DR` section verbatim as the body's first element, no H1 line before it — the site's `[slug].astro` renders `title` as the page H1 separately; (b) copy each standalone `##` section verbatim, transforming only `> **pull-quote:**` lines in place — drop the blockquote marker and label, keep the sentence, wrap it in plain emphasis (`*sentence*`); (c) replace the `## Claims & Sources` table with a `## References` section, one bullet per row: `- <claim> — <source URL> (accessed <date>)`, values verbatim, no new citations invented.
5. Write `content/posts/<slug>/article.md`.
**Output:** `content/posts/<slug>/article.md`.

**render-linkedin** — renders `spec.md` as a LinkedIn-native derivation (hook → value → CTA). **Inputs:** path to `spec.md`.
1. Read `plugin/contracts/media/linkedin.md` and `plugin/contracts/voice.md` — apply, don't restate.
2. Parse the spec: pool every `tl_dr` bullet plus every `> **pull-quote:**` sentence across all sections into one candidate list.
3. Hook selection: discard any candidate over 210 chars; from what remains, pick the most concrete claim — one carrying a concrete number/statistic outranks a purely qualitative one, ties go to the more specific claim — used verbatim, never edited or invented.
4. Body (derivation-only): hook, then a short value block built ONLY from the remaining `tl_dr` bullets not used as the hook, each its own short line — never draw from spec sections outside `tl_dr`/pull-quotes; no `canonical_url` anywhere in this block.
5. Hashtags: 0–3, derived only from the spec's `tags` field (e.g. `dark-factory` → `#DarkFactory`) — never invented.
6. Final line, literal: `Link in first comment: <canonical_url>` (verbatim frontmatter value).
7. Write `content/posts/<slug>/linkedin.md` — plain text, no frontmatter (not read by `content.config.ts`; paste-ready as-is).
**Output:** `content/posts/<slug>/linkedin.md`.

**render-substack** — renders `spec.md` as a single paste-ready Substack draft: the article, cross-posted. **Inputs:** path to `spec.md`.
1. Read `plugin/contracts/media/substack.md` — apply, don't restate.
2. Derive the body using the identical transform as render-article's Procedure step 4 (TL;DR verbatim → sections with pull-quote→emphasis → Claims table→References) — re-derived directly from `spec.md`, not read from sibling `article.md`, so the two renderers stay execution-order-independent.
3. Prefix line: `*Originally published at <canonical_url>.*`, with `canonical_url` inserted verbatim (angle brackets are the contract's placeholder marker, never literal output).
4. Write `content/posts/<slug>/substack.md`: prefix line, blank line, then the derived body — plain text, no frontmatter, single paste-ready file.
**Output:** `content/posts/<slug>/substack.md`.

**translate-ptbr** — translates a chosen rendered sibling to Brazilian Portuguese under `ptbr/`, never blocking EN publication. **Inputs:** path to a rendered sibling (`article.md`, `linkedin.md`, or `substack.md`) — never `spec.md` itself (AT-4 requires spec.md untouched by every skill).
1. Read `plugin/contracts/content-spec.md` (frontmatter field semantics) and `plugin/contracts/voice.md` (tone fallback) — no `media/ptbr.md` contract exists; ptbr is a language variant of whichever medium was chosen, not a medium of its own.
2. Check whether a `language-brazilian-portuguese` skill is loadable in the current session: if yes, load it and delegate terminology/tone; if no (expected in this repo today), translate directly using `voice.md` as the tone fallback and record the degradation in the skill's own run output — never inside the translated file.
3. Read the sibling `spec.md`'s `slug` (canonical source, never inferred from directory naming).
4. Translate only prose — `title`, `tl_dr` items, body text — into PT-BR; copy `slug`, `date`, `tags`, `audience`, `canonical_url` unchanged.
5. Frontmatter mutation applies only when the chosen rendering carries frontmatter (`article.md` today): set `translation_of: <slug>`, keep `status` exactly as the source has it. `linkedin.md`/`substack.md` carry no frontmatter, so their ptbr copies are text-only translations with nothing to mutate.
6. Write `content/posts/<slug>/ptbr/<same-filename>`.
7. Never gate EN rendering/merge/publish on this skill — it's cheap-tier and may run post-merge.
**Output:** `content/posts/<slug>/ptbr/<same-filename>`.

## Fixture — `content/posts/_fixture-hello-gear/spec.md`

```markdown
---
title: "Fixture: Hello Gear"
slug: _fixture-hello-gear
date: 2026-07-04
status: draft
tags: [fixture]
audience: engineers
canonical_url: https://example.com/p/_fixture-hello-gear
translation_of: _fixture-source-post
tl_dr:
  - This is a fixture post used only to verify the renderer skills, not real content.
  - Fixture posts stay status draft forever, so the site's draft gate excludes them from publish.
  - Each render skill runs against this fixture before it ever runs against a real post.
---
## TL;DR
- This is a fixture post used only to verify the renderer skills, not real content.
- Fixture posts stay status draft forever, so the site's draft gate excludes them from publish.
- Each render skill runs against this fixture before it ever runs against a real post.
## Why a fixture exists
A renderer only ever tested against real posts has never been tested against a stable input — this fixture is that stable input: fabricated, never published, safe to keep committed.
> **pull-quote:** A fixture that never publishes is still worth committing if every renderer depends on it.
## What this fixture proves
Passing all four render skills against this one file is the whole verify gate for issue #4 — no real post is needed to prove the renderers work end to end.
> **pull-quote:** The verify gate runs against a fixture, not a promise that it works on a real post.
## Claims & Sources
| claim | source URL | date accessed |
|---|---|---|
| Fixture data is standard practice for testing data pipelines | https://example.com/fixture-testing | 2026-07-01 |
| Astro validates a collection's schema at load, before any query-time filter runs | https://example.com/astro-draft-gate | 2026-07-02 |
| A renderer fixture should never depend on network access | https://example.com/offline-fixtures | 2026-07-03 |
```

(9 fields, 2 sections, 2 pull-quotes, 3-row table, 3 tl_dr bullets, "Fixture" in the title and first TL;DR bullet — `translation_of` is set to a nonexistent placeholder slug purely to exercise render-article's optional-field passthrough; see Decisions.)

## Verify plan

| AT | Steps |
|----|-------|
| AT-1 | Run render-article/render-linkedin/render-substack on the fixture. `article.md`: `grep -q '^## References' article.md`, `! grep -q 'pull-quote:' article.md` (marker fully transformed), `! grep -qE '^# ' article.md` (no stray body H1). `linkedin.md`: see AT-2. `substack.md`: `head -1 substack.md` matches `*Originally published at https://example.com/p/_fixture-hello-gear.*`. Then `cd site && npm run build` must exit 0 — this schema-validates every `*/article.md` (including the draft fixture) at content-layer load, before `getCollection`'s status filter runs (confirmed via WebSearch, see Decisions) — then confirm the draft gate: `! grep -q _fixture-hello-gear site/dist/index.html` and no `site/dist/posts/_fixture-hello-gear/` directory. |
| AT-2 | On the fixture's `linkedin.md`: `tail -1 linkedin.md` equals `Link in first comment: https://example.com/p/_fixture-hello-gear` exactly; `head -n -1 linkedin.md \| grep -qE 'https?://'` exits 1 (no URL before the final line). |
| AT-3 | Run translate-ptbr on the fixture's `article.md` → `test -f content/posts/_fixture-hello-gear/ptbr/article.md` → `grep -q '^translation_of: _fixture-hello-gear$' ptbr/article.md` and `grep -q '^status: draft$' ptbr/article.md` → spot-check (agent read, not shell-checkable) that title/tl_dr/body read as Portuguese prose, not English. |
| AT-4 | `sha256sum content/posts/_fixture-hello-gear/spec.md` before any skill runs; run all four skills in sequence; `sha256sum` again; diff the two — expect identical (no skill ever opens `spec.md` with Write/Edit, only Read). |

## Decisions log

- Confidence 0.90 — rationale above; same class of no-KB/no-agent task as DESIGN_ISSUE_3.
- **Gap found while grounding, out of scope to fix here:** `site/src/pages/posts/[slug].astro` already hard-renders `<h2>TL;DR</h2>` plus a list from `post.data.tl_dr`, outside `<Content/>`. `article.md`'s own contract rule ("TL;DR block sits directly under the H1") still requires the body to carry its own TL;DR section, so the live page will double-render TL;DR until a follow-up issue dedupes the template. Not fixed here: the file manifest is the 4 skills + fixture only, and site templates are outside this issue's scope.
- Astro's `getCollection(name, filter)` validates every entry's schema at content-layer load, before the filter callback runs — confirmed via WebSearch (docs.astro.build) — so `astro build` schema-checks the draft fixture's `article.md` even though the draft gate excludes it from rendered output.
- The collection loader glob (`*/article.md`, one wildcard segment) matches only `content/posts/<slug>/article.md` — not `linkedin.md`, `substack.md`, or `ptbr/article.md` (two segments deep). Those are never site-loaded or schema-validated; expected, not a gap this issue needs to close.
- `linkedin.md`/`substack.md` carry no YAML frontmatter — paste-ready text only; frontmatter would have to be stripped before pasting, and neither file is read by `content.config.ts`.
- render-substack re-derives its body directly from `spec.md` (identical transform to render-article, cross-referenced by name) rather than reading sibling `article.md` — keeps the two renderers execution-order-independent (self-contained units, no shared runtime dependency).
- Claims & Sources → References renders as a bullet list (`claim — URL (accessed date)`), not a table — reads naturally in a published article; no new link text is invented, so "never click here" doesn't apply to a bare URL.
- LinkedIn hashtags source only from the spec's `tags` field — never invented, keeping the skill derivation-only (linkedin.md rule 5).
- translate-ptbr reads `slug` from the sibling `spec.md`, never inferred from directory naming; only prose fields (title/tl_dr/body) are translated, all other fields copied unchanged.
- Fixture's `translation_of` is a fictitious, never-created sibling slug — present only to exercise render-article's optional-field copy path in the same run that already covers the omitted-field path in real posts.

## File Manifest

| File | Action | Purpose | Agent | Rationale |
|------|--------|---------|-------|-----------|
| `plugin/skills/render-article/SKILL.md` | Create | spec → article.md: 9-field frontmatter + TL;DR/pull-quote/References body transform | (general) | Docs-only procedure; no content-rendering specialist agent exists (checked agentspec + repo `.claude/agents/`) |
| `plugin/skills/render-linkedin/SKILL.md` | Create | spec → linkedin.md: hook selection, derivation-only body | (general) | Same |
| `plugin/skills/render-substack/SKILL.md` | Create | spec → substack.md: prefix line + re-derived article body | (general) | Same |
| `plugin/skills/translate-ptbr/SKILL.md` | Create | rendered sibling → ptbr/<file>: graceful degradation, translation_of | (general) | Same |
| `content/posts/_fixture-hello-gear/spec.md` | Create | Fixture input driving AT-1..AT-4 | (general) | Same |
