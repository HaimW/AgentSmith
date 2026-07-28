---
name: debugging
description: Systematic method for finding the root cause of a failure - reproduce, localize, hypothesize, confirm, fix minimally, add a regression test. Use when a test fails, an exception is thrown, a build breaks, or output is wrong and the cause is unknown.
---

# Debugging

## The Method

1. **Capture** the exact failure: full error, stack trace, and the command that
   produced it. Never work from a paraphrase.
2. **Reproduce** it yourself. An unreproduced bug is undiagnosed — if it won't
   reproduce, that fact is your first clue (ordering? state? environment?).
3. **Localize** — read the trace to the first frame in *this* codebase. Then check
   `git log` / `git diff`: recent changes are the highest-prior suspects.
4. **Hypothesize one thing at a time.** State it out loud, then test it. Changing
   several things at once destroys the signal.
5. **Confirm the mechanism** before fixing — you should be able to trace input →
   failure and explain it.
6. **Fix minimally**, at the layer where the cause actually lives.
7. **Add a regression test** that fails without the fix, passes with it.
8. **Clean up** temporary logging.

## Classify Before You Fix

| Type | Signal | Fix |
|------|--------|-----|
| **Deterministic bug** | Fails every run, same way | Fix the logic |
| **Flaky** | Passes on re-run | Find the nondeterminism (time, order, network, shared state) — this is a real defect |
| **Environment** | Works elsewhere | Missing dep/config/version; fix setup or document it |
| **Wrong test** | Code is right, test asserts the wrong thing | Fix the test, explain why |

## Anti-Patterns

- **Shotgun debugging** — changing things until it works. Leaves an unexplained
  system and usually a second bug.
- **Silencing symptoms** — widening a `catch`, bumping a timeout, adding a retry,
  loosening an assertion. Only legitimate when it genuinely *is* the fix; say why.
- **Fixing at the wrong layer** — patching the caller when the callee is broken.
- **Assuming the trace is the cause** — it's where the failure surfaced, which is
  often downstream of where it started.

## Useful Moves

- Bisect: `git bisect` for regressions; comment out halves to isolate.
- Narrow the input to the smallest case that still fails.
- Check the boundaries: empty, null, zero, one, max, unicode, concurrent.
- Diff the working case against the failing case — what actually differs?
- Read the error message literally. It is usually more precise than assumed.

## Output Expectations

Symptom + confirmed root cause at `path:line` + the evidence that proves it +
minimal fix + verification (before/after runs, regression test) + related risks.
