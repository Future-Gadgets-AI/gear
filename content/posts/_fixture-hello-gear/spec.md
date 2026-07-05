---
title: "Fixture: Hello Gear"
slug: _fixture-hello-gear
date: 2026-07-04
status: draft
tags: [fixture]
audience: engineers
canonical_url: https://example.com/p/_fixture-hello-gear
translation_of: _fixture-source-post
tl_dr:
  - This is a fixture post used only to verify the renderer skills, not real content.
  - Fixture posts stay status draft forever, so the site's draft gate excludes them from publish.
  - Each render skill runs against this fixture before it ever runs against a real post.
---
## TL;DR
- This is a fixture post used only to verify the renderer skills, not real content.
- Fixture posts stay status draft forever, so the site's draft gate excludes them from publish.
- Each render skill runs against this fixture before it ever runs against a real post.
## Why a fixture exists
A renderer only ever tested against real posts has never been tested against a stable input — this fixture is that stable input: fabricated, never published, safe to keep committed.
> **pull-quote:** A fixture that never publishes is still worth committing if every renderer depends on it.
## What this fixture proves
Passing all four render skills against this one file is the whole verify gate for issue #4 — no real post is needed to prove the renderers work end to end.
> **pull-quote:** One committed fixture exercises all 4 renderers — the verify gate runs against it, not against a promise.
## Claims & Sources
| claim | source URL | date accessed |
|---|---|---|
| Fixture data is standard practice for testing data pipelines | https://example.com/fixture-testing | 2026-07-01 |
| Astro validates a collection's schema at load, before any query-time filter runs | https://example.com/astro-draft-gate | 2026-07-02 |
| A renderer fixture should never depend on network access | https://example.com/offline-fixtures | 2026-07-03 |
