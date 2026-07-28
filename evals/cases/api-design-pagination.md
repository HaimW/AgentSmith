---
agent: backend-engineer-web
fixture: evals/fixtures/orders-api/orders.js
---

## Prompt

Plan only, do not edit files. The `GET /orders` endpoint in
`evals/fixtures/orders-api/orders.js` uses offset pagination with an uncapped
limit. Propose a better design for this list endpoint.

## Must find

- /cursor/i
- /cap|maximum|max limit|clamp/i
- /(skip|miss|duplicate|shift).{0,40}(row|record|item|page)|unstable/i
- /opaque/i

## Must not find

- /offset is fine|keep offset pagination/i
