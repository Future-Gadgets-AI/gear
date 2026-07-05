# Content Spec

Canonical post format — every per-medium rendering derives from this spec, never rewrites it independently (Constitution Principle 1: the spec is the artifact). The Claims & Sources table below is what makes a claim citable everywhere it's used (Constitution Principle 2: claims carry sources).

This file is the only place the frontmatter is defined. Every contract in `plugin/contracts/media/` inherits it in full and consumes a subset of its fields; none redeclares a field or a type.

## Frontmatter

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

## Body Order

1. **TL;DR block** — rendered from `tl_dr`, at the top of the body.
2. **Standalone `##` sections** — each section must survive standalone extraction: a reader who lands mid-article via a shared excerpt still gets a complete thought.
3. **Pull-quotes** — `> **pull-quote:**` lines, 1–2 per section, marking the sentence(s) most quotable outside the article.
4. **Claims & Sources table** — one row per factual claim: `claim | source URL | date accessed`.

## The Rule

A claim without a source row is review-blocking. This mirrors Constitution Principle 2: sourcing happens at draft time, not after — the blind reviewer checks the table, not the author's memory.

## Skeleton Example

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
