---
name: api-design
description: Provides a reusable API design playbook for REST/GraphQL/event-driven contracts, including schemas, errors, versioning, and idempotency. Use when designing APIs, BFFs, service interfaces, or contracts between components.
---

# API Design

## Quick Start

When designing an API:

1. Start from use cases and domain nouns (resources).
2. Define request/response schemas and a consistent error format.
3. Address: authn/authz, validation, pagination, idempotency, rate limits.
4. Plan for evolution: versioning and deprecation.

## Defaults

- **Errors**: structured `{ code, message, details, traceId }` (shape can vary by stack).
- **Pagination**: cursor-based for large datasets; stable sorting.
- **Mutations**: idempotency keys where retries are expected.

## Output Expectations

When responding:

- Provide:
  - endpoints (or operations/events),
  - sample payloads,
  - error cases and status codes,
  - notes on security and evolution.

