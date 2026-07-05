# DESIGN — gear issue #3: Content contracts + brief template

## Metadata

- **Issue:** Future-Gadgets-AI/gear #3
- **Branch:** feat/content-contracts
- **DEFINE:** `.claude/sdd/_synthesized/DEFINE_ISSUE_3_CONTENT_CONTRACTS.md` (throwaway design-phase input)
- **Confidence:** 0.90 — no KB domain applies (checked `agentspec` KB: all 24 domains are data/cloud/code, none is content/voice) and no specialist agent exists (checked `agentspec` agents — architect/cloud/data-engineering/dev/platform/python/test/workflow — and this repo's `.claude/agents/`, which doesn't exist). Offsetting that: the DEFINE is exhaustively prescriptive (sliders, banned words, field names, checklist rules all fixed) — the one genuine design call left open is *how* three media contracts reference `content-spec.md`'s field table without restating it, resolved below. WebSearch confirmed GitHub's current issue-forms schema (`type`/`attributes`/`validations`) for the one novel-pattern file. Residual risk is prose/schema fidelity, not open architecture judgment.
- **Scope guard:** `plugin/skills/` (renderer skills — next issue) and `.github/workflows/` are out of scope. This design touches only the 6 manifest files below.

## Cross-file design: single source of field names

`content-spec.md` owns the frontmatter table below. Every media contract's own "Frontmatter" line reads **"inherits `content-spec.md` in full — see that file"**, then names only the fields *it consumes*; no media contract redeclares a field or a type. This makes AT-1's field-consistency a structural guarantee: there's nothing to drift, because there's nothing to restate.

### Frontmatter field table (shared, canonical — content-spec.md is the only place this is defined)

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Renders as the article's H1 |
| `slug` | string | yes | URL-safe identifier |
| `date` | date (`YYYY-MM-DD`) | yes | Draft / last-updated date |
| `status` | enum: `draft\|approved\|published` | yes | Gates publish (Constitution Principle 3) |
| `tags` | array[string] | yes | May be `[]` |
| `audience` | string | yes | Mirrors `content-brief.yml`'s `audience` field |
| `canonical_url` | string (URL) | yes | Consumed verbatim by substack's prefix line and linkedin's "Link in first comment" |
| `translation_of` | string (slug) | no | Set only on a translation (e.g. ptbr); points at the source post's slug |
| `tl_dr` | array[string], 3–5 items, ≤25 words each | yes | Written LAST; source for the body's TL;DR block and linkedin's derivation |

## Document Outlines

### 1. `plugin/contracts/content-spec.md`

Cites Constitution Principles 1 (spec is the artifact) and 2 (claims carry sources) in its header line. Sections: `## Frontmatter` (table above) → `## Body Order` — TL;DR block rendered from `tl_dr` · standalone `##` sections (each survives standalone extraction) · `> **pull-quote:**` lines (1–2/section) · Claims & Sources table (`claim | source URL | date accessed`) → `## The Rule` (a claim without a source row is review-blocking) → `## Skeleton Example`.

Skeleton (drafted verbatim, ~18 lines — all required frontmatter fields + all four body-order elements):

```markdown
---
title: "Blind Review Outlasts the Autonomous Run"
slug: blind-review-outlasts-run
date: 2026-07-04
status: draft
tags: [dark-factory]
audience: engineers
canonical_url: https://example.com/p/blind-review-outlasts-run
tl_dr:
  - An autonomous PR run still needs a human merge gate.
---
## TL;DR
- An autonomous PR run still needs a human merge gate.
## The gate, not the guardrail
> **pull-quote:** A blind reviewer re-runs the test plan; it never inherits the author's assumptions.
## Claims & Sources
| claim | source URL | date accessed |
|---|---|---|
| Blind review catches drift same-context review misses | https://example.com/study | 2026-07-01 |
```

### 2. `plugin/contracts/voice.md`

Cites Constitution Principle 4 (voice is a versioned contract) in its header. Seven `##` sections per DEFINE: (a) identity line — practitioner building in public, speaking to engineers/eng-leaders, authority = the public PR trail; (b) sliders — Formal↔Casual **6**, Serious↔Funny **2**, Respectful↔Irreverent **8** (toward respectful), Matter-of-fact↔Enthusiastic **4**; (c) tone adjectives + anti-words — "precise, not pedantic" · "confident, not salesy" · "evidence-first, not breathless"; (d) Always/Sometimes(rule)/Never lists — Never seeds: "delve", "moreover", "in today's landscape", rhetorical-question openers, "game-changer", "revolutionize"; (e) mechanics — active voice default, contractions fine, median sentence ≤30 words, Oxford comma, sentence-case headings; (f) paired do/don't examples (below); (g) voice-fixed/tone-flexes-per-medium note.

Do/don't examples (drafted verbatim, in-domain; each Don't exhibits a seeded banned pattern):

**1. Autonomous PR runs**
- Don't: "In today's landscape, autonomous PR runs are a total game-changer — they revolutionize how teams ship code! Isn't it amazing what AI can do?"
- Do: "An autonomous PR run does the line work — branch, build, test, push — while a human still approves the merge. The speed gain is real; the approval gate doesn't move."

**2. Review gates**
- Don't: "Moreover, our review gate is basically bulletproof — nothing gets past it, ever."
- Do: "The review gate catches drift a same-context reviewer misses, because that reviewer never saw the author's assumptions. It isn't bulletproof — it's a second, independent read."

