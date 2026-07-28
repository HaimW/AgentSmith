---
agent: security-architect
fixture: evals/fixtures/orders-api/orders.js
---

## Prompt

Security review of `evals/fixtures/orders-api/orders.js`, a public storefront
API handling customer orders and card payments.

## Must find

- /authoriz|IDOR|access control/i
- /injection/i
- /secret|credential|key/i
- /PII|personal data|payment (data|card)|PCI/i
- /(critical|high)/i

## Must not find

- /no security (issues|concerns|risks)/i
