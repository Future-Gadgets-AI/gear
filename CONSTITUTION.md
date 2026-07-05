# Constitution — gear

Non-negotiable operating rules for gear's content pipeline — patterned on agentic-dev's sibling `CONSTITUTION.md`; gear inherits the dark-factory doctrine (issue is the spec, humans author and approve, the line runs autonomously) and applies it to published content instead of shipped code.

## Core Principles

### 1. The Spec Is the Artifact

- MUST: The canonical content spec MUST be the artifact of record for every post — per-medium renderings are derivations of it, never independent rewrites.
- Rationale: a rendering that drifts from its spec is unreviewable and uncitable the moment it leaves the repo.

### 2. Claims Carry Sources

- MUST: Every factual claim MUST carry a citation at draft time — a claim without a source row is review-blocking.
- Rationale: post-hoc fact-checking catches only ~38–54% of false claims in controlled studies ([Yao, Sun & Xue 2025, arXiv:2503.18293](https://arxiv.org/abs/2503.18293)); sourcing must happen before publish, not after.

### 3. Human Merge = Editorial Approval

- MUST: A post MUST NOT publish without a human's merge approval — manual paste to a social platform is the boundary an agent never crosses.
- Rationale: the merge is the one moment editorial judgment is exercised before words become a public, reputational commitment.

### 4. Voice Is a Contract, Not a Vibe

- MUST: Every rendering MUST conform to the versioned `voice.md` contract — a merge-time voice edit flows back as a diff, never as unwritten tribal knowledge.
- Rationale: an unversioned "sound like us" drifts per writer and per session; only a versioned file can be loaded by a renderer and diffed by a reviewer.

### 5. Identity Doctrine Inherited

- MUST: Every organizational write MUST run as the machine account, never a personal one — Administration is never bot-held, and any ambient admin step is marked and human-confirmed.
- Rationale: agentic-dev's Principle VII inherited unchanged — the same attribution discipline that governs a merged PR governs a published post.

### 6. Build in Public

- MUST: Every draft, review, and PR MUST remain part of the public trail — the citable evidence of how a post came to be.
- Rationale: the same "GitHub is the state store" logic as the code factory, applied to content.

## Governance

An amendment MUST be proposed as a normal documentation pull request against this file and MUST pass the same blind-review-plus-human-merge gate as any other change — no additional ratification ceremony beyond that.

---

**Version** 1.0.0 | **Ratified** 2026-07-04 | **Last Amended** 2026-07-04
