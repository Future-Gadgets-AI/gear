# BUILD REPORT: gear issue #14 — Upgrade site to Astro 7.x

> Source: `DESIGN_ISSUE_14_ASTRO_7_UPGRADE.md`. Executed all 13 ordered migration steps
> literally, in order, in a fresh clone (`chore/astro-7-upgrade`), with real captured
> transcripts for every verification step (6–13). No git/gh writes made by this build —
> working-tree files and build/test commands only.

## Status: Complete

All 3 prescribed file changes applied. All acceptance tests (AT-1 through AT-4, both
halves each for AT-2/AT-3) pass with real, captured evidence. Final tree matches the
design's predicted `git status --short` output exactly.

## Files changed

| File | What | Why |
|---|---|---|
| `site/package.json` | `"astro": "^5.18.2"` → `"astro": "^7.0.6"` (`@astrojs/rss` untouched) | Required version bump — resolves the high-severity advisory that motivated issue #14 |
| `site/src/content.config.ts` | Split import: `z` now from `astro/zod` instead of the deprecated `astro:content` re-export (`defineCollection` stays from `astro:content`) | Recommended (non-blocking) fix for the one official, directly-named Astro v6 deprecation this file triggers |
| `site/package-lock.json` | Deleted and regenerated via `npm install` against the bumped manifest | Old lockfile was resolved against the 5.x tree; `npm ci` would reject it against the bumped `package.json` |

## Acceptance-test verification table

