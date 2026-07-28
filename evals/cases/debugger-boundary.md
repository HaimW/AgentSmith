---
agent: debugger
fixture: evals/fixtures/cart/cart.js
---

## Prompt

A customer reports that a cart subtotalling exactly $100.00 receives no discount,
even though our pricing page promises 5% from $100. Find the cause in
`evals/fixtures/cart/cart.js`.

## Must find

- /off[- ]by[- ]one|boundary|`>` should be `>=`|greater than or equal|exclusive/i
- /discountFor/
- /subtotal > 100|>= 100/
- /regression test|add a test/i

## Must not find

- /cannot reproduce|unable to determine/i
