---
title: Services & Data Domain
summary: Building and operating **services and data systems** (APIs, jobs, pipelines, stores, reliability, cost). One cross-functional team working in continuous small batches with reversible changes.
skills: api-design, testing, security-review, performance-tuning, ci-cd
---

### How this team works

Continuous flow. Services are long-lived and hard to un-ship, so the discipline
here is **reversibility**: contracts that can evolve, migrations that can roll
back, and changes small enough to reason about.

1. **Frame it** — `product-manager` states the problem, the consumers, and testable
   acceptance criteria. Skip when the change is small and clear.
2. **Settle the contract early** — `backend-engineer-platform` defines the API or
   event shape before building behind it. Contract changes are the expensive kind;
   get `system-architect` advice while it is still cheap.
3. **Build it** — `backend-engineer-platform`, with `data-engineer` for pipelines
   and `database-engineer` for schema, indexing, and **migration plus rollback**.
   Engineers write their own tests as part of the change.
4. **Review it** — `code-reviewer` on the diff; `security-architect` whenever auth,
   PII, payments, or external exposure is involved. Advisory, not blocking.
5. **Make it observable** — `reliability-engineer` defines SLIs/SLOs and the
   instrumentation *before* it carries real traffic, not after the first incident.
6. **Verify and ship** — `test-runner` for the suite, `qa-engineer` when being
   wrong is expensive, `platform-engineer` for the pipeline and safe rollout.

### Principles

- **Contracts are forever; internals are not.** Spend review attention on the
  interface, not the implementation behind it.
- **Every migration needs a rollback**, and should be expand-then-contract so the
  old and new shapes coexist during the change.
- **Backfills are a first-class design problem**, not an afterthought.
- **Instrument before launch.** If you cannot say how you would detect a failure,
  it is not ready.
- **Reviews advise; the implementing engineer decides** and owns the result.
