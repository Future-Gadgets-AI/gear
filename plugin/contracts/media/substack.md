# Substack

Renders a post's canonical spec as a single paste-ready Substack draft — the article, cross-posted.

## Frontmatter

Inherits `content-spec.md` in full — see that file. Consumes: `canonical_url`.

## Rules

- The full article, prefixed with the literal line `*Originally published at [canonical_url].*`, where `[canonical_url]` is the frontmatter's `canonical_url` value inserted verbatim.
- Single paste-ready file — no split parts, no manual reassembly.
- No platform-specific styling — Substack's own editor formatting is applied at paste time, not baked into the source.
