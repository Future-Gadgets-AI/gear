*Originally published at https://future-gadgets-ai.github.io/gear/posts/one-keystroke-anatomy/.*

## TL;DR
- A human typed one command; the pipeline re-checked readiness, branched, implemented, verified, opened a PR, and passed blind review unattended.
- Every timestamp is public — the whole run is provably under 100 minutes, and the human returned only to merge.
- The verify gate caught a real spec defect mid-run by touching live state, not by re-reading the diff.
- The unit of delegation is an issue that passes a readiness gate — not a prompt.

## The run, bounded by public timestamps

On 2026-07-04, a human typed `/pickup #25` into a terminal and walked away. Issue #25 — "recommend the next issue to pick up, given the board's state" — had been sitting on a public board since 2026-06-26, eight days earlier.

The timeline that follows is reconstructable by anyone: the tooling that executes these runs merged at 16:06 UTC. The pull request produced by the run appeared at 16:41. A human merged it at 17:39. Whatever happened in between — the entire autonomous leg — fits inside a window of under 100 minutes, bounded by timestamps GitHub stamped, not by anyone's claims.

*The whole autonomous run fits inside a public, verifiable 100-minute window — the human appears twice: one keystroke in, one merge out.*

What the keystroke bought: a readiness re-check against a written rubric, a branch, a design pass, a build pass, an executed verify gate, a draft pull request with captured evidence, and an independent blind review — with the human's judgment spent only at the two ends.

## Not a prompt — an issue that passed a gate

The command takes no free-form instructions. It takes an issue number, and it refuses to run unless the issue carries a `readiness:ready` label — a gate applied by a Definition-of-Ready rubric that grades verifiable outcome, bounded scope, interpretation convergence, and reachable context, keyed to blast radius rather than model confidence.

That inversion is the design's center: the human's authoring effort goes into a spec that any session can execute, instead of a prompt that one session interprets. The issue is the contract; the board is the state store; the run is a stateless worker.

## The gate that touched reality

Mid-run, the verify gate did the thing that makes it worth having. The feature under construction was a recommender — rank the board's ready issues and suggest the next pickup. The gate ran it against the live board and found that the top recommendation was issue #25 itself: the very issue being executed at that moment, still labeled ready while in progress.

The refined spec had missed it. Re-reading the diff would have missed it too — the code did exactly what the spec said. Executing against live state exposed the spec's gap, and the fix landed in the same run, logged as an autonomous decision in the pull request body: in-flight issues count as work-in-progress, never as candidates, because "recommending work already being executed invites a double pickup."

*The code did what the spec said — and executing it against live state is what revealed the spec was wrong.*

## The second cold read

Before the pull request reached the human, an independent reviewer with no memory of the build — fresh agent, fresh clone — re-ran the test plan and reviewed the diff on its own merits. On this repository's first four autonomous pull requests, that blind pass produced substantive findings all four times; this run was no exception, and the findings were fixed on the branch before the human ever looked.

The human's merge, 58 minutes after the pull request opened, was the only unautomated judgment in the chain — and the one the pipeline is built to protect, not replace.

## What the anatomy generalizes to

Three transferable parts, none of which require this specific stack:

1. **A readiness gate in front of autonomy.** Unattended execution starts only from specs that pass an explicit rubric — ambiguity gets bounced to a human before code exists, not discovered after.
2. **Verification that executes.** The gate runs the changed path against reality — live state, real fixtures — and captures transcripts. Diff-reading validates intentions; execution validates behavior.
3. **Fresh-context review before human review.** The blind pass costs minutes and catches what the author structurally cannot.

The keystroke is the demo. The gates are the product.

## References

- Issue #25 (the run's spec), created 2026-06-26, closed 2026-07-04 — <https://github.com/Future-Gadgets-AI/agentic-dev/issues/25> (2026-07-05)
- The run's pull request: created 16:41 UTC, merged 17:39 UTC, 2026-07-04 — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/62> (2026-07-05)
- The executing composer merged at 16:06 UTC the same day (lower bound for the run window) — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/61> (2026-07-05)
- The in-flight-exclusion catch and the "double pickup" rationale, logged as an autonomous decision in the PR body — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/62> (2026-07-05)
- The Definition-of-Ready rubric (verifiable outcome, bounded scope, convergence, reachable context, blast radius) — <https://github.com/Future-Gadgets-AI/agentic-dev/blob/main/plugin/contracts/dor-rubric.md> (2026-07-05)
- Substantive blind-review finding on PR #59 (REQUEST-CHANGES, fixed, re-review APPROVE) — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/59#issuecomment-4880375037> (2026-07-06)
- Substantive blind-review finding on PR #60 — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/60#issuecomment-4880688106> (2026-07-06)
- Substantive blind-review finding on PR #61 (the constitutional catch) — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/61#issuecomment-4880746119> (2026-07-06)
- Substantive blind-review finding on PR #62 — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/62#issuecomment-4883127128> (2026-07-06)
