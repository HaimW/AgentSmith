---
name: security-review
description: Provides a reusable security review playbook: threat modeling, data classification, authn/authz, secrets, and abuse cases. Use when reviewing designs, APIs, deployments, or when security risks are likely.
---

# Security Review

## Quick Start

1. Identify sensitive assets (PII, secrets, financial data).
2. Define trust boundaries and attacker goals.
3. Review authn/authz, input validation, and secrets handling.
4. Consider abuse cases: rate limits, replay, brute force, injection.

## Baseline Checklist

- Data classification is explicit; least privilege is applied.
- Secrets are managed (no plaintext in code/logs; rotation plan).
- Encryption in transit; at rest where applicable.
- Authn/authz boundaries are explicit and tested.
- Logging avoids leaking secrets/PII; audit needs addressed.

## Output Expectations

When responding:

- List top risks and concrete mitigations.
- Note assumptions and any “must-have” guardrails before launch.

