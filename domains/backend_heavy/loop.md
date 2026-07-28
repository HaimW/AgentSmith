---
title: Backend-Heavy / Data-Intensive Domain Agents
summary: This domain is for building **service and data platforms** (APIs, jobs, pipelines, warehouses, reliability, cost).
skills: api-design, architecture-review, testing, ci-cd, security-review, log-analysis, performance-tuning
---

### Typical interactions (default "platform delivery loop")

1. `platform-product-manager` defines problem, tenants/users, and success metrics.
2. `backend-engineer-platform` + `data-engineer` propose architecture and data flows.
3. `database-engineer` reviews schema/indexing and migration strategy early.
4. `backend-system-architect` reviews boundaries, ownership, resilience/latency tradeoffs.
5. `observability-reliability-engineer` defines SLIs/SLOs and instrumentation plan.
6. `qa-engineer-api` defines test strategy; `test-automation-engineer-api` implements contract/integration suites.
7. `devops-sre-engineer-platform` ensures environments, CI/CD, and cost controls.
