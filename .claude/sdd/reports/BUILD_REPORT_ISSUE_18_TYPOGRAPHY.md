# BUILD REPORT: gear issue #18 — Minimal typographic styling for the site (v0 design pass)

Source: `Future-Gadgets-AI/gear#18`. Branch: `feat/site-typography`. Design: `.claude/sdd/features/DESIGN_ISSUE_18_TYPOGRAPHY.md`.

## Summary

| Metric | Value |
|--------|-------|
| Tasks | 2/2 completed |
| Files created | 1 (`site/src/styles/global.css` — new, 124 lines / 2,138 bytes) |
| Files edited | 1 (`site/src/layouts/Layout.astro` — +1 line, 0 removed) |
| Agents used | 0 — `(general-purpose)` direct execution per the DESIGN's own manifest (no CSS/Astro/frontend specialist in the agentspec catalog or this repo's `.claude/agents/`) |
| `npm install` needed | No — `site/node_modules` was already present |
| Stylesheet bundling outcome | **Inline** `<style>` tag in built `<head>` (confirmed empirically; matches the DESIGN's prediction since raw CSS is 2,138 bytes < Vite's 4,096-byte `assetsInlineLimit`) |
| Network used | None (no npm registry calls, no GitHub API calls, no commits/pushes) |
| Commits / pushes | None — read-only git usage throughout, per constraint |

## Tasks with Attribution

| Task | Agent | Status | Notes |
|------|-------|--------|-------|
| `site/src/styles/global.css` | (general-purpose, direct) | ✅ | New file, exact copy of the DESIGN's "The stylesheet" block, comment header included, 124 lines |
| `site/src/layouts/Layout.astro` | (general-purpose, direct) | ✅ | Added `import '../styles/global.css';` as the first frontmatter line; `<body><slot /></body>` and all other markup untouched character-for-character |

## The diff

`site/src/layouts/Layout.astro` (verbatim, only tracked-diff file besides this report):

```diff
diff --git a/site/src/layouts/Layout.astro b/site/src/layouts/Layout.astro
index 88f697c..53473a5 100644
--- a/site/src/layouts/Layout.astro
+++ b/site/src/layouts/Layout.astro
@@ -1,4 +1,5 @@
 ---
+import '../styles/global.css';
 interface Props { title: string }
 const { title } = Astro.props;
 ---
```

`git diff --stat`: `site/src/layouts/Layout.astro | 1 +` / `1 file changed, 1 insertion(+)` — exactly one line added, matching the DESIGN's Before/After spec 1:1.

`site/src/styles/global.css` is a **new file** (untracked, shows as `?? site/src/styles/` in `git status`, not in `git diff`) — 124 lines, 2,138 bytes, copied verbatim from the DESIGN's "The stylesheet" section including the `/* gear -- v0 minimal typographic pass (Future-Gadgets-AI/gear#18) */` header comment. Not pasted here in full per the task's instruction; the file itself is the artifact of record.

## Acceptance tests — real commands, real captured output

### AT-1 — diff touches only `Layout.astro` (+ the new CSS file); element tree identical

```
$ git diff --stat
 site/src/layouts/Layout.astro | 1 +
 1 file changed, 1 insertion(+)

$ git status --porcelain=v1
 M site/src/layouts/Layout.astro
?? .claude/sdd/features/DESIGN_ISSUE_18_TYPOGRAPHY.md
?? site/src/styles/
```

Only `Layout.astro` is a tracked modification (one inserted line, zero deletions); the only untracked entries are the two expected manifest paths (`site/src/styles/` holding the new `global.css`) plus the pre-existing DESIGN doc (present before this build started, not part of this diff). No other tracked or untracked file changed.

**AT-1: PASS** — by construction and confirmed via `git diff`/`git status`. Note: a before/after built-page element-tree comparison (confirming the rendered DOM shape is unchanged beyond the injected `<style>`/stylesheet reference) is the composer's job afterward, per the task's own framing — not re-claimed here. What this build *does* confirm directly: the `.astro` source's `<body><slot /></body>` line is byte-identical before and after (see diff above — that line does not appear in the `+`/`-` hunk at all), so no markup edit occurred at the source level.

