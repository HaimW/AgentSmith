# Getting Started — learn and perfect your swarm

This guide is a hands-on path for working with the AgentSmith swarm and improving
it as you go. It assumes you've read the [README](../README.md).

## Mental model

Three layers, each single-sourced:

| Layer | "Answers" | Lives in | Analogy |
|-------|-----------|----------|---------|
| **Agents** (`agents/*.md`) | *who* does the work | canonical → `.claude/agents` | job descriptions |
| **Skills** (`skills/*/SKILL.md`) | *how* a recurring task is done | canonical → `.claude/skills` | team playbooks |
| **Domains** (`domains/*/loop.md`) | *how a team collaborates* | canonical → `AGENTS.md` | org chart + process |

The **orchestrator** wires them together for a task; **project-intake** tailors
them to a project.

## Day 1 — run a real task

1. **Personalize:** run `project-intake`. Answer its questions honestly; it
   writes `.agentsmith/profile.md` and prunes/tunes the swarm.
2. **Run a team:** give `orchestrator` a one-line request (e.g. "add rate
   limiting to the public API"). Watch how it triages the size and routes it.
3. **Save the output.** Keep the consolidated plan — it's your baseline.

## Day 2+ — the improvement loop

This is the core habit. Each time an agent disappoints, fix the *source*, not the
one-off output:

1. **Vague or wrong-scope output?** Tighten that agent's `description` (controls
   when it triggers) and its `## Output Format` in `agents/<role>.md`.
2. **Agent reached for the wrong tools or was too slow/expensive?** Adjust its
   `tools` (least privilege) and `model` (lighter for reviewers/PMs, stronger for
   engineers/architects).
3. **You explained the same "how" twice?** Capture it as a **skill** (use the
   `skill-author` skill), not as prose in an agent. Skills are shared across
   roles and stay DRY.
4. **Regenerate & commit:** `npm run generate` (validates, then generates) then
   commit. In a vendored project, optionally promote the change back to the
   AgentSmith upstream so every project benefits.

`node tools/validate.mjs` runs on its own too. It catches the mistakes that
actually bite: an agent that says it dispatches subagents but lacks the `Task`
tool, a reference to a skill that doesn't exist, duplicated sections, and stale
cross-references between agents.

## Orchestration patterns (worth learning properly)

A pipeline is only one way to run a team. The `orchestrator` uses several, and
knowing the names helps you reason about what your swarm is doing.

| Pattern | What it is | When to reach for it |
|---------|-----------|----------------------|
| **Router** | Classify the request first, then send it down the smallest path | Always — it's why `orchestrator` triages trivial / standard / complex |
| **Sequential pipeline** | Fixed stage order, each feeding the next | The `embedded` loop, where staged V&V is genuine |
| **Parallel fan-out / fan-in** | Independent agents at once, then merge | Frontend ∥ backend proposals; architecture ∥ security review |
| **Evaluator–optimizer** | Produce → critique → revise, bounded | Failing tests and serious review findings — the loop that makes output good |
| **Hierarchical** | A lead delegates to other leads | Large work; needs the `Task` tool to dispatch |

Three rules that matter more than the names:

1. **Subagents don't share context.** Each one sees only what you pass in and
   returns only what it reports. That's why `orchestrator` keeps a task workspace
   at `.agentsmith/tasks/<slug>.md` — decisions live on disk, not in a context
   window that's about to disappear.
2. **A loop needs a brake.** Every revise cycle has a maximum (3) and an escalation
   path. Loops without stop conditions burn time and money.
3. **Match process to size.** Six agents on a typo is waste. The fast path exists
   so the heavy loop stays credible when you actually need it.
4. **Reviews advise; engineers decide.** For web and services work there is no
   approval committee — a reviewer surfaces risk, the implementing engineer owns
   the call. Only `embedded` keeps staged gates, because there they are real.

## Measure, don't guess

The habit that separates a swarm that improves from one that drifts:

```bash
node evals/run.mjs --save baseline     # before you touch an agent
# ... edit agents/<role>.md ...
node evals/run.mjs --compare baseline  # did it help? did it break something else?
```

Cases live in `evals/cases/` and score agents against fixtures containing
deliberately seeded defects, so results are objective. **Add a case every time an
agent disappoints you in real work** — that is what makes the suite worth having.
See [`evals/README.md`](../evals/README.md).

## The cross-cutting doers

Alongside the domain roles, five agents work on code rather than designs. These
are the ones you'll reach for daily:

- **`code-reviewer`** — reviews a real diff before you commit. Run it after any
  non-trivial change.
- **`debugger`** — root-causes a live failure and fixes the cause, not the symptom.
- **`test-runner`** — runs the suite and drives it back to green without weakening it.
- **`refactoring-specialist`** — restructures code while proving behavior is unchanged.
- **`technical-writer`** — READMEs, setup guides, ADRs, changelogs.

## Tuning frontmatter deliberately

```yaml
---
name: system-architect
description: <what + when — the trigger>   # sharper description = better routing
model: sonnet        # omit to inherit the strong default; set light for reviews
tools: Read, Grep, Glob, WebSearch         # read-only for reviewers; add Edit/Bash for implementers
skills: architecture-review, security-review
---
```

Guidelines that ship with this template:

- **Architects / PMs / QA / designers**: read-only tools, `model: sonnet`.
- **Engineers / platform / reliability**: read-write tools, inherit the strong model.
- **`orchestrator`** needs the `Task` tool — without it, it cannot dispatch anything.
- **Descriptions** should say both *what* the agent is for and *when* to use it —
  that text is what the runtime matches against.

## Writing a good skill

A skill changes behavior only if it's more specific than the default agent. Keep
each `SKILL.md`:

- focused on one job, with a `description` stating **what** and **when**;
- structured as a short playbook (checklist / template / steps);
- under ~500 lines, linking to `reference.md` for depth if needed.

## Adding a domain

1. `domains/<new_domain>/loop.md` with `title`, `summary`, `skills`, and the
   collaboration loop.
2. Add roles under `agents/` with `domain: <new_domain>`.
3. `node tools/generate.mjs` — the domain's `AGENTS.md` and the roster in
   `CLAUDE.md` update automatically.

## Keeping copies in sync

Each project owns an editable copy under `.agentsmith/`. When you improve the
upstream template, run `node .agentsmith/tools/sync.mjs` in a project to pull
updates; locally-edited files surface as `<file>.upstream` conflicts for you to
merge, so your per-project tuning is never silently overwritten.