| AT | Check | Result | Evidence |
|---|---|---|---|
| **AT-1** | `npm audit`, 0 high/critical | **PASS** | `{"info":0,"low":0,"moderate":0,"high":0,"critical":0,"total":0}` — confirmed twice: once right after `npm install`, once again after the clean-slate `npm ci` in AT-4b. Both exit 0. |
| **AT-2a** (empty-state) | Build with only fixture post, no real posts | **PASS** | `npx astro build` with `content/posts/` containing only `_fixture-hello-gear/` + `.gitkeep`: `[WARN] [glob-loader] No files found matching "*/article.md" in directory "../content/posts"` (non-fatal) → `[build] 1 page(s) built in 710ms` → `[build] Complete!`. Exit 0. `dist/` = `index.html` (`<ul></ul>` empty), `robots.txt`, `rss.xml` (empty `<channel>`, no `<item>`). Posts restored afterward; `git diff -- content/` empty (byte-identical to HEAD). |
| **AT-2b** (content-present) | Build with all 4 real posts | **PASS** | `npx astro build`: `[content] Synced content` → 6 routes generated (`/posts/factory-built-its-own-tools/`, `/posts/one-keystroke-anatomy/`, `/posts/reviewer-caught-its-author/`, `/posts/two-assembly-lines/`, `/rss.xml`, `/index.html`) → `[build] 5 page(s) built in 1.15s` → `Complete!`. Exit 0. All 4 slugs confirmed present via grep in both `dist/index.html` and `dist/rss.xml`. |
| **AT-3a** (BASE_URL regression) | No `/gearposts` regression; correct base-prefixed hrefs | **PASS** | `grep -ri "gearposts" dist/` → zero hits (grep exit 1 = no match = pass). `grep -o 'href="[^"]*"' dist/index.html` → all 4 links in `/gear/posts/<slug>/` form (e.g. `href="/gear/posts/two-assembly-lines/"`). |
| **AT-3b** (draft-gate smoke) | half 1: draft post excluded from build | **PASS** | Derived `content/posts/_fixture-hello-gear/article.md` from `spec.md` (already `status: draft` and schema-complete — see Autonomous Decisions #2). Rebuild: exit 0, still only the same 6 routes as AT-2b — no `dist/posts/_fixture-hello-gear/`. `grep -c "_fixture-hello-gear" dist/index.html` → 0; same for `dist/rss.xml`; `grep -c "Fixture: Hello Gear" dist/index.html` → 0. |
| **AT-3b** (draft-gate smoke) | half 2: cleanup leaves tree fixture-free | **PASS** | Deleted temp `article.md`, `rm -f site/node_modules/.astro/data-store.json`, rebuild: exit 0, identical 6-route output. `git status --short -- content/` → empty (clean). |
| **AT-4a** (robots.txt) | `dist/robots.txt` intact, wildcard + 4 AI-crawler rules | **PASS** | `diff dist/robots.txt public/robots.txt` → exit 0 (byte-identical). Contains `User-agent: *`/`Allow: /` plus named `Allow: /` rules for `GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot`. |
| **AT-4b** (CI-equivalence) | Literal deploy-workflow command from clean slate | **PASS** | `rm -rf site/node_modules site/dist`, then `npm ci` → `added 206 packages... found 0 vulnerabilities`, exit 0; then `npx astro build` → exit 0, same 6-route output as AT-2b. `site/dist` confirmed present, matching `actions/upload-pages-artifact@v5`'s `path: site/dist`. No workflow file edited. |

**Final tree check** (`git status --short`, working dir root):
```
 M site/package-lock.json
 M site/package.json
 M site/src/content.config.ts
?? .claude/sdd/features/DESIGN_ISSUE_14_ASTRO_7_UPGRADE.md
```
Exact match to the design's predicted output — nothing else (no leftover stash dir, no temp `article.md`).

## Autonomous decisions

| # | Decision point | What happened | Resolution / rationale |
|---|---|---|---|
| 1 | Self-caught mistake: stash mechanism for AT-2a | First stash of the 4 real post directories used `git mv -k` (habit) instead of plain `mv`, which staged the moves in git's index even though `.tmp-posts-stash/` is a throwaway working-tree location, not a tracked destination. After restoring the files with a plain `mv`, `git status` showed spurious staged renames/deletes pointing at the now-gone stash path. | Corrected with `git restore --staged <paths>` — index-only unstage, not a commit/push/branch/gh operation — scoped exactly to the affected paths. Verified `git diff -- content/` was empty afterward (working tree byte-identical to HEAD). No data was ever at risk; this was purely a self-introduced index-bookkeeping artifact, caught and fixed before it could corrupt any AT's `git status --short` check. Flagging transparently per this repo's "distrust a tidy report, verify against git ground truth" norm. |
| 2 | Draft-gate smoke derivation mechanics | The design says to "sed-derive" a temp `article.md` from `_fixture-hello-gear/spec.md` with `status: draft`. `spec.md`'s frontmatter is already `status: draft` and already satisfies every required schema field (title, slug, date, status, audience, canonical_url, tl_dr). | Derived via `sed 's/^/&/'` (a literal pass-through — no field needed changing) rather than inventing an arbitrary substitution just to "use sed" for its own sake. The AT cares about the resulting file's schema-validity and draft-exclusion behavior, both satisfied; smallest-correct-change principle applied. |
| 3 | Cache-clear cadence around step 8 | The design's ordered steps only prescribe `rm -f .../data-store.json` before the *first* post-bump build (step 5) and again after the temp-article teardown (step 10) — not before step 8 (content-present build, which follows directly after the empty-state build + `npm audit`). | Followed the literal order — no extra cache-clear before step 8. This incidentally exercised the content-layer cache in the "posts added back after an empty-state build" direction (the reverse of the documented deletion gotcha), which built cleanly with all 4 posts picked up correctly — an additional (unprompted) positive data point beyond what the design's own POC tested. |

## Observations worth reporting (per design's request)

- **Content-layer cache gotcha: did not reproduce**, consistent with the design's own POC finding. This build exercised the cache across three separate transitions — (a) content-present → empty-state (posts removed), (b) empty-state → content-present with **no** intervening cache clear (posts restored), and (c) content-present → draft-added → draft-removed-with-cache-clear → clean rebuild — and every transition produced correct output with no stale or missing entries. This corroborates, rather than contradicts, the design's transparency note; treated as expected, not a defect.
- **Discrepancy vs. the design's POC on `esbuild`**: the design's Decisions log (#11) states "no `esbuild` package anywhere in the resolved dependency tree" for Astro 7.0.6. This build's actual `npm install` and `npm ci` both resolved `esbuild@0.28.1` as a **direct** dependency of `astro@7.0.6` (also pulled transitively via `vite@8.1.3`, deduped to the same version). This is a factual mismatch against the design doc, logged transparently as instructed. It does not affect AT-1: `npm audit` reports `0/0/0/0/0` at every check in this build (post-`npm install` and post-`npm ci`), so `esbuild@0.28.1`'s presence carries no live advisory today. Not a blocker.
- Local Node used for this build: `v25.8.1` (`npm 11.11.0`), comfortably clearing Astro 7's `>=22.12.0` floor. No `.nvmrc`/`engines` field added, consistent with the design's decision to leave that undocumented-in-package.json per repo precedent.
- Lockfile regenerated to `lockfileVersion: 3`, 298 `packages` entries, `astro@7.0.6` at the top level — consistent with the design's POC (design reported 300; this run reports 298, a trivial count difference not affecting any AT).

## Blockers

None.
