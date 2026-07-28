---
name: code-review
description: Playbook for reviewing code that has been written - how to scope a diff, what to look for by severity, and how to write findings that get acted on. Use when reviewing a diff, a pull request, or freshly written code, or before committing.
---

# Code Review

## Quick Start

1. **Scope it.** `git diff`, `git diff --staged`, or `git diff <base>...HEAD`.
   Review a bounded change; if the diff is enormous, ask for it in pieces.
2. **Read the change in context** — open the surrounding code, not just the diff
   hunks. Locally-correct changes can be globally wrong.
3. **Pass in severity order**: correctness → security → tests → maintainability.
4. **Verify cheaply** — run the existing tests/type-check/lint if the commands are
   obvious. Reviewing without running is a guess.

## What to Look For

**Correctness** — edge cases (empty, null, zero, negative, huge, unicode), off-by-one
and boundaries, error paths not swallowed, resource cleanup on every path,
concurrency and shared mutable state.

**Security** — input validated at the trust boundary; injection (SQL, command,
template); output encoding for its sink; authz enforced server-side; secrets never
in code, logs, or errors.

**Tests** — new behavior covered; bug fixes carry a regression test; assertions test
behavior rather than restating the implementation.

**Maintainability** — matches this repo's existing conventions; no logic duplicated
from an existing helper; complexity justified; no dead code or debug output.

## Writing Findings That Land

- **Severity, not taste.** Separate defects from preferences. Never block on style
  the repo does not enforce.
- **Anchor every point** at `path:line`.
- **Show the corrected code** for anything Critical or Major.
- **Name the impact**: "throws when `items` is empty" beats "handle edge cases".
- Say when the change is good. Manufactured findings train people to ignore reviews.

## Severity Ladder

| Level | Meaning |
|-------|---------|
| **Critical** | Security hole, data loss, crash, corruption. Blocks merge. |
| **Major** | Real bug in a normal path, or a serious maintainability problem. |
| **Minor** | Nit, naming, small cleanup. Author's discretion. |

## Output Expectations

Verdict (approve / approve with nits / request changes) + findings grouped by
severity with locations and fixes + what you actually ran to verify.
