## Agentic Infra Conventions (Project Rules)

### Naming

- **Agents (roles/workflows)**: lowercase kebab-case (e.g., `backend-system-architect`)
- **Skills**: lowercase kebab-case directory name containing `SKILL.md` (e.g., `.cursor/skills/api-design/SKILL.md`)
- **Domains**: snake_case directories under `domains/` (e.g., `backend_heavy`)

### Roles vs Skills

- **Roles** (“who”): live as runnable subagents in `.cursor/agents/` and as human-readable templates under `domains/<domain>/roles/`.
- **Skills** (“how”): reusable playbooks under `.cursor/skills/` intended to be shared across roles/domains.

### Architect Output Contract

Any “architect” agent (domain or cross-cutting) must keep reviews short and use:

- **Summary** (1–3 bullets)
- **Strengths** (0–5 bullets)
- **Risks** (3–7 bullets)
- **Recommendations** (3–7 bullets, concrete actions)

### Adding a New Role

1. Add a template under `domains/<domain>/roles/<role-name>.md`
2. Add a runnable subagent under `.cursor/agents/<role-name>.md`
3. Reference skills the role should commonly use

