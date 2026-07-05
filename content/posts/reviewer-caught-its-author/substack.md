*Originally published at https://future-gadgets-ai.github.io/gear/posts/reviewer-caught-its-author/.*

## TL;DR
- An AI agent encoded a governance rule and violated it in the same pull request; an independent AI reviewer caught the violation before merge.
- The catch repeated on a second constitution a day later — a pattern, not an anecdote.
- The mechanism is fresh context — the reviewer starts in its own clone and re-runs the test plan instead of trusting the author.
- Governance rules need a named enforcement surface; a MUST nobody checks is a wish.

## The same agent wrote the rule and broke it

On 2026-07-04, in a public repository, an AI agent shipped a pull request that encoded a project constitution into an autonomous workflow — including Principle IV, which requires every mid-flight failure to escalate visibly: a `status:needs-decision` label on the issue plus a reviewer-mentioning comment, so a stalled card surfaces on the board instead of dying quietly.

The same pull request contained a failure path that escalated by comment only. No label. The exact failure mode Principle IV exists to prevent, written by the agent that had just finished encoding Principle IV.

*The agent that encoded the escalation rule shipped, in the same pull request, the failure path that violated it.*

That's not a strange loop for its own sake. It's the ordinary shape of the problem: the author who just wrote a rule is the person least able to see themselves breaking it, because they're checking their intent, not their output. That holds for AI authors exactly as it holds for human ones.

## The catch came from fresh context

The pull request then hit the pipeline's blind-review gate: an independent AI reviewer with no memory of how the change was built, working in its own clone of the repository — not the author's working tree, not a forked conversation. It re-ran the test plan, walked the composer's failure paths against the constitution's text, and requested changes: the escalation path was missing the required label, leaving a comment-only route the constitution forbids.

The fix landed the same day, in commit `d74eca4`, whose message states the repair plainly: mid-flight failures now escalate per Principle IV — label plus bot comment — and "no comment-only path remains."

*Blind review works because the reviewer starts cold: no shared context with the author means no inherited blind spots.*

## Twice, actually

If this had happened once, it would be an anecdote. It happened again on the very next constitution the factory produced.

A sibling repository's constitution ratified a claims-carry-sources principle — every factual claim must cite a source at draft time. The blind reviewer of that pull request found that the constitution's own rationale carried an uncited statistic, violating the principle being ratified in the same document. The author's on-record response, fixing it, logged what had just happened: "the second time in this factory's history that the review gate caught a constitution's author violating the constitution being authored." The statistic now cites its controlled study.

Two constitutions, two authors, two same-document violations, two catches before merge. The review gate works on its own builders — which is the only kind of evidence a governance mechanism can offer about itself.

## Why this needs to be a separate agent

Self-review fails predictably: an author re-reading their own change re-runs their own reasoning and arrives at their own conclusion. The blind reviewer in this pipeline is constructed to make that impossible — fresh agent, fresh clone, and an obligation to execute the pull request's test plan rather than infer completion from the diff.

Across the repository's first four autonomous pull requests, that reviewer produced substantive findings on all four — including the constitutional catch above — while still approving what deserved approval. It isn't bulletproof, and the point isn't that it is. It's a second, independent read that costs minutes and has already outperformed the author's self-assessment every time it ran.

*A MUST nobody checks is a wish. Rules earn the word only when a named surface enforces them.*

## What transfers to your team

None of this depends on the agents being AI. Three properties made the catch happen, and all three are portable:

1. **Rules name their enforcement surface.** Principle IV doesn't say "escalate properly"; it says which label, which comment, mentioning whom. A rule you can't mechanically check is a preference.
2. **Review means re-running, not re-reading.** The reviewer executes the test plan and observes results. A diff read-through inherits the author's claims; an execution doesn't.
3. **The final gate doesn't move.** Every merge still requires a human's approving review, enforced by branch protection — the autonomous line accelerates the work between the gates, not through them.

The uncomfortable version of the lesson: if your governance document has never caught its own author, it probably hasn't been tested yet.

## References

- The pull request that encoded the constitution into the /pickup composer, and its review thread — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/61> (accessed 2026-07-05)
- Principle IV requires label + comment escalation; blind review must execute the test plan; human approval is enforced by branch protection — <https://github.com/Future-Gadgets-AI/agentic-dev/blob/main/CONSTITUTION.md> (accessed 2026-07-05)
- The fix commit and its "no comment-only path remains" repair message (d74eca4) — <https://github.com/Future-Gadgets-AI/agentic-dev/commit/d74eca4> (accessed 2026-07-05)
- Second catch: uncited statistic in a sibling constitution's own rationale, fixed by citing arXiv:2503.18293 — <https://github.com/Future-Gadgets-AI/gear/pull/11> (accessed 2026-07-05)
- The "second time in this factory's history" acknowledgment (author's on-record response to the blind review, same PR thread) — <https://github.com/Future-Gadgets-AI/gear/pull/11> (accessed 2026-07-05)
- Substantive blind-review findings on all four of the repository's first autonomous PRs (#59, #60, #61, #62) — <https://github.com/Future-Gadgets-AI/agentic-dev/pulls?q=is%3Apr+is%3Amerged> (accessed 2026-07-05)
- Blind reviews and fixes are visible end-to-end in public PR threads (worked example: PR #62, one keystroke to merged PR) — <https://github.com/Future-Gadgets-AI/agentic-dev/pull/62> (accessed 2026-07-05)
