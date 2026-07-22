---
name: architecture-review
description: Provides a reusable architecture review playbook focusing on scalability, reliability, security, operability, and maintainability. Use when reviewing design docs, system plans, service boundaries, or major technical decisions.
---

# Architecture Review

## Quick Start

When reviewing a design:

1. Restate requirements and constraints (including NFRs).
2. Identify the main components, boundaries, and data flows.
3. Evaluate risks: reliability, security, performance, and operability.
4. Provide concise, actionable recommendations and missing pieces.

## Review Checklist (baseline)

- Requirements and constraints are explicit (functional + NFRs).
- Boundaries and ownership are clear (no ambiguous shared state).
- Failure modes are considered (timeouts, retries, degradation, rollback).
- Security posture is addressed (authn/authz, data classification, secrets).
- Observability is planned (logs/metrics/traces, alerting, runbooks).
- Performance and cost hotspots are identified.
- Evolution plan exists (versioning, migrations, deprecation).

## Output Expectations

When responding:

- Prefer bullets.
- Highlight top 3–7 risks.
- Provide concrete next steps and “good enough” mitigations.

