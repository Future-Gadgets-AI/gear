# gear

G.E.A.R. — Grounding · Experience · Authority · Reach. Dark-factory content pipeline: canonical content specs, per-medium renderers, blind-reviewed drafts, human-merged publishes.

## Pipeline

```text
issue → /pickup → PR {spec + per-medium renderings} → blind review → human merge ─┬─▶ site (deploy-on-merge, automatic)
                                                                                   └─▶ social platforms (manual paste, human)
```

Merging the PR is the publish trigger: once a human approves and merges, the site deploys automatically. Publishing to social platforms stays a manual, human paste — an agent never crosses that boundary.

## What's Here

- [`CONSTITUTION.md`](CONSTITUTION.md) — non-negotiable operating principles (the vision anchor for *how*).
- [`GOAL.md`](GOAL.md) — the current-phase exit ledger (the vision anchor for *what, right now*).
- `plugin/contracts/` — canonical content rules: spec schema, voice contract, review rubric (upcoming — later issues).
- `plugin/skills/` — per-medium renderer skills (upcoming — later issues).
