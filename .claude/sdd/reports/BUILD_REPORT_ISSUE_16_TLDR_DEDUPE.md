# BUILD REPORT: gear issue #16 — Dedupe TL;DR rendering in the post template

Source: `Future-Gadgets-AI/gear#16`. Branch: `fix/tldr-dedupe-post-template` (pre-existing, unchanged). Design: `.claude/sdd/features/DESIGN_ISSUE_16_TLDR_DEDUPE.md`.

## Summary

| Metric | Value |
|--------|-------|
| Tasks | 1/1 completed |
| Files edited | 1 (`site/src/pages/posts/[slug].astro`) |
| Agents used | 0 — `(general-purpose)` direct execution per the DESIGN's own manifest (no Astro/frontend specialist in the agentspec catalog or this repo's `.claude/agents/`) |
| `npm install` needed | No — `site/node_modules` was already present |
| Network used | None (no npm registry calls, no GitHub API calls, no commits/pushes) |
| Commits / pushes | None — read-only git usage throughout, per constraint |

## Tasks with Attribution

| Task | Agent | Status | Notes |
|------|-------|--------|-------|
| `site/src/pages/posts/[slug].astro` | (general-purpose, direct) | ✅ | Removed the hard-rendered `<h2>TL;DR</h2>` + `<ul>` block; `<h1>`/`<Content />`/`</Layout>` unchanged in shape |

## The diff (verbatim, only committed-diff file besides this report)

```diff
diff --git a/site/src/pages/posts/[slug].astro b/site/src/pages/posts/[slug].astro
index 48ea071..693bf04 100644
--- a/site/src/pages/posts/[slug].astro
+++ b/site/src/pages/posts/[slug].astro
@@ -6,7 +6,6 @@ const { post } = Astro.props;
 const { Content } = await render(post);
 ---
 <Layout title={post.data.title}>
-<h1>{post.data.title}</h1><h2>TL;DR</h2>
-<ul>{post.data.tl_dr.map((point) => <li>{point}</li>)}</ul>
+<h1>{post.data.title}</h1>
 <Content />
 </Layout>
```

12 lines → 11 lines, matching the DESIGN's exact Before/After spec. `git diff --stat` confirms exactly one file changed (`1 file changed, 1 insertion(+), 2 deletions(-)`).

## Acceptance tests — real commands, real captured output

### AT-1 — `[slug].astro` no longer references `tl_dr`; diff touches only that file

```
$ grep -n 'tl_dr' "site/src/pages/posts/[slug].astro"
(no output)
$ echo exit=$?
exit=1
$ git diff --stat
 site/src/pages/posts/[slug].astro | 3 +--
 1 file changed, 1 insertion(+), 2 deletions(-)
$ git status --porcelain=v1
 M site/src/pages/posts/[slug].astro
?? .claude/sdd/features/DESIGN_ISSUE_16_TLDR_DEDUPE.md
```

**AT-1: PASS** — zero `tl_dr` references remain in the file; the only tracked change in the working tree is `[slug].astro` (the untracked DESIGN doc predates this build and is expected, not part of the code diff).

### AT-2 (smoke) — temp non-draft fixture → exactly one TL;DR heading, first h2 after h1 → cleanup

Tooling precondition: `site/node_modules` already present, `npm install` skipped.

