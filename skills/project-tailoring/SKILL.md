---
name: project-tailoring
description: Playbook for personalizing the AgentSmith swarm to a specific project - a question bank plus rules for pruning and tuning agents/skills from the answers. Use when running the project-intake agent, onboarding the swarm into a repo, or re-tightening it after the stack changes.
---

# Project Tailoring

## Purpose

Take a generic swarm and make it fit one project: decide which domains/roles are
in play, capture the stack and constraints once, and push that context into the
agents and skills so every future run is tight instead of generic.

## Question Bank

Ask only what the repo can't already tell you. **First auto-detect** from
manifests (`package.json`, `pyproject.toml`/`requirements.txt`, `Cargo.toml`,
`go.mod`, `pom.xml`, `platformio.ini`, `Dockerfile`, `.github/workflows/*`) and
present findings as defaults to confirm.

Group the questions; batch them:

1. **Domain(s)** — Which apply: `web_app`, `backend_heavy`, `embedded`,
   `cross_cutting`-only? (drives pruning)
2. **Language & stack** — Primary language(s), framework(s), and versions.
3. **Runtime / deploy target** — e.g. Vercel, AWS ECS, k8s, bare metal, MCU
   family/RTOS.
4. **Data stores** — DBs, caches, queues, warehouses (or "none").
5. **Team & review norms** — Solo or team? PR reviews required? Trunk-based?
6. **Testing maturity** — What exists today (unit/integration/e2e/none) and the
   bar for "done".
7. **CI/CD** — System in use (GitHub Actions, GitLab CI, none) and deploy cadence.
8. **Performance / reliability budgets** — Latency/throughput/uptime targets, or
   "best effort".
9. **Security & compliance** — Handles PII/payments/health data? Auth model?
   Regulatory constraints (SOC2, HIPAA, safety certs)?
10. **Conventions & non-goals** — Style guide, forbidden patterns, and things
    the project explicitly will NOT do.

## Tailoring Rules

### Pruning (which agents to remove)

- Keep every agent whose `domain` is in the confirmed domain set.
- **Always keep** `cross_cutting`, `orchestrator`, and `project-intake`.
- Drop `ux-ui-designer` and `frontend-engineer` if there is no UI.
- Drop `data-engineer` / `database-engineer` if "none" for data stores.
- Drop `security-architect` only if the user explicitly declines it; otherwise
  keep it whenever auth/PII/payments/exposure exist.
- Removing an agent means deleting it from `.claude/agents/` and `agents/`
  (canonical), so it stays gone after a regenerate.

### Frontmatter tuning

- `model`: use a lighter model (`sonnet`/`haiku`) for reviewers, PMs, designers,
  and QA; leave engineers/architects to inherit the strong default.
- `tools`: narrow to what the stack needs — drop `Bash` from pure-review agents;
  add nothing an agent doesn't use. Least privilege wins.
- `skills`: remove skill references the project doesn't use (e.g. drop
  `performance-tuning` if budgets are "best effort").

### Project-context injection

Prepend (or replace) a `## Project Context` block at the top of each kept
agent's body and each project-specific skill:

```markdown
## Project Context

- Stack: <language/framework/versions>
- Runtime: <deploy target>
- Data: <stores or "none">
- Conventions: <style, required checks>
- Constraints: <perf/security/compliance>
- Non-goals: <explicitly out of scope>
```

Keep it ≤ 12 lines. On re-run, replace the existing block, never stack a second.

## The Profile Artifact

Write both:

- `.agentsmith/profile.md` — the block above plus the full Q&A, human-readable.
- `.agentsmith/profile.json` — every answer as structured fields, so a future
  `project-intake` run loads them as defaults.

## Output Expectations

- A confirmed profile written to `.agentsmith/`.
- A concrete diff summary: which agents were removed, which were tuned and how.
- Idempotent: running twice with the same answers produces no further changes.
