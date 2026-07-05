---
name: render-article
description: Renders a post's canonical spec.md into the site's article.md — the fullest, least-compressed rendering, and the only one the Astro build schema-validates. Use when asked to "render the article", "generate article.md", or "render spec to article" for a post.
---

# Render Article

Derives a post's `article.md` from its canonical `spec.md` — a transform, never an independent rewrite.

## Inputs

- `content/posts/<slug>/spec.md`

## Procedure

1. Read `plugin/contracts/media/article.md` and `plugin/contracts/content-spec.md` — apply their rules; never restate them here.
2. Parse the spec's frontmatter and body.
3. Copy every frontmatter field verbatim, per content-spec.md's field table — omit any field the spec itself leaves unset (matching the site schema's optional typing); never invent or derive a value.
4. Assemble the body as a transform pass, never a reorder, preserving content-spec.md's Body Order:
   a. Copy the spec's TL;DR section verbatim as the body's first element — no separate title heading before it; the site's page template renders `title` as the page heading on its own.
   b. Copy each remaining standalone section verbatim, transforming only the pull-quote marker lines in place: drop the blockquote marker and its label, keep the sentence, and wrap it in plain emphasis. Apply this same transform to every pull-quote in every section.
   c. Replace the Claims & Sources table with a References section: one bullet per row, in the form `claim — source URL (accessed date)`, values copied verbatim — never invent a new citation.
5. Write `content/posts/<slug>/article.md`.

## Output

`content/posts/<slug>/article.md` — the frontmatter-carrying article, ready for the site's content collection.

## Contract

`plugin/contracts/media/article.md`, `plugin/contracts/content-spec.md`.
