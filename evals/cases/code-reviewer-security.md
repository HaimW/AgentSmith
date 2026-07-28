---
agent: code-reviewer
fixture: evals/fixtures/orders-api/orders.js
---

## Prompt

Review `evals/fixtures/orders-api/orders.js`. It is a new file in a storefront
API. Report your findings.

## Must find

- /IDOR|object[- ]level|ownership|belongs to|any (logged[- ]in |authenticated )?user (can|could)/i
- /SQL injection|parameteri[sz]ed|string interpolation into (the )?quer/i
- /mass assignment|allowlist|spread.*body|`\.\.\.req\.body`|user can set/i
- /idempoten/i
- /sk_live|hardcoded (secret|key|credential)|secret in (the )?source|rotate/i
- /stack|internal (details|error)|leak/i
- /critical/i

## Must not find

- /looks good to me|no (significant )?issues found|LGTM/i