### AT-2 (smoke) — `astro build` passes; stylesheet reaches both built pages; responsive CSS rules present; cleanup

Tooling precondition:

```
$ [ -d site/node_modules ] && echo "node_modules present, skipping install"
node_modules present, skipping install
```

Setup — temp non-draft post derived from the fixture via direct `sed` (per the DESIGN's decision log, not the `render-article` skill):

```
$ mkdir -p content/posts/_smoke-typography
$ sed -e 's/^status: draft$/status: approved/' \
      -e 's/^slug: _fixture-hello-gear$/slug: _smoke-typography/' \
      content/posts/_fixture-hello-gear/spec.md > content/posts/_smoke-typography/article.md
$ head -6 content/posts/_smoke-typography/article.md
---
title: "Fixture: Hello Gear"
slug: _smoke-typography
date: 2026-07-04
status: approved
tags: [fixture]
```

Build:

```
$ (cd site && npx astro build)
02:04:44 [content] Syncing content
02:04:44 [content] Synced content
02:04:44 [types] Generated 184ms
02:04:44 [build] output: "static"
02:04:44 [build] directory: .../site/dist/
 generating static routes 
02:04:44 ▶ src/pages/index.astro
02:04:44   └─ /index.html (+6ms) 
02:04:44 ▶ src/pages/posts/[slug].astro
02:04:44   └─ /posts/_smoke-typography/index.html (+1ms) 
02:04:44 λ src/pages/rss.xml.js
02:04:44   └─ /rss.xml (+2ms) 
02:04:44 [build] 2 page(s) built in 492ms
02:04:44 [build] Complete!
```

Build succeeded, zero errors.

Bundling-outcome check (which shape actually occurred):

```
$ find site/dist -maxdepth 2 -type d
site/dist
site/dist/posts
site/dist/posts/_smoke-typography
$ ls site/dist/_astro/ 2>&1
ls: site/dist/_astro/: No such file or directory
$ grep -oE '<style>.{0,80}' site/dist/posts/_smoke-typography/index.html | head -3
<style>:root{color-scheme:light dark;--color-bg: #ffffff;--color-text: #1a1a1a;--color-
```

No `_astro/` asset directory was emitted at all, and both built pages carry a literal inline `<style>` tag — **the DESIGN's prediction is confirmed**: at 2,138 raw bytes (well under Vite's 4,096-byte `assetsInlineLimit`), Astro's default `build.inlineStylesheets: "auto"` inlined the stylesheet rather than emitting a linked, hashed CSS file.

