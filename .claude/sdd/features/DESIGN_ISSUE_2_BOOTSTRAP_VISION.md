# DESIGN — gear issue #2: Bootstrap gear + vision docs

## Metadata

- **Issue:** Future-Gadgets-AI/gear #2
- **Branch:** feat/bootstrap-vision-docs
- **DEFINE:** `.claude/sdd/_synthesized/DEFINE_ISSUE_2_BOOTSTRAP_VISION.md` (self-marked throwaway — not committed, not status-updated)
- **Confidence:** 0.90 — no KB domain applies (docs/manifest bootstrap, not a code domain: checked `agentspec` KB, all 24 domains are data/cloud/code) and no specialist agent exists for content-repo prose (checked `agentspec` KB agents — architect/cloud/data-engineering/dev/platform/python/test/workflow — and this repo's `.claude/agents/`, empty). Offsetting that: DEFINE is exhaustively prescriptive (fixed 6-file manifest, drafted AT-1..AT-5, exact plugin.json/`.gitignore` deltas), so residual risk is prose fidelity, not architecture judgment.
- **Scope guard:** `plugin/contracts/`, `plugin/skills/`, site — explicitly out of scope (later issues own those). This design touches only the 6 manifest files, no more.

## Document Outlines

### CONSTITUTION.md (≤~150 lines; 6 principles, one MUST + rationale each)

`# Constitution — gear` → one-line framing (patterned on agentic-dev's sibling `CONSTITUTION.md` — gear inherits the dark-factory doctrine) → `## Core Principles`, six `### N. <Name>` sections each holding exactly a MUST bullet + a Rationale bullet → closing `## Governance` (amendment = normal doc PR + blind-review-plus-human-merge, no extra ceremony) → version footer.

The six drafted MUST lines (verbatim, one per principle):

1. **The Spec Is the Artifact**
   - MUST: "The canonical content spec MUST be the artifact of record for every post — per-medium renderings are derivations of it, never independent rewrites."
   - Rationale: a rendering that drifts from its spec is unreviewable and uncitable the moment it leaves the repo.
2. **Claims Carry Sources**
   - MUST: "Every factual claim MUST carry a citation at draft time — a claim without a source row is review-blocking."
   - Rationale: post-hoc fact-checking catches only ~38–54% of false claims in controlled studies; sourcing must happen before publish, not after.
3. **Human Merge = Editorial Approval**
   - MUST: "A post MUST NOT publish without a human's merge approval — manual paste to a social platform is the boundary an agent never crosses."
   - Rationale: the merge is the one moment editorial judgment is exercised before words become a public, reputational commitment.
4. **Voice Is a Contract, Not a Vibe**
   - MUST: "Every rendering MUST conform to the versioned `voice.md` contract — a merge-time voice edit flows back as a diff, never as unwritten tribal knowledge."
   - Rationale: an unversioned "sound like us" drifts per writer and per session; only a versioned file can be loaded by a renderer and diffed by a reviewer.
5. **Identity Doctrine Inherited**
   - MUST: "Every organizational write MUST run as the machine account, never a personal one — Administration is never bot-held, and any ambient admin step is marked and human-confirmed."
   - Rationale: agentic-dev's Principle VII inherited unchanged — the same attribution discipline that governs a merged PR governs a published post.
6. **Build in Public**
   - MUST: "Every draft, review, and PR MUST remain part of the public trail — the citable evidence of how a post came to be."
   - Rationale: the same "GitHub is the state store" logic as the code factory, applied to content.

### GOAL.md (≤60 lines; P2 exit ledger, unchecked boxes)

`# Goal — gear P2 exit ledger` → `## Mission` (1–2 sentences: dark-factory content pipeline, humans author + approve, the line runs autonomously) → `## P2 Exit Criteria`, six `- [ ]` boxes verbatim from DEFINE: contracts live · renderer skills live · plugin in cc-plugins (url/https) · site live with deploy-on-merge · first post end-to-end · series backlog seeded → `## Volatility` (normal doc PR, no amendment ceremony — contrast CONSTITUTION.md).

### README.md (replaces placeholder; zero-context-reader friendly)

`# gear` → intro paragraph reusing the existing placeholder's line verbatim ("G.E.A.R. — Grounding · Experience · Authority · Reach. Dark-factory content pipeline: canonical content specs, per-medium renderers, blind-reviewed drafts, human-merged publishes.") → `## Pipeline` with the ASCII diagram below → `## What's Here` — pointers to `plugin/contracts/` and `plugin/skills/` marked "(upcoming — later issues)", plus `CONSTITUTION.md` / `GOAL.md` named as the vision anchors.

Pipeline diagram (drafted verbatim for the README, satisfies AT-4):

```text
issue → /pickup → PR {spec + per-medium renderings} → blind review → human merge ─┬─▶ site (deploy-on-merge, automatic)
                                                                                   └─▶ social platforms (manual paste, human)
```

## plugin/.claude-plugin/plugin.json (verbatim)

```json
{
  "name": "gear",
  "version": "0.1.0",
  "description": "G.E.A.R. — Grounding · Experience · Authority · Reach. Dark-factory content pipeline: canonical content specs, per-medium renderers, blind-reviewed drafts, human-merged publishes."
}
```

No `commands`/`agents`/`skills`/`contracts` keys — zero components is correct for this issue (DEFINE #5); do not add fields beyond `name`/`version`/`description`.

## .gitignore (merged target — no duplicate lines)

```text
node_modules/
dist/
.DS_Store

# implement skill — throwaway synthesized design-input (never commit)
.claude/sdd/_synthesized/
```

The last two lines already exist (untracked, from the implement scaffold); build prepends the first three lines above them — do not duplicate the `_synthesized/` line.

## Testing (AT → file(s) → check command)

| AT | File(s) checked | Check command |
|----|------------------|----------------|
| AT-1 | all 6 | `test $(git ls-files CONSTITUTION.md GOAL.md README.md LICENSE plugin/.claude-plugin/plugin.json .gitignore \| wc -l) -eq 6 && python3 -m json.tool plugin/.claude-plugin/plugin.json >/dev/null` |
| AT-2 | CONSTITUTION.md | `test $(grep -c '^### ' CONSTITUTION.md) -eq 6 && test $(grep -c 'MUST' CONSTITUTION.md) -ge 6 && test $(wc -l < CONSTITUTION.md) -le 150` |
| AT-3 | GOAL.md | `test $(grep -c '^- \[ \]' GOAL.md) -eq 6 && test $(wc -l < GOAL.md) -le 60` |
| AT-4 | README.md | `grep -q 'Grounding' README.md && grep -q '/pickup' README.md && grep -q 'human merge' README.md` — plus a manual read: a zero-context reader must be able to say in one sentence that merging publishes |
| AT-5 | (repo-wide) | `git diff --name-only main...HEAD -- .github/workflows/ \| wc -l` → expect `0` |

## File Manifest

| File | Action | Purpose | Agent | Rationale |
|------|--------|---------|-------|-----------|
| `CONSTITUTION.md` | Create | 6 non-negotiable principles, MUST + rationale each | (general) | Docs-only; no content-repo specialist agent exists yet |
| `GOAL.md` | Create | P2 exit ledger, 6 unchecked boxes | (general) | Same |
| `README.md` | Rewrite | Replace placeholder; backronym + pipeline diagram + pointers | (general) | Same |
| `LICENSE` | Create | MIT, `Copyright (c) 2026 Future Gadgets AI` | (general) | Standard boilerplate, no further design needed |
| `plugin/.claude-plugin/plugin.json` | Create | Valid zero-component plugin manifest | (general) | Mirrors agentic-dev's plugin.json minimal-field style |
| `.gitignore` | Edit (merge) | Add `node_modules/`, `dist/`, `.DS_Store` to existing entry | (general) | File already exists untracked with one line — merge, don't duplicate |
