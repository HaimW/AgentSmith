---
name: log-analysis
description: Provides a reusable log and telemetry analysis playbook: triage incidents, infer root causes, and propose mitigations. Use when analyzing logs, metrics, traces, errors, outages, or flaky behavior across any domain.
---

# Log Analysis

## Quick Start

When given logs/metrics/traces:

1. Identify the **time window**, **scope**, and **impact**.
2. Correlate using request IDs, trace IDs, user/session IDs.
3. Look for changes: deployments, config flips, traffic shifts.
4. Form 2–3 hypotheses and test them against evidence.

## Playbook

### Triage Questions

- What changed recently?
- Is it localized (one endpoint/device/region) or global?
- Is it correlated with load or specific inputs?
- Is it a dependency failure (DB, queue, external API)?

### Evidence to Extract

- Primary error signatures and frequencies.
- Latency percentiles and saturation signals.
- Retry storms, timeouts, and back-pressure indicators.

## Output Expectations

When responding:

- **Impact**: what broke and who was affected.
- **Most likely root cause**: evidence-based.
- **Next checks**: what to verify to confirm.
- **Mitigations**: immediate (stabilize) and long-term (prevent).