`assert_stylesheet` (DESIGN's exact function, run against both pages):

```
$ assert_stylesheet site/dist/posts/_smoke-typography/index.html
PASS: site/dist/posts/_smoke-typography/index.html -- inline <style> carries the stylesheet (68ch measure found)
$ assert_stylesheet site/dist/index.html
PASS: site/dist/index.html -- inline <style> carries the stylesheet (68ch measure found)
```

CSS-inspection responsive checks:

```
$ CSS_SRC=site/src/styles/global.css
$ grep -q 'box-sizing: border-box' "$CSS_SRC" && echo "PASS: universal box-sizing:border-box present"
PASS: universal box-sizing:border-box present
$ [ "$(grep -c 'overflow-x: auto' "$CSS_SRC")" = "2" ] && echo "PASS: overflow-x:auto present on both table and pre"
PASS: overflow-x:auto present on both table and pre
```

Cleanup:

```
$ rm -rf content/posts/_smoke-typography
$ [ ! -e content/posts/_smoke-typography ] && echo "cleanup: PASS (dir removed)"
cleanup: PASS (dir removed)
```

**AT-2: PASS** — build succeeded; both built pages carry the stylesheet inline (fingerprint `68ch` found); both mandated responsive CSS rules present (`box-sizing: border-box` once; `overflow-x: auto` exactly twice — table and pre); temp fixture fully removed.

### AT-4 (regression) — real fixture (`status: draft`) still yields no page

Mandatory pre-rebuild cache clear (this repo's own `BUILD_REPORT_ISSUE_16_TLDR_DEDUPE.md` proved Astro's content-layer cache, `site/node_modules/.astro/data-store.json`, survives content deletion and does not self-heal on a plain rebuild):

```
$ ls -la site/node_modules/.astro/
total 16
-rw-r--r--@ 1 lucas wheel 6729 5 jul 02:04 data-store.json
$ rm -f site/node_modules/.astro/data-store.json
```

The cache file was present and freshly written by the AT-2 build (confirming it would have carried the `_smoke-typography` slug forward, per the cited precedent), so this step was load-bearing, not defensive boilerplate.

Final rebuild:

```
$ (cd site && npx astro build)
02:05:08 [content] Syncing content
02:05:08 [WARN] [glob-loader] No files found matching "*/article.md" in directory "../content/posts"
02:05:08 [content] Synced content
...
 generating static routes 
02:05:08 ▶ src/pages/index.astro
02:05:08   └─ /index.htmlThe collection "posts" does not exist or is empty. Please check your content config file for errors.
 (+3ms) 
02:05:08 ▶ src/pages/posts/[slug].astro
The collection "posts" does not exist or is empty. Please check your content config file for errors.
02:05:08 λ src/pages/rss.xml.js
02:05:08   └─ /rss.xml...
02:05:08 [build] 1 page(s) built in 413ms
02:05:08 [build] Complete!
```

(The "does not exist or is empty" lines are Astro's benign warning for a zero-entry collection — matches this repo's own `BUILD_REPORT_ISSUE_16_TLDR_DEDUPE.md` / `BUILD_REPORT_ISSUE_6_SITE_ASTRO.md` precedent, not a build failure; exit was clean, 1 page built — the site index.)

Assertion:

```
$ [ ! -e site/dist/posts/_fixture-hello-gear ] && echo "AT-4: PASS (no page emitted for the draft fixture)"
AT-4: PASS (no page emitted for the draft fixture)
$ [ -e site/dist/posts ] && echo "site/dist/posts exists" || echo "site/dist/posts does not exist at all"
site/dist/posts does not exist at all
```

**AT-4: PASS** — with the content-layer cache genuinely cleared, the real committed state (fixture has only `spec.md`, `status: draft`) yields zero pages under `posts/` at all (an even stronger negative than a missing single directory: `site/dist/posts/` itself is never created), and no residue from AT-2's temp fixture.

### AT-3 — dark-mode contrast, independently re-verified

DESIGN's claim: body-text `#e0e0e0` on background `#121212` = **14.19 : 1**, clearing WCAG AA's 4.5:1 (and AAA's 7:1).

Independent re-computation (WCAG 2.x relative luminance formula, python3):

```
$ python3 -c "
def lin(c):
    c = c/255
    return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
def luminance(hexcolor):
    r = int(hexcolor[0:2], 16); g = int(hexcolor[2:4], 16); b = int(hexcolor[4:6], 16)
    return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b)
bg = luminance('121212'); text = luminance('e0e0e0')
lighter, darker = max(bg,text), min(bg,text)
ratio = (lighter + 0.05) / (darker + 0.05)
print(f'L(bg=#121212)  = {bg:.6f}')
print(f'L(text=#e0e0e0) = {text:.6f}')
print(f'contrast ratio  = {ratio:.4f} : 1')
"
L(bg=#121212)  = 0.006049
L(text=#e0e0e0) = 0.745404
contrast ratio  = 14.1913 : 1
```

Recomputed ratio **14.19 : 1** (14.1913 unrounded) — matches the DESIGN's headline claim exactly at the 2-decimal precision it asserts, and clears both AA (4.5:1) and AAA (7:1).

One small discrepancy surfaced and is reported rather than smoothed over: the DESIGN's hand-worked intermediate value for the background's linearized channel is `0.119041^2.4 = 0.006035`; an unrounded floating-point recompute of the same expression gives `0.11904098132143853^2.4 = 0.006049` — a rounding artifact of doing a fractional exponent by hand, on the order of 2×10⁻⁴ absolute. It does **not** change the contrast-ratio conclusion (both versions round to 14.19:1 and clear AA/AAA by a wide margin — the nearest AA threshold is 4.5:1, more than 3x away), so no fix to `global.css` is warranted; flagged here for the record per this build's mandate to verify rather than restate.

The three secondary pairs the DESIGN computed "in passing" were also independently spot-checked, all reproducing the DESIGN's stated figures exactly at 2-decimal precision:

```
dark link  #7db8ff on #121212: ratio=9.0744:1   (DESIGN: 9.07:1)
dark visit #c79bf0 on #121212: ratio=8.3634:1   (DESIGN: 8.36:1)
light text #1a1a1a on #ffffff: ratio=17.4043:1  (DESIGN: 17.40:1)
```

**AT-3: PASS** — 14.19:1 independently confirmed, clears WCAG AA (and AAA); the one arithmetic imprecision found does not affect the pass/fail conclusion.

## Final repo-state check

```
$ git status --porcelain=v1
 M site/src/layouts/Layout.astro
?? .claude/sdd/features/DESIGN_ISSUE_18_TYPOGRAPHY.md
?? site/src/styles/

$ ls content/posts/
_fixture-hello-gear
$ ls -a content/posts/
.  ..  .gitkeep  _fixture-hello-gear
```

Only `Layout.astro` is a tracked modification; `site/src/styles/` (new `global.css`) and the pre-existing DESIGN doc are the only untracked paths besides this report (which will appear as a third `??` entry once written). `content/posts/` holds exactly the real fixture plus `.gitkeep` (the latter is a dotfile — omitted by a plain `ls` without `-a`, confirmed present via `ls -a`). No commits, no pushes, no GitHub writes were made at any point; `site/node_modules/` and `site/dist/` remain present but untracked/gitignored, unchanged in that respect.

## Autonomous Decisions

| # | Decision Point | Options Considered | Chose | Rationale |
|---|----------------|--------------------|-------|-----------|
| 1 | The DESIGN's own "Resolved decisions" section (9 items) states there are no open forks left for the build phase | (a) take that at face value and log nothing; (b) still scan execution for any judgment call that arose in practice, even a small one | (b) — scanned, and confirmed no scope/file/approach deviation was needed anywhere in the build | Consistent with this repo's "distrust a tidy [prior-phase] report" ethos — verified rather than assumed the DESIGN's claim of zero remaining forks, rather than skipping the check |
| 2 | AT-3 verification surfaced a small (~2×10⁻⁴) arithmetic discrepancy between the DESIGN's hand-computed intermediate luminance value and an unrounded floating-point recompute | (a) silently restate the DESIGN's "14.19:1" headline and move on; (b) report the recomputed figures as-is, flag the discrepancy, and explicitly check whether it changes the pass/fail conclusion | (b) — flagged transparently | Guardrail against rounding a finding up or smoothing it over; the discrepancy is immaterial to the AA/AAA conclusion (both versions round to 14.19:1, more than 3x past the 4.5:1 AA bar), so it changes nothing about the verdict, but honest reporting requires surfacing it rather than hiding it |
| 3 | Whether to verify only the AT-3-mandated pair (text/background) or also the three secondary pairs the DESIGN computed "in passing" (link, visited, light-mode default) | (a) mandated pair only; (b) verify all four, since the marginal cost is one extra python expression | (b) — verified all four | Zero additional file/code scope; all four independently reproduced the DESIGN's stated ratios exactly at 2-decimal precision, strengthening confidence in the DESIGN's own grounding without expanding what was built or touched |

## Blockers

None. Both files match the DESIGN exactly (one-line `Layout.astro` import, verbatim `global.css`); `astro build` succeeded on both the smoke build and the post-cleanup regression rebuild; all four acceptance tests (AT-1, AT-2, AT-3, AT-4) pass against real, captured command output; the only tracked-diff file is `site/src/layouts/Layout.astro` (plus the new untracked `site/src/styles/global.css` and this report); `content/posts/` contains only the real fixture and `.gitkeep`; no commits, pushes, or GitHub writes were made.

## Status: ✅ COMPLETE
