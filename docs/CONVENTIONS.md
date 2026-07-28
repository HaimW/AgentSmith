## Agentic Infra Conventions (Project Rules)

> `.claude/` and `CLAUDE.md` are **generated** from canonical source. Edit
> `agents/*.md`, `skills/*/SKILL.md`, and `domains/*/loop.md`, then run
> `node tools/generate.mjs`. Never hand-edit the generated folders.

### Naming

- **Agents (roles/workflows)**: lowercase kebab-case (e.g., `system-architect`)
- **Skills**: lowercase kebab-case directory name containing `SKILL.md` (e.g., `skills/api-design/SKILL.md`)
- **Domains**: snake_case directories under `domains/` (e.g., `backend_heavy`)

### Roles vs Skills

- **Roles** ("who"): defined once in `agents/<role>.md` with frontmatter
  (`name`, `description`, `domain`, `tools`, `model`, `skills`) + body. Generated
  into `.claude/agents/`.
- **Skills** ("how"): reusable playbooks under `skills/<skill>/SKILL.md`, shared
  across roles/domains. Generated into `.claude/skills/` verbatim.

### Architect Output Contract

Any "architect" agent (domain or cross-cutting) must keep reviews short and use:

- **Summary** (1–3 bullets)
- **Strengths** (0–5 bullets)
- **Risks** (3–7 bullets)
- **Recommendations** (3–7 bullets, concrete actions)

### Adding a New Role

1. Create `agents/<role-name>.md` with superset frontmatter and a body
   (Mission / Scope / When Invoked / Output Format).
2. Set `domain:` so it lands in the right `AGENTS.md`, and list its `skills`.
3. Choose least-privilege `tools` and an appropriate `model`.
4. Run `node tools/generate.mjs` and commit the regenerated folders.
