---
name: render-linkedin
description: Renders a post's canonical spec.md into a LinkedIn-native derivation (hook, value block, call-to-action) — never a rewrite of the full article. Use when asked to "render linkedin", "generate linkedin.md", or "post this to linkedin" for a post.
---

# Render LinkedIn

Derives a LinkedIn-native post from a spec's `tl_dr` bullets and pull-quotes — hook, value, CTA, never a rewrite of the full article.

## Inputs

- `content/posts/<slug>/spec.md`

## Procedure

1. Read `plugin/contracts/media/linkedin.md` and `plugin/contracts/voice.md` — apply their rules; never restate them here.
2. Parse the spec: pool every `tl_dr` bullet plus every pull-quote sentence across all sections into one candidate list.
3. Apply linkedin.md's hook-length rule (rule 1) to discard any candidate that exceeds it. From what remains, pick the most concrete claim — a candidate carrying a concrete number or statistic outranks a purely qualitative one; when concreteness is tied, a pull-quote outranks a `tl_dr` bullet (voice.md's medium shape is a hook plus one pull-quote — the pull-quote must be able to win ties). Use the winning candidate verbatim — never edited or invented.
4. Build the body as derivation-only: the hook, then a short value block assembled ONLY from the remaining `tl_dr` bullets not used as the hook, each on its own short line. If the hook is not itself a pull-quote, the value block also carries the single strongest pull-quote as its own line — one of the two slots must hold a pull-quote, or the rendering contradicts voice.md's declared shape for this medium. Never draw from spec sections outside `tl_dr`/pull-quotes, and keep `canonical_url` out of this block entirely (linkedin.md rule 2).
5. Apply linkedin.md's rule on optional platform tag markers (rule 4): derive each one only from the spec's `tags` field, converting kebab-case to a `#`-prefixed CamelCase token (e.g. `dark-factory` → `#DarkFactory`) — never invent a tag beyond what `tags` lists. They sit after the value block, before the closing line.
6. Apply linkedin.md's closing-line rule (rule 3): the literal closing line with `canonical_url` inserted verbatim from the frontmatter.
7. Write `content/posts/<slug>/linkedin.md` — plain text, no frontmatter; not read by `content.config.ts`, so it's paste-ready as-is.

## Output

`content/posts/<slug>/linkedin.md` — a plain-text, paste-ready LinkedIn post derived only from the spec's `tl_dr` and pull-quotes.

## Contract

`plugin/contracts/media/linkedin.md`, `plugin/contracts/voice.md`.
