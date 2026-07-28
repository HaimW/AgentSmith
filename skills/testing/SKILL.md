---
name: testing
description: Deciding what to test and at which layer, writing tests that fail for the right reason, and diagnosing failures. Use when adding tests, planning coverage for a change, fixing a flaky or failing suite, or judging whether a change is adequately tested.
---

# Testing

Tests exist to let you change code without fear. A test that never fails, or that
fails for reasons unrelated to correctness, is costing you more than it returns.

## Discovering the Commands

Never guess the test command. Run the helper:

```bash
node "$CLAUDE_SKILL_DIR/scripts/detect-commands.mjs"      # or: skills/testing/scripts/
```

It reads `package.json`, `Makefile`, `pyproject.toml`, `justfile`, `Cargo.toml`,
`go.mod`, and CI workflows and prints the real test / lint / typecheck / build
commands for the project.

## Choose the Layer Deliberately

| Layer | Use for | Keep it |
|---|---|---|
| **Unit** | Logic, branches, edge cases, pure functions | Many, fast, no I/O |
| **Integration** | Your code against a real DB, queue, or HTTP boundary | Some — where the bugs actually are |
| **Contract** | Agreement between a service and its consumers | One per contract |
| **End-to-end** | Critical user journeys only | Very few. They are slow and flaky by nature |

The common failure is inverting this: heavy mocking at the unit layer proving only
that the mocks were called, with nothing exercising the real seams. **If a test
mocks the thing it is supposed to verify, it tests nothing.**

## What to Test

Prioritize by cost of being wrong: money, data loss, security, privacy, then
everything else. For each unit of behaviour cover the **happy path**, the
**boundaries** (empty, one, many, max, one-past-max, negative, zero), the
**error paths** (dependency down, timeout, malformed input, unauthorized), and
**the invariant that must never break**.

Every bug fix gets a regression test that fails without the fix. No exceptions —
that test is the only thing standing between you and the same bug next quarter.

## Writing Tests That Earn Their Keep

- **Assert behaviour, not implementation.** Testing that a private method was
  called makes refactoring painful and proves nothing about correctness.
- **One reason to fail per test.** When it goes red you should know why from the
  name alone.
- **Arrange–Act–Assert**, in that order, visibly.
- **No logic in tests** — no loops or conditionals deciding what to assert. If the
  test needs logic, the thing under test is probably too complex.
- **Deterministic**: inject the clock, seed the randomness, never depend on test
  execution order or on a shared mutable fixture.
- **Real assertions.** `expect(result).toBeDefined()` passes for almost anything.

## Flakiness Is a Defect

A test that passes on retry is telling you about a real race, a leaked resource,
or a hidden dependency — usually one that also exists in production. Track it down
rather than re-running. Common sources: time and timezones, unawaited async work,
shared state between tests, test ordering, network calls, and animation timing in
UI tests.

**Never fix a red suite by weakening it** — deleting assertions, adding `skip`,
loosening a matcher, or widening a `catch`. If a test must be disabled, say so
explicitly and explain why.

## Judging Coverage

Coverage percentage measures lines executed, not behaviour verified — 100% line
coverage with weak assertions is theatre. Better questions: *Could I refactor this
module confidently? If I broke this on purpose, would a test catch it?* Uncovered
error-handling paths are the ones that matter most, because they are exactly what
nobody exercises manually.

## Output Expectations

A test plan grouped by risk, **or** the tests themselves, **or** a failure triage
(root cause hypothesis, evidence, next step) — plus what you deliberately did not
cover and why.
