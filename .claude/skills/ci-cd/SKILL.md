---
name: ci-cd
description: Provides a reusable CI/CD playbook: pipeline stages, quality gates, caching, artifacts, and safe deployments. Use when setting up or improving CI/CD, release pipelines, or environment promotion workflows.
---

# CI/CD

## Quick Start

When designing CI/CD:

1. Define triggers (push/PR/tag/schedule) and required checks.
2. Split into stages: build → test → quality/security → package → deploy.
3. Optimize for fast feedback: caching and tiered test suites.
4. Make releases safe: canary/phased rollout and explicit rollback steps.

## Quality Gates

- Lint/type checks
- Unit tests
- Integration/contract tests as needed
- Security scans where appropriate

## Output Expectations

When responding:

- Provide a concrete pipeline outline (and config snippets if requested).
- Call out caching/artifacts and how failures become actionable.
- Include deploy safety: promotion steps, monitoring, rollback.

