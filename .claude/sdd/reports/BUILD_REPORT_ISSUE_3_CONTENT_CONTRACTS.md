# BUILD REPORT: gear issue #3 — Content contracts + brief template

## Summary

| Metric | Value |
|--------|-------|
| Tasks | 6/6 completed |
| Files Created | 6 (`plugin/contracts/content-spec.md`, `plugin/contracts/voice.md`, `plugin/contracts/media/article.md`, `plugin/contracts/media/linkedin.md`, `plugin/contracts/media/substack.md`, `.github/ISSUE_TEMPLATE/content-brief.yml`) |
| Agents Used | 0 (all `(general)` per manifest — no content-repo specialist agent exists) |

## Tasks with Attribution

| Task | Agent | Status | Notes |
|------|-------|--------|-------|
| `plugin/contracts/content-spec.md` | (general) | ✅ | Header cites Principles 1 & 2; frontmatter table + skeleton reused verbatim from DESIGN; Body Order / The Rule sections assembled from DESIGN's outline |
| `plugin/contracts/voice.md` | (general) | ✅ | Header cites Principle 4; 7 sections; sliders table; do/don't examples reused verbatim from DESIGN (4 pairs) |
| `plugin/contracts/media/article.md` | (general) | ✅ | Frontmatter line inherits from `content-spec.md`, consumes `title`/`tl_dr`; 6 rules from DESIGN's outline |
| `plugin/contracts/media/linkedin.md` | (general) | ✅ | Frontmatter line inherits, consumes `tl_dr` + one pull-quote; AT-4's 5 rules each on their own numbered line |
| `plugin/contracts/media/substack.md` | (general) | ✅ | Frontmatter line inherits, consumes `canonical_url`; prefix-line rule reused verbatim from DESIGN |
| `.github/ISSUE_TEMPLATE/content-brief.yml` | (general) | ✅ | GitHub issue form reused verbatim from DESIGN (schema WebSearch-confirmed at design time) |

## Verification

