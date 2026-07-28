# AgentSmith — an agentic AI engineering org (template)

AgentSmith is a **swarm of engineering subagents** plus reusable skills, modeled
on a senior engineering organization. You write each role once in one canonical
place, and AgentSmith generates the runnable **Claude Code** folders (`.claude/` +
`CLAUDE.md`). Drop it into any repo and personalize it to that project.

It provides:

- **Domains** with opinionated role sets (`web_app`, `backend_heavy`, `embedded`,
  `cross_cutting`). Web and services teams run as **continuous flow**; reviews
  advise rather than gate.
- **Roles as runnable subagents** (PMs, architects, engineers, QA, DevOps) with
  least-privilege `tools` and per-role `model` selection.
- **Reusable skills / playbooks** (testing, API design, architecture review,
  CI/CD, security review, …).
- An **orchestrator** that runs a whole team on a task, and a **project-intake**
  agent that interviews you and tightens the swarm to your project.
- **Evals** (`evals/`) so you can measure whether a change to an agent actually
  helped, instead of guessing.
- **Hooks + CI** that enforce the rules rather than merely stating them.

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
npm run generate             # validates, then generates
npm run validate             # checks only
npm run eval                 # score the agents against the golden tasks
```

The generator is idempotent — running it twice produces no diff. `validate` guards
the mistakes that actually break a swarm: an agent that claims to dispatch
subagents without the `Task` tool, references to skills that don't exist,
duplicated sections, and stale cross-references.

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

For any non-trivial change, invoke `orchestrator`. It **triages the size first**
(trivial work does not get a six-agent committee), opens a shared task workspace at
`.agentsmith/tasks/<slug>.md` so context survives between subagents, runs the
domain's delivery flow, and drives a bounded verify-and-revise loop until the work
is actually verified. Reviews are **advisory** — the implementing engineer decides
and owns the result. For a targeted review, invoke a single specialist (e.g.
`security-architect`).

Five cross-cutting agents work on code rather than designs, and are the ones you
reach for daily: `code-reviewer` (reviews a real diff), `debugger` (root-causes a
live failure), `test-runner` (drives a red suite to green), `refactoring-specialist`,
and `technical-writer`.

## Measuring changes (`evals/`)

Tuning an agent by feel is how swarms rot. `evals/` holds golden tasks scored
against fixtures with **deliberately seeded defects**, so a change is measured:

```bash
node evals/run.mjs --save baseline    # before editing an agent
node evals/run.mjs --compare baseline # after — improvements and regressions
```

See [`evals/README.md`](evals/README.md).

Engineer agents have **two modes**: plan (design only, no edits) and implement
(make the change, run the project's checks, report the diff and the evidence).

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

- **Agent / skill names:** lowercase kebab-case (`system-architect`).
- **Domains:** snake_case directories under `domains/`.
- **Architect roles** produce concise reviews: **Summary / Strengths / Risks /
  Recommendations**.

Full details in [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md).
