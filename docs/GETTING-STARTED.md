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
   limiting to the public API"). Watch how it sequences roles and gates on the
   architecture review.
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
4. **Regenerate & commit:** `node tools/generate.mjs` then commit. In a vendored
   project, optionally promote the change back to the AgentSmith upstream so every
   project benefits.

## Tuning frontmatter deliberately

```yaml
---
name: web-system-architect
description: <what + when — the trigger>   # sharper description = better routing
model: sonnet        # omit to inherit the strong default; set light for reviews
tools: Read, Grep, Glob, WebSearch         # read-only for reviewers; add Edit/Bash for implementers
skills: architecture-review, security-review
---
```

Guidelines that ship with this template:

- **Architects / PMs / QA / designers**: read-only tools, `model: sonnet`.
- **Engineers / DevOps / test-automation**: read-write tools, inherit the strong
  model.
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
