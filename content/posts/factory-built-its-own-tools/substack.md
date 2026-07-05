*Originally published at https://future-gadgets-ai.github.io/gear/posts/factory-built-its-own-tools/.*

## TL;DR
- An autonomous development pipeline bootstrapped itself — each new tool's first execution was real production work, not a fixture.
- The composer's smoke test shipped a real feature; the work-selector was itself selected as work; the recommender declined to recommend itself.
- Tools that must survive their own production debut ship harder than tools proven on synthetic examples.
- The receipts are public pull requests with timestamps, not a demo reel.

## Three recursive moments from one build day

A pipeline that turns GitHub issues into reviewed pull requests has a bootstrap problem: the tools that run the line have to be built before the line exists to build them. The usual answer is fixtures — prove each tool on synthetic examples, then switch to real work.

This factory took the other route: every tool's first execution was production. One build day — 2026-07-04, all of it public — produced three recursive moments that show what that ordering buys.

## First: the smoke test that shipped a feature

The execution composer — the command that drives an issue from ready-label to reviewed pull request — needed a smoke test before its own pull request could open. A fixture run would have proven it can go through the motions.

Instead, its smoke test executed a real issue from the board: a cross-repo "what needs me" status digest that had been waiting eight days. The proof-of-life produced an actual feature's pull request. The composer merged at 16:06 UTC; the feature its smoke test had produced merged at 16:10, four minutes later. Two tools entered production in the time most teams spend naming a test file.

*A fixture proves the tool can go through the motions; a production debut proves it survives contact with the real board.*

## Second: the work-selector was selected as work

The next tool in the queue was a recommender — rank the board's ready issues and suggest what to pick up next. That issue was itself sitting on the board it would learn to rank. The freshly merged composer picked it up the same afternoon: one keystroke, an unattended run, a reviewed pull request 58 minutes later.

The selection problem selected the selection tool. There is no cleaner integration test for an issue-execution pipeline than executing the issue that improves how issues get executed.

## Third: the recommender declined to recommend itself

The best moment is the smallest. During the recommender's build, the verify gate ran it against the live board — and the output contained this line:

> "1 issue in flight (phase:in-progress): #25 … counts as WIP, not a candidate."

Issue #25 was the recommender itself, mid-execution at that moment. The refined spec would have let it recommend the very issue being executed — the run's verify gate caught the gap against live state, and the fix (in-flight work counts as WIP, never as a candidate, because "recommending work already being executed invites a double pickup") landed in the same run, logged in the pull request body as an autonomous decision.

On its first live run, the tool correctly refused to recommend itself. That's not a party trick — it's the direct product of verifying against reality instead of against the spec's own assumptions.

*On its first live run, the recommender's top candidate would have been itself — and the verify gate is why it wasn't.*

## Why dogfood-ordering compounds

Production-first bootstrap has a compounding property fixtures don't. Every tool that debuts on real work leaves two artifacts: the tool, and a real, reviewed unit of production the team keeps. The smoke tests aren't disposable — they're the changelog.

And the defects it surfaces are the ones that matter. A fixture is built from the author's model of the world, so it shares the author's blind spots — the same reason self-review underperforms an independent reviewer. The live board has no such loyalty. It handed the recommender an edge case (the tool's own issue, ready and in-flight simultaneously) on day one, because reality is denser with edge cases than imagination.

The ordering has a cost: your first production runs carry tool risk, so they need gates that execute — readiness checks before, verification and blind review after, a human holding the merge. With those gates in place, the factory's own history is its test suite.

## References

- The execution composer's PR, merged 2026-07-04 16:06 UTC, its smoke evidence naming the real issue it executed — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/61> (2026-07-05)
- The status-digest feature produced by that smoke test, merged 16:10 UTC the same day — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/60> (2026-07-05)
- The status-digest issue (waiting since 2026-06-26) — <https://github.com/Future-Gadgets-AI/agentic-dev/issues/34> (2026-07-05)
- The recommender issue, picked up by the composer the same afternoon — <https://github.com/Future-Gadgets-AI/agentic-dev/issues/25> (2026-07-05)
- The recommender's PR: the "counts as WIP, not a candidate" live-smoke line, the in-flight-exclusion decision, and the "double pickup" rationale — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/62> (2026-07-05)
- Independent-review-beats-self-review as the same principle behind fixture blind spots (the pipeline's blind-review record) — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/61> (2026-07-05)