**3. Citation discipline**
- Don't: "Let's delve into why citations matter — spoiler: nobody actually checks them anyway, so it's more of a formality."
- Do: "A claim without a source row is review-blocking, full stop — citation is the fact-check that happens before publish, not after."

**4. Blind review**
- Don't: "Blind review is a game-changer that will revolutionize your team's trust in AI — you won't believe how well it works!"
- Do: "Blind review works because the reviewer starts cold: a fresh clone, no shared context with the author. That isolation is the point, not a limitation."

### 3. `plugin/contracts/media/article.md`

Frontmatter line: inherits (see above); consumes `title`, `tl_dr`. Rules: one H1 from `title` · TL;DR block directly under it · clean H2/H3 hierarchy, no skipped levels · concrete statistics/quotes/citations to primary sources · meaning complete in static HTML · descriptive link text (never "click here").

### 4. `plugin/contracts/media/linkedin.md`

Frontmatter line: inherits (see above); consumes `tl_dr` + one pull-quote — derivation only, never a rewrite. AT-4's five rules, each its own bullet so the acceptance test can grep them independently: (1) hook in first ≤210 chars (mobile truncates ~120–140) · (2) NO URL in body · (3) final line literally "Link in first comment:" + `canonical_url` · (4) ≤3 hashtags or none · (5) content derived ONLY from `tl_dr` + one pull-quote. Structure notes (not among the five): hook→value→CTA order, short paragraphs + line breaks, save-worthy framing.

### 5. `plugin/contracts/media/substack.md`

Frontmatter line: inherits (see above); consumes `canonical_url`. Rules: full article prefixed with the line `*Originally published at [canonical_url].*` · single paste-ready file · no platform-specific styling.

### 6. `.github/ISSUE_TEMPLATE/content-brief.yml`

GitHub issue form: `name`, `description`, `title` prefix `[POST] `, `body` array of `type`/`attributes`/`validations` elements (schema confirmed via WebSearch against current GitHub docs). Drafted verbatim:

```yaml
name: Content Brief
description: Propose a new gear post — angle, audience, and sourced claims.
title: "[POST] "
body:
  - type: textarea
    id: angle
    attributes:
      label: Angle
      description: What's the post's core argument or hook?
    validations:
      required: true
  - type: input
    id: audience
    attributes:
      label: Audience
      description: Who is this post for?
      placeholder: e.g. engineers, eng-leaders
    validations:
      required: true
  - type: textarea
    id: key-claims
    attributes:
      label: Key claims with source URLs
      description: One per line, format "claim — URL".
      placeholder: |
        Blind review catches drift same-context review misses — https://example.com/study
    validations:
      required: true
  - type: checkboxes
    id: target-media
    attributes:
      label: Target media
      options:
        - label: article
        - label: linkedin
        - label: substack
        - label: ptbr
  - type: input
    id: series-slot
    attributes:
      label: Series slot
      description: Optional — which series/slot does this belong to?
    validations:
      required: false
```

## Testing (AT → check)

| AT | File(s) | Check |
|----|---------|-------|
| AT-1 | all 6 | `test $(git ls-files plugin/contracts/content-spec.md plugin/contracts/voice.md plugin/contracts/media/article.md plugin/contracts/media/linkedin.md plugin/contracts/media/substack.md .github/ISSUE_TEMPLATE/content-brief.yml \| wc -l) -eq 6` — plus each media file's Frontmatter line names `content-spec.md` and never redeclares a field |
| AT-2 | voice.md | `test $(grep -cE '^## ' plugin/contracts/voice.md) -ge 7 && grep -q 'Formal.*6' plugin/contracts/voice.md && test $(grep -c '^- Do:' plugin/contracts/voice.md) -ge 3` |
| AT-3 | content-brief.yml | `python3 -c "import yaml; yaml.safe_load(open('.github/ISSUE_TEMPLATE/content-brief.yml'))"` — plus push branch, confirm the form renders on New Issue (manual; no local GitHub UI) |
| AT-4 | media/linkedin.md | `grep -q '210' plugin/contracts/media/linkedin.md && grep -qi 'no url in body' plugin/contracts/media/linkedin.md && grep -qi 'link in first comment' plugin/contracts/media/linkedin.md && grep -q '3 hashtags' plugin/contracts/media/linkedin.md && grep -qi 'derivation' plugin/contracts/media/linkedin.md` |
| Constraint | repo-wide | `git diff --name-only main...HEAD -- .github/workflows/ plugin/skills/ \| wc -l` → expect `0` |

## File Manifest

| File | Action | Purpose | Agent | Rationale |
|------|--------|---------|-------|-----------|
| `plugin/contracts/content-spec.md` | Create | Canonical post schema + skeleton | (general) | Docs-only; no content-repo specialist agent exists |
| `plugin/contracts/voice.md` | Create | 7-section voice contract + do/don't examples | (general) | Same |
| `plugin/contracts/media/article.md` | Create | Article rendering rules | (general) | Same |
| `plugin/contracts/media/linkedin.md` | Create | LinkedIn rendering rules (5 AT-4 rules) | (general) | Same |
| `plugin/contracts/media/substack.md` | Create | Substack rendering rules | (general) | Same |
| `.github/ISSUE_TEMPLATE/content-brief.yml` | Create | GitHub issue form, `[POST] ` prefix | (general) | Same |
