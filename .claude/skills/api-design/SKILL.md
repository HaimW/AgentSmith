---
name: api-design
description: Designing HTTP and event APIs that can survive contact with real consumers - resource modelling, error contracts, pagination, idempotency, and evolving without breaking anyone. Use when designing or changing an endpoint, a service boundary, an event schema, or any contract another team or client depends on.
---

# API Design

An API is the one part of a service you cannot refactor later. Internals are
cheap to change; a shipped contract is not. Spend your care here.

## Quick Start

1. **Start from consumer use cases**, not from your database tables. If a client
   needs three round-trips to render one screen, the design is wrong.
2. **Model resources and their lifecycle** — what exists, what state can it be in,
   what transitions are legal.
3. **Write the contract first**: paths, payloads, status codes, error shape. Show
   a real request and response for the main path and one failure.
4. **Decide the hard parts explicitly**: authz, pagination, idempotency, rate
   limiting, versioning.
5. **Ask what breaks a consumer** who wrote their client six months ago.

## Non-Negotiables

**Consistent error envelope.** One shape everywhere:

```json
{ "error": { "code": "insufficient_funds",
             "message": "Balance too low for this transfer.",
             "details": { "available": "12.40", "required": "50.00" },
             "traceId": "01H..." } }
```

`code` is a stable machine-readable string clients may branch on — never
renumber or repurpose it. `message` is for humans and may change freely.
Never leak stack traces, SQL, or internal hostnames.

**Status codes that mean what they say.** `400` malformed · `401` unauthenticated ·
`403` authenticated but not allowed · `404` absent *or hidden from this caller* ·
`409` state conflict · `422` semantically invalid · `429` rate limited (with
`Retry-After`) · `5xx` **our** fault, never the client's.

**Idempotency for anything that costs money or creates state.** Accept an
`Idempotency-Key` header, store the outcome against it, and return the original
result on replay. Clients *will* retry — assume every request may arrive twice.

**Cursor pagination, not offset.** Offset pagination skips and duplicates rows
when the underlying data changes mid-scan. Return an opaque `nextCursor`; never
let the client construct it. Always cap `limit`.

**Authorize on the server, per object.** "The UI hides the button" is not
authorization. Check ownership on every object you return or mutate — the classic
breach is `GET /orders/{id}` with someone else's id.

## Evolving Without Breaking

Safe (additive): new optional field · new endpoint · new optional parameter · new
enum value *if clients were told to tolerate unknowns*.

Breaking: removing or renaming a field · tightening validation · changing a type ·
changing status codes or error `code` values · making an optional field required ·
changing default behaviour.

**Expand → migrate → contract.** Add the new shape, support both, move consumers,
then remove the old — never in one step. Version in the path (`/v2/`) only for a
genuine redesign; for everything else, add fields. Deprecate with a date, a
`Deprecation` header, and a migration note; measure who is still calling before
you remove.

## Design Checklist

- [ ] Consumer use cases satisfied without chatty round-trips.
- [ ] Naming consistent: plural collections, nouns not verbs, one casing style.
- [ ] Every endpoint: authn *and* per-object authz.
- [ ] Consistent error envelope with stable `code`s.
- [ ] Pagination on every list. Capped `limit`.
- [ ] Idempotency on all non-safe operations that create or charge.
- [ ] Timeouts, and the client's retry story (backoff + jitter).
- [ ] Rate limits documented, with `Retry-After` on 429.
- [ ] Timestamps ISO-8601 UTC; money as decimal strings or minor units — **never
      floats**.
- [ ] Nothing sensitive in URLs (they land in logs and referrers).
- [ ] Evolution path stated; breaking changes have a migration plan.

## Events

Same discipline, extra rules: events are **facts that happened** (`OrderPlaced`,
past tense), carry a stable `id` for deduplication, and consumers must assume
**at-least-once delivery** — design handlers to be idempotent. Include a schema
version. Prefer thin events with ids over fat events that duplicate state and go
stale.

## Output Expectations

Endpoints or events with real sample payloads · the error cases and their codes ·
authz rules per operation · pagination/idempotency decisions · and an explicit
note on how this evolves and what would break a consumer.
