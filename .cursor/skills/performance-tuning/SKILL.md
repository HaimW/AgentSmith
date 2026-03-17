---
name: performance-tuning
description: Provides a reusable performance tuning playbook: identify hotspots, profile, and propose improvements for latency, throughput, memory, and cost. Use when performance is a concern or when optimizing critical paths.
---

# Performance Tuning

## Quick Start

1. Define the performance goal (latency percentile, throughput, memory/power, cost).
2. Measure first (profilers, metrics, benchmarks); avoid guesswork.
3. Optimize biggest bottleneck; verify with before/after evidence.

## Common Levers

- Reduce work: caching, batching, avoid unnecessary calls.
- Reduce contention: concurrency model, pooling, async patterns.
- Reduce payloads: pagination, compression, selective fields.
- Database: indexes, query plans, denormalization where justified.

## Output Expectations

When responding:

- Provide:
  - hypothesis + expected impact,
  - measurement plan,
  - recommended changes (ranked),
  - verification approach.

