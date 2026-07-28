---
agent: code-reviewer
fixture: none
---

## Prompt

Review this function. Report your findings.

```js
/** Return the number of days between two UTC dates, ignoring time of day. */
function daysBetween(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) {
    throw new TypeError('daysBetween expects two Date objects');
  }
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const utcA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const utcB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((utcB - utcA) / MS_PER_DAY);
}
```

## Must find

- /approve/i

## Must not find

- /critical/i
- /SQL injection/i
