---
name: testing
description: Provides a reusable testing playbook: define risk-based test strategy, design test cases, interpret failures, and propose fixes. Use when planning tests, writing test plans, improving coverage, or investigating test failures across any domain.
---

# Testing

## Quick Start

When asked to “test” something:

1. Identify the **critical user journeys** and **highest-risk failure modes**.
2. Choose the right mix of test layers:
   - unit (fast, logic)
   - integration (DB/service interactions)
   - contract (API boundaries)
   - e2e (critical paths only)
   - non-functional (performance/reliability/security) when warranted
3. Define **acceptance criteria** for “done” (gates, required suites).
4. If failures exist, classify: deterministic bug vs flaky vs environment.

## Playbook

### Risk-Based Test Strategy

- Start from impact: data loss, security, downtime, payment, privacy.
- Cover: happy path, edge cases, and negative tests.
- Define what is manual/exploratory vs automated.

### Test Case Template

For each test case, include:

- **Purpose / risk**:
- **Preconditions / data**:
- **Steps**:
- **Expected result**:
- **Notes** (observability hooks, logs, metrics, screenshots):

### Interpreting Test Failures

- Capture: error message, stack trace/logs, reproduction steps.
- Localize: which layer failed (unit/integration/e2e) and why.
- Propose minimal fix plus a regression test.

## Output Expectations

When producing output:

- Provide either:
  - A test plan grouped by risk/flow, or
  - A small set of high-value test cases (with steps/expected results), or
  - A failure triage summary (root cause hypothesis + next steps).

