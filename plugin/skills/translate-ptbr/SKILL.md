---
name: translate-ptbr
description: Translates a chosen rendered sibling (article.md, linkedin.md, or substack.md) into Brazilian Portuguese under a ptbr/ subdirectory, degrading gracefully when no dedicated translation skill is loadable, and never gating English publication. Use when asked to "translate to portuguese", "generate the ptbr version", or "translate this post to pt-br".
---

# Translate PT-BR

Derives a Brazilian Portuguese translation of one already-rendered sibling — never the canonical spec — without ever blocking or delaying the English rendering, merge, or publish path.

## Inputs

- `content/posts/<slug>/<article.md|linkedin.md|substack.md>` — a rendered sibling, never `spec.md` itself.

## Procedure

1. Read `plugin/contracts/content-spec.md` (frontmatter field semantics) and `plugin/contracts/voice.md` (tone fallback) — apply their rules; never restate them here. No `media/ptbr.md` contract exists: ptbr is a language variant of whichever medium was chosen, not a medium of its own.
2. Check whether a `language-brazilian-portuguese` skill is loadable in the current session. If yes, load it and delegate terminology and tone to it. If no, translate directly using `voice.md` as the tone fallback, and record the degradation — that the dedicated skill was unavailable and a direct translation was used instead — in this skill's own run output, never inside the translated file itself.
3. Read the sibling's own `spec.md` for the canonical `slug` — never infer it from directory naming.
4. Translate only prose fields into PT-BR — `title`, each `tl_dr` item, and the body text. Copy every other field (`slug`, `date`, `tags`, `audience`, `canonical_url`) unchanged. Voice carries over as sliders and tone (voice.md); language-specific mechanics apply only where Portuguese has the construct — never force English mechanics (e.g. the Oxford-comma rule) onto PT-BR prose.
5. Mutate frontmatter only when the chosen rendering carries any (true for `article.md` today): set `translation_of` to the source `slug`, and keep `status` exactly as the source has it. `linkedin.md` and `substack.md` carry no frontmatter, so their translations are text-only, with nothing to mutate.
6. Write `content/posts/<slug>/ptbr/<same-filename>`.
7. Never gate English rendering, merge, or publish on this skill — it is cheap-tier and may run after merge.

## Output

`content/posts/<slug>/ptbr/<same-filename>` — a Portuguese-language translation of the chosen sibling, same filename, under `ptbr/`.

## Contract

`plugin/contracts/content-spec.md`, `plugin/contracts/voice.md`.
