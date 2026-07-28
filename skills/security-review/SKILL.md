---
name: security-review
description: Threat modelling and security review for web apps and services - trust boundaries, authz, injection, secrets, and the abuse cases attackers actually use. Use when reviewing a design or diff that touches auth, user data, payments, file handling, or anything reachable from the internet.
---

# Security Review

Most real breaches are not exotic. They are missing authorization checks,
injection through a path nobody validated, and secrets that leaked into a log.
Look there first.

## Quick Start

1. **Name the assets.** What would an attacker want — credentials, PII, money,
   compute, availability, or just embarrassment?
2. **Draw the trust boundaries.** Every place data crosses from less-trusted to
   more-trusted is a place to validate. The browser is never trusted.
3. **Walk the attacker's path**, not the happy path. How would *you* abuse this?
4. **Check the list below**, then rank findings by real impact, not by CVSS vibes.

## The Ones That Actually Bite

**Broken object-level authorization (IDOR).** The single most common serious web
vulnerability. `GET /api/orders/1234` — does the code verify *this user* owns
order 1234, or does it just fetch by id? Check **every** endpoint that takes an id.
Do the same for update and delete, and for nested resources.

**Broken function-level authorization.** Admin endpoints protected only by the UI
not showing them. Roles checked in the client. A `role` field the user can set.

**Injection.** SQL (use parameterized queries — never string concatenation, and
never for the table/column name either), command injection, template injection,
NoSQL operator injection (`{"$gt": ""}` as a password), and path traversal
(`../../etc/passwd`) in any filename you accept.

**XSS.** Any untrusted string rendered into HTML. Framework auto-escaping helps
until someone reaches for `dangerouslySetInnerHTML` / `v-html` / `|safe`. Watch
`javascript:` URLs, `<img onerror>`, and Markdown renderers. Set a CSP.

**Secrets in the wrong place.** Committed to git (check history, not just HEAD),
printed in logs or error responses, baked into client bundles, sitting in
`.env.example` as real values, or passed as command-line arguments.

**SSRF.** Any feature that fetches a URL the user supplied — webhooks, avatar
imports, PDF renderers, link previews. Attackers point it at internal services and
cloud metadata endpoints. Allowlist destinations; block private ranges *after*
DNS resolution.

**Mass assignment.** Binding a request body straight onto a model, letting a user
set `isAdmin`, `accountId`, or `credits`. Allowlist writable fields.

**Auth session handling.** Tokens that never expire, no revocation, JWTs trusted
without signature verification (or with `alg: none`), session fixation, missing
`HttpOnly`/`Secure`/`SameSite` on cookies.

## Review Checklist

- [ ] **Data classified** — what here is PII, credentials, payment, or regulated?
- [ ] **Trust boundaries explicit**; all input validated server-side at each one.
- [ ] **Authorization checked per object**, on read *and* write, on every endpoint.
- [ ] **Parameterized queries** everywhere; no string-built SQL.
- [ ] **Output encoded** for its sink (HTML, SQL, shell, URL, log).
- [ ] **Secrets** from environment/vault only; never logged, never in the bundle.
- [ ] **Transport**: TLS enforced; HSTS; no mixed content.
- [ ] **At rest**: sensitive fields encrypted; passwords hashed with bcrypt/argon2
      (never SHA-family alone).
- [ ] **Rate limiting** on auth, password reset, and anything expensive.
- [ ] **File uploads**: type and size validated, stored outside the web root,
      served with a safe `Content-Type`, never executed.
- [ ] **Dependencies**: no known-vulnerable versions; lockfile committed.
- [ ] **Errors** reveal nothing internal; logs capture enough to investigate.
- [ ] **Audit trail** for security-relevant actions, without logging the secrets.

## Ranking Findings

| Severity | Test |
|---|---|
| **Critical** | Remote data theft, auth bypass, RCE, or money movement. Fix before merge. |
| **High** | Requires some precondition but leads to the above. |
| **Medium** | Real weakness, limited blast radius or needs an unlikely chain. |
| **Low / hardening** | Defense in depth. Worth doing, not worth blocking on. |

Be specific about exploitability. "User A can read User B's invoices via
`GET /invoices/{id}`" is actionable; "improve access control" is not.

## Output Expectations

Assets and trust boundaries · findings ranked by real impact, each with the
concrete attack and a fix at `path:line` · and an explicit statement of what you
did **not** review, so nobody mistakes the scope.