Setup (direct `sed` copy per the DESIGN's decision log #2, not the `render-article` skill):

```
$ mkdir -p content/posts/_smoke-tldr-dedupe
$ sed -e 's/^status: draft$/status: approved/' \
      -e 's/^slug: _fixture-hello-gear$/slug: _smoke-tldr-dedupe/' \
      content/posts/_fixture-hello-gear/spec.md > content/posts/_smoke-tldr-dedupe/article.md
$ head -14 content/posts/_smoke-tldr-dedupe/article.md
---
title: "Fixture: Hello Gear"
slug: _smoke-tldr-dedupe
date: 2026-07-04
status: approved
...
```

Build:

```
$ (cd site && npx astro build)
01:07:13 [content] Syncing content
01:07:13 [content] Synced content
01:07:13 [build] directory: .../site/dist/
 generating static routes 
01:07:13 ▶ src/pages/posts/[slug].astro
01:07:13   └─ /posts/_smoke-tldr-dedupe/index.html (+1ms)
01:07:13 [build] 2 page(s) built in 1.03s
01:07:13 [build] Complete!
```

Assertions:

```
$ OUT=site/dist/posts/_smoke-tldr-dedupe/index.html
$ test -f "$OUT" && echo "AT-2 file-exists: PASS"
AT-2 file-exists: PASS

$ grep -o '<h2[^>]*>TL;DR</h2>' "$OUT" | wc -l | tr -d ' '
1
AT-2 count: PASS (1 match)

$ grep -oE '<h[1-6][^>]*>[^<]*</h[1-6]>' "$OUT"
<h1>Fixture: Hello Gear</h1>
<h2 id="tldr">TL;DR</h2>
<h2 id="why-a-fixture-exists">Why a fixture exists</h2>
<h2 id="what-this-fixture-proves">What this fixture proves</h2>
<h2 id="claims--sources">Claims &#x26; Sources</h2>
first=<h1>Fixture: Hello Gear</h1>
second=<h2 id="tldr">TL;DR</h2>
AT-2 order: PASS
```

The captured `id="tldr"` on the heading empirically confirms the DESIGN's grounding fact #8 (`rehypeHeadingIds` adds a slug id to every heading) — the attribute-tolerant grep pattern was in fact necessary, not defensive over-engineering.

Cleanup:

```
$ rm -rf content/posts/_smoke-tldr-dedupe
$ [ ! -e content/posts/_smoke-tldr-dedupe ] && echo "cleanup: PASS"
cleanup: PASS (dir removed)
```

**AT-2: PASS** — file emitted, exactly one TL;DR heading, correct order (h1 then h2 TL;DR), temp fixture fully removed.

### AT-3 (regression) — only the real fixture (`status: draft`) present → no page emitted

First rebuild attempt (immediately after AT-2 cleanup, exactly as the DESIGN scripts it):

```
$ (cd site && npx astro build)
01:07:31 [WARN] [glob-loader] No files found matching "*/article.md" in directory "../content/posts"
 generating static routes 
01:07:31 ▶ src/pages/posts/[slug].astro
01:07:31   └─ /posts/_smoke-tldr-dedupe/index.html (+1ms)   ← unexpected: AT-2's deleted fixture reappeared
01:07:31 [build] 2 page(s) built in 429ms
```

This contradicted the expected result, so it was investigated rather than reported blind (see Autonomous Decisions #1). Root cause, confirmed directly:

```
$ ls content/posts/               # source: smoke dir genuinely gone
_fixture-hello-gear  .gitkeep

$ grep -c '_smoke-tldr-dedupe' site/node_modules/.astro/data-store.json
1                                  # stale slug still cached in Astro's content-layer store

$ (cd site && npx astro build)    # re-ran unmodified — does NOT self-heal
...
   └─ /posts/_smoke-tldr-dedupe/index.html (+1ms)   ← still present, 3rd build
```

The DESIGN's grounding that `astro build` empties `outDir` every run (verified true — `dist/` is fully regenerated each time) turned out to be an insufficient basis for "no manual cleanup needed between AT-2 and AT-3": the staleness lives one layer upstream, in Astro's content-layer cache (`node_modules/.astro/data-store.json`), which is independent of `outDir` and is **not** invalidated by a plain rebuild. Remediated by clearing that cache (a regenerable file inside `node_modules`, not a tracked or installed artifact) and rebuilding once more:

```
$ rm -f site/node_modules/.astro/data-store.json
$ (cd site && npx astro build)
01:10:18 [WARN] [glob-loader] No files found matching "*/article.md" in directory "../content/posts"
 generating static routes 
01:10:19 ▶ src/pages/index.astro
The collection "posts" does not exist or is empty. Please check your content config file for errors.
01:10:19 ▶ src/pages/posts/[slug].astro
The collection "posts" does not exist or is empty. Please check your content config file for errors.
01:10:19 [build] 1 page(s) built in 454ms
01:10:19 [build] Complete!
```

(The "does not exist or is empty" line is Astro's benign warning for a zero-entry collection — matches this repo's own `BUILD_REPORT_ISSUE_6_SITE_ASTRO.md` AT-1a precedent — not a build failure; exit was clean.)

Final assertion, run standalone (a first attempt piped through `ls` on the now-nonexistent `site/dist/posts/` directory produced a shell-chaining false negative — `ls` on a missing path returns nonzero and short-circuited the `&&` chain before the real test ran; re-run standalone below is the trustworthy result):

```
$ [ ! -e site/dist/posts/_fixture-hello-gear ] && echo "AT-3: PASS (no page emitted)" || echo "AT-3: FAIL"
AT-3: PASS (no page emitted)
```

**AT-3: PASS** — with the content-layer cache genuinely cleared, the real committed state (fixture has only `spec.md`, `status: draft`) yields zero pages under `posts/` (the `dist/posts/` directory isn't created at all — an even stronger negative than the DESIGN anticipated). Also reconfirms, honestly this time, that AT-2's temp fixture left no residue.

## Final repo-state check

```
$ git status --porcelain=v1
 M site/src/pages/posts/[slug].astro
?? .claude/sdd/features/DESIGN_ISSUE_16_TLDR_DEDUPE.md

$ ls content/posts/
_fixture-hello-gear  .gitkeep

$ git check-ignore site/node_modules && echo "node_modules: gitignored"
site/node_modules
node_modules: gitignored
$ git check-ignore site/dist && echo "dist: gitignored"
site/dist
dist: gitignored
```

Only `[slug].astro` is a tracked modification; `content/posts/` holds only the real fixture; `node_modules`/`dist` remain present but untracked, exactly as constrained. No commits, no pushes, no GitHub writes were made at any point.

## Autonomous Decisions

| # | Decision Point | Options Considered | Chose | Rationale |
|---|----------------|--------------------|-------|-----------|
| 1 | AT-3's first rebuild emitted a page for AT-2's already-deleted temp fixture, contradicting the DESIGN's "no manual `rm -rf dist` needed" claim | (a) report the DESIGN's scripted assertion result at face value (it would still technically say PASS, since that assertion only checks for `_fixture-hello-gear`, never `_smoke-tldr-dedupe`) and move on; (b) investigate the anomaly, find root cause, and remediate before reporting a final verdict | (b) investigated | A silent "PASS" here would be technically correct on the letter of the scripted check but false in spirit — the DESIGN's own honesty note claims AT-3 "doubles as proof that AT-2's temporary fixture left no residue," which was not actually true until this was fixed. Per this build's mandate to run the verification procedure and capture *real* output, a discovered discrepancy gets investigated, not buried |
| 2 | Root cause of the stale page: confirmed via `grep` that `site/node_modules/.astro/data-store.json` (Astro's content-layer cache) still referenced the deleted `_smoke-tldr-dedupe` slug, and a further unmodified rebuild proved it does not self-heal | (a) treat as a flaky/one-off and rebuild again hoping it clears; (b) identify the exact cache file and clear it deliberately | (b) targeted cache clear | Two consecutive unmodified rebuilds both reproduced the stale page — ruling out flakiness. `data-store.json` is a generated cache inside `node_modules` (gitignored, not part of the npm-installed package contents); deleting it is safe, non-destructive, and mirrors what a fresh clone / CI checkout would have (no stale cache at all) — the smallest correct action to get a truthful signal, without touching any tracked file or the constraint on `node_modules` remaining untracked |
| 3 | A first attempt at the final AT-3 assertion (chained with `ls site/dist/posts/` for a visual listing) printed "AT-3: FAIL" | (a) report that FAIL as the real result; (b) diagnose the shell chain before trusting it | (b) diagnosed | Tracing the `&&`/`||` chain showed `ls` on the now-nonexistent `site/dist/posts/` directory (zero posts ⇒ Astro never creates the parent dir) returned nonzero and short-circuited the chain *before* the actual `[ ! -e ... ]` test ran; the printed "FAIL" came from an `||` fallback branch, not a real evaluation. Re-ran the exact DESIGN-scripted assertion standalone, which is the trustworthy result recorded above (PASS) |
| 4 | Design's Grounding fact ("outDir empties every `astro build` run") vs. what was observed | (a) mark it wrong and flag as a DESIGN defect; (b) note it's accurate as far as it goes, but insufficient — the DESIGN conflated "dist gets wiped" with "no stale build-time content survives between runs," when in fact a separate, unexamined cache layer (content-layer `data-store.json`) is the actual source of cross-run staleness | (b) precise distinction, not a blanket "DESIGN is wrong" | The empirical evidence supports both: `dist/posts/` truly doesn't exist when the collection is empty (full wipe confirmed), *and* a stale page still got emitted from cache — these are compatible facts once the content-layer cache is understood as independent of `outDir`. Recorded precisely so a future SDD cycle in this repo (any future smoke that creates/deletes temp `article.md` fixtures) knows to clear `node_modules/.astro/data-store.json`, not just `dist/`, between fixture teardown and a "clean" rebuild |
| 5 | Whether to update DESIGN's own status header to "Built" (build-agent quality-gate item) | (a) edit `DESIGN_ISSUE_16_TLDR_DEDUPE.md` to mark it Built; (b) leave DESIGN untouched | (b) left untouched | Task's explicit constraint: "the only committed-diff file may be `site/src/pages/posts/[slug].astro` (plus your build report)" — editing DESIGN would violate that scope boundary. Status updates, if wanted, are the composer's/human's call at merge time |

## Logged trade-off (carried forward verbatim from the DESIGN / issue — not resolved by this build)

> The frontmatter render was an accidental backstop for a body that omits its TL;DR block; after this change such a post renders with no TL;DR. Enforcement stays with the render-article skill + review flow. `tl_dr` frontmatter remains schema-required and consumed by other renderers. Contract/renderer/schema changes are **out of scope**.

## Blockers

None. All three acceptance tests pass against real, captured command output; the only tracked-diff file is `site/src/pages/posts/[slug].astro`; no commits, pushes, or GitHub writes were made; `content/posts/` contains only the real fixture; `dist/` and `node_modules/` remain present but untracked.

## Status: ✅ COMPLETE
