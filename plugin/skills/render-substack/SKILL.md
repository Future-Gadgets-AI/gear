---
name: render-substack
description: Renders a post's canonical spec.md into a single paste-ready Substack draft — the article, cross-posted. Use when asked to "render substack", "generate substack.md", or "cross-post this to substack" for a post.
---

# Render Substack

Derives a single paste-ready Substack draft directly from a post's canonical `spec.md`.

## Inputs

- `content/posts/<slug>/spec.md`

## Procedure

1. Read `plugin/contracts/media/substack.md` — apply its rules; never restate them here.
2. Derive the body from `content/posts/<slug>/spec.md` directly, using the identical transform documented in `plugin/skills/render-article/SKILL.md`'s Procedure (TL;DR section verbatim, pull-quote markers transformed to emphasis, Claims & Sources table transformed to a References section). Never read the sibling `article.md` — re-deriving straight from the spec keeps the two renderers execution-order-independent.
3. Apply substack.md's prefix-line rule, inserting `canonical_url` verbatim from the frontmatter — the contract's angle brackets are only its placeholder marker, never literal output.
4. Write `content/posts/<slug>/substack.md`: the prefix line, a blank line, then the derived body — plain text, no frontmatter, single paste-ready file.

## Output

`content/posts/<slug>/substack.md` — a single paste-ready Substack draft: the prefix line plus the full derived article body, no frontmatter.

## Contract

`plugin/contracts/media/substack.md`.