| Check | Command | Result |
|-------|---------|--------|
| All 6 files exist | `test -f` on each manifest path | ✅ Pass (all 6 present) |
| Issue-form YAML parses | `ruby -ryaml -e 'YAML.load_file(...)'` (design's own precedent) | ✅ Pass — parsed cleanly into the expected nested structure |
| Issue-form YAML parses (AT-3's literal command) | `python3 -c "import yaml; yaml.safe_load(...)"` | ⚠️ Environment gap — no `pyyaml` installed in this sandbox and installing it would require a network call (prohibited by hard constraints). Ruby's stdlib `YAML` parser was used instead, per the task's "or any available parser" allowance, and passed cleanly |
| voice.md — 7 sections, sliders, ≥3 do/don't pairs | `test $(grep -cE '^## ' voice.md) -ge 7 && grep -q 'Formal.*6' voice.md && test $(grep -c '^- Do:' voice.md) -ge 3` | ✅ Pass (7 sections, slider line matched, 4 `- Do:` lines) |
| linkedin.md — 5 AT-4 rules | `grep -q '210' && grep -qi 'no url in body' && grep -qi 'link in first comment' && grep -q '3 hashtags' && grep -qi 'derivation'` | ✅ Pass — all 5 patterns matched |
| Field-name consistency | grepped `content-spec.md`'s canonical field list against each media file's "Consumes:" line | ✅ Pass — `title`, `tl_dr` (article); `tl_dr` + pull-quote (linkedin); `canonical_url` (substack) all match content-spec.md exactly; no media file redeclares a `\| Field \| Type \|` table |
| No `.github/workflows/` or `plugin/skills/` touched | `git diff --name-only main...HEAD -- .github/workflows/ plugin/skills/ \| wc -l` | ✅ Pass (0) |
| No files beyond manifest | `git status --short` reviewed | ✅ Confirmed (only the 6 manifest files, plus the pre-existing untracked DESIGN doc input) |
| No GitHub/network calls | n/a (self-attested) | ✅ Confirmed — no `gh`/`git push`/network commands run |
| No commits made | n/a (self-attested) | ✅ Confirmed — no `git commit` run; composer owns the commit |

## Acceptance Test Mapping

| AT | File(s) | Check | Result |
|----|---------|-------|--------|
| AT-1 | all 6 | all present; each media file's Frontmatter line names `content-spec.md` and consumes only named fields, no redeclaration | ✅ Pass |
| AT-2 | `voice.md` | ≥7 `## ` sections, `Formal.*6` slider line, ≥3 `- Do:` lines | ✅ Pass (7 / match / 4) |
| AT-3 | `content-brief.yml` | valid YAML (parsed via ruby; pyyaml unavailable locally — see Verification) | ✅ Pass (parse); form-render check is manual/deferred — requires pushing the branch and opening GitHub's New Issue UI, which is a network/GitHub action out of this build's scope |
| AT-4 | `media/linkedin.md` | `210`, `no url in body`, `link in first comment`, `3 hashtags`, `derivation` all present | ✅ Pass |
| Constraint | repo-wide | `git diff --name-only main...HEAD -- .github/workflows/ plugin/skills/ \| wc -l` → 0 | ✅ Pass |

## Autonomous Decisions

| # | Decision Point | Options Considered | Chose | Rationale |
|---|----------------|--------------------|-------|-----------|
| 1 | voice.md's 7 sections were described by content (identity, sliders, tone, always/sometimes/never, mechanics, do/don't, voice-fixed-tone-flexes) but DESIGN gave no literal header text | (a) invent header wording freely, (b) use short, sentence-case, descriptive headers matching the content each section actually holds | (b) `## Identity`, `## Sliders`, `## Tone & anti-words`, `## Always / Sometimes / Never`, `## Mechanics`, `## Do / Don't examples`, `## Voice is fixed, tone flexes per medium` | Sentence-case headings is voice.md's own mechanics rule — the file dogfoods the rule it defines; wording stays a direct paraphrase of DESIGN's own section labels, no invention of new content |
| 2 | substack.md's prefix-line placeholder token differed slightly between DEFINE (`` `canonical_url` `` as a bare code span) and DESIGN (`` `*Originally published at [canonical_url].*` `` — bracket-wrapped inside the line) | (a) follow DEFINE's bare code-span form, (b) follow DESIGN's bracket-wrapped literal string verbatim, since DESIGN is the immediate build input | (b) DESIGN's exact string, plus one clause ("inserted verbatim") pointing back at content-spec.md's field-notes column | DESIGN supersedes DEFINE as the build's direct input (DEFINE is marked "throwaway design-phase input"); reproducing DESIGN's literal string is the smallest-correct-change; the added clause explains substitution without redeclaring the field |
| 3 | linkedin.md's 5 AT-4 rules: bullet style vs. numbered list | (a) plain `-` bullets, (b) numbered `1.`–`5.` list mirroring DESIGN's own `(1)`–`(5)` enumeration | (b) numbered list | Keeps a 1:1 traceable mapping to DESIGN's own rule numbering while still satisfying "each its own bullet so the acceptance test can grep them independently" — a numbered list item is still an independently-grep-able line |
| 4 | AT-3's literal verification command (`python3 -c "import yaml; ..."`) failed locally because `pyyaml` isn't installed | (a) `pip install pyyaml` to run the exact command, (b) use ruby's stdlib `YAML` parser instead (the design's own stated precedent) and note the substitution | (b) ruby | Installing a package is a network call, which is a hard constraint violation; the task itself names ruby as an acceptable alternative ("per the design's own validation precedent, or any available parser") — ruby parsed the file cleanly, so the check is satisfied without breaching the no-network constraint |

## Blockers

None. All 6 manifest files built and verified; no CRITICAL risks encountered; no GitHub/network calls made; no commits made (composer owns commit); `.github/workflows/` and `plugin/skills/` untouched. The only open item is AT-3's "confirm the form renders on New Issue" sub-check, which the design itself marks manual and requires pushing the branch to GitHub — out of scope for a local, network-free build and left for the human/composer step that follows.

## Status: ✅ COMPLETE
