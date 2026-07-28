# AgentSmith — an agentic AI engineering org (template)

AgentSmith is a **swarm of engineering subagents** plus reusable skills, modeled
on a senior engineering organization. You write each role once in one canonical
place, and AgentSmith generates the runnable **Claude Code** folders (`.claude/` +
`CLAUDE.md`). Drop it into any repo and personalize it to that project.

It provides:

- **Domains** with opinionated role sets (`web_app`, `backend_heavy`, `embedded`,
  `cross_cutting`).
- **Roles as runnable subagents** (PMs, architects, engineers, QA, DevOps) with
  least-privilege `tools` and per-role `model` selection.
- **Reusable skills / playbooks** (testing, API design, architecture review,
  CI/CD, security review, …).
- An **orchestrator** that runs a whole team on a task, and a **project-intake**
  agent that interviews you and tightens the swarm to your project.

## Single source of truth

Everything is generated from canonical, hand-edited source. **Never edit
`.claude/` by hand.**

```text
agents/<role>.md          # canonical role: frontmatter (tools/model/skills) + body
skills/<skill>/SKILL.md    # canonical reusable playbooks
domains/<domain>/loop.md   # canonical: domain summary + collaboration loop
tools/
  generate.mjs             # canonical -> .claude/ + CLAUDE.md   (zero deps)
  init.mjs                 # vendor the swarm into another repo
  sync.mjs                 # update a vendored copy from this upstream

# generated (committed for convenience, do not edit):
.claude/agents/  .claude/skills/
domains/<domain>/AGENTS.md
CLAUDE.md
```

Regenerate any time with:

```bash
node tools/generate.mjs      # or: npm run generate
```

The generator is idempotent — running it twice produces no diff.

## Starting a new project

### A. Brand-new repo (use this template)

1. On GitHub, click **Use this template** (or clone this repo).
2. `node tools/generate.mjs` to (re)build the generated folders.
3. Open in Claude Code and run the `project-intake` agent to personalize the
   swarm; then run `orchestrator` on your first task.

### B. Add the swarm to an existing repo

```bash
# from an AgentSmith checkout:
node tools/init.mjs /path/to/your-project
```

This vendors the canonical source into `your-project/.agentsmith/`, stamps the
upstream commit, and generates `.claude/` + `CLAUDE.md` at the project root.
Commit those, then run `project-intake`.

Pull upstream improvements later:

```bash
node .agentsmith/tools/sync.mjs           # add --dry-run to preview
```

`sync` updates files you haven't touched, and for files you have changed it
writes the upstream version alongside as `<file>.upstream` and reports a conflict
instead of clobbering your edits.

## Personalize per project (`project-intake`)

Run the `project-intake` agent once per project (re-run any time the stack
changes). It:

- interviews you (auto-detecting your stack from manifests first),
- writes `.agentsmith/profile.md` + `profile.json`,
- **prunes** domains/roles you don't use,
- **tunes** the surviving agents' `tools`/`model` and injects a short
  `## Project Context` block so every run is tight instead of generic.

## Running a team (`orchestrator`)

For any non-trivial change, invoke `orchestrator`. It picks the domain, runs the
collaboration loop (PM → design → engineering → **architecture review gate** →
QA → devops), dispatches to the specialists, and returns one consolidated plan.
For a targeted review, invoke a single specialist (e.g. `security-architect`).

## Extending the swarm

- **Add / edit a role:** edit `agents/<role>.md`, then `node tools/generate.mjs`.
- **Add a skill:** use the `skill-author` skill to scaffold
  `skills/<name>/SKILL.md`, then regenerate.
- **Add a domain:** create `domains/<domain>/loop.md` and set `domain:` on the
  roles that belong to it, then regenerate.
- **Add another tool (e.g. Cursor):** Claude Code is currently the only emit
  target. The canonical source is tool-neutral, so supporting another tool means
  adding one emit block in `tools/generate.mjs` (see the comment above the emit
  loop) — no changes to any agent or skill.

See [`docs/GETTING-STARTED.md`](docs/GETTING-STARTED.md) for a hands-on path to
learning and improving your swarm over time, and
[`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) for naming rules and the architect
output contract.

## Conventions

- **Agent / skill names:** lowercase kebab-case (`web-system-architect`).
- **Domains:** snake_case directories under `domains/`.
- **Architect roles** produce concise reviews: **Summary / Strengths / Risks /
  Recommendations**.

Full details in [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md).
