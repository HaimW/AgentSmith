## Backend-Heavy / Data-Intensive Domain Agents

This domain is for building **service and data platforms** (APIs, jobs, pipelines, warehouses, reliability, cost).

### Roles (agents)

- `platform-product-manager`: platform outcomes, roadmap, adoption, SLIs/SLOs expectations.
- `backend-system-architect`: service boundaries, integration patterns, data ownership; concise reviews.
- `backend-engineer-platform`: APIs/services/jobs, correctness, security, operations.
- `data-engineer`: pipelines/ETL/ELT, orchestration, data quality.
- `database-engineer`: schema/indexing/query plans/migrations/performance.
- `observability-reliability-engineer`: SLOs, instrumentation, incident patterns, load/rate limits.
- `qa-engineer-api`: API correctness, performance, reliability testing.
- `test-automation-engineer-api`: contract tests, integration suites, CI reliability.
- `devops-sre-engineer-platform`: infra, scaling, cost, deployments.

### Typical interactions (default “platform delivery loop”)

1. `platform-product-manager` defines problem, tenants/users, and success metrics.
2. `backend-engineer-platform` + `data-engineer` propose architecture and data flows.
3. `database-engineer` reviews schema/indexing and migration strategy early.
4. `backend-system-architect` reviews boundaries, ownership, resilience/latency tradeoffs.
5. `observability-reliability-engineer` defines SLIs/SLOs and instrumentation plan.
6. `qa-engineer-api` defines test strategy; `test-automation-engineer-api` implements contract/integration suites.
7. `devops-sre-engineer-platform` ensures environments, CI/CD, and cost controls.

### Key skills commonly used

- `api-design`, `architecture-review`, `testing`, `ci-cd`, `security-review`, `log-analysis`, `performance-tuning`

