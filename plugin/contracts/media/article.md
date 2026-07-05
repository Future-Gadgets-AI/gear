# Article

Renders a post's canonical spec as a standalone static-HTML article — the fullest, least-compressed rendering.

## Frontmatter

Inherits `content-spec.md` in full — see that file. Consumes: `title`, `tl_dr`.

## Rules

- One H1, rendered from `title`.
- The TL;DR block sits directly under the H1.
- Clean H2/H3 hierarchy — no skipped levels (no H3 without a preceding H2).
- Concrete statistics, quotes, and citations point at primary sources.
- Meaning is complete in static HTML — no content depends on client-side JS.
- Link text is descriptive — never "click here".
