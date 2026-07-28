---
name: skill-author
description: Guides the agent through designing and scaffolding new Agent Skills (SKILL.md files) for this project. Use when you want to create, refine, or extend skills under skills/ with clear purpose, triggers, and structure.
---

# Skill Author

## Purpose

This skill helps design and create new Agent Skills for this project, keeping them:

- Focused on a clear **purpose** and **scope**.
- Discoverable via a good **description** and **trigger phrases**.
- Structured with concise instructions and optional references.

Use this whenever the user asks to:

- Create a new role-based agent (e.g., architect, SRE, data engineer).
- Capture a recurring workflow or checklist.
- Encode project-specific conventions or best practices.

## Workflow

Follow this workflow when creating a new skill:

### 1. Discovery

Clarify, using conversation (no need for a formal template unless requested):

- **Purpose**: What job is this skill supposed to do?
- **Scope**: What is explicitly in and out of scope?
- **Trigger scenarios**: How should the agent recognize when to use it?
- **Audience**: Is it role-focused (e.g., "senior data engineer") or workflow-focused (e.g., "incident-review")?
- **Output style**: Any preferred formats (tables, checklists, templates)?

Summarize these in 3–6 bullet points before designing the skill.

### 2. Design

Based on the discovery summary:

1. **Name** the skill:
   - Lowercase, hyphen-separated, max 64 chars.
   - Prefer `role-xyz` or `workflow-xyz` naming.
2. Draft a **description**:
   - One sentence that states WHAT the skill does.
   - One sentence that states WHEN to use it (with key trigger terms).
3. Decide which sections the SKILL.md needs, typically:
   - Responsibilities / Purpose
   - Operating Principles
   - When Applying This Skill
   - Checklists or Workflows
   - Output Expectations

Keep the whole file under ~500 lines.

### 3. Implementation

When implementing a new skill under `skills/<skill-name>/SKILL.md` (the
canonical source — `.claude/skills/` is generated from it):

- Use this template, adapting sections as needed:

```markdown
---
name: <skill-name>
description: <WHAT this skill does>. Use when <WHEN this should apply and trigger phrases>.
---

# <Title Case Name>

## Responsibilities

- Bullet list of what this role/workflow focuses on.

## Operating Principles

1. Short, opinionated guidelines that should shape decisions.

## When Applying This Skill

For <domain> tasks:

1. Clarify context (stack, constraints, goals).
2. Design or analyze the solution.
3. Address cross-cutting concerns.
4. Validate with tests/checks/metrics.

## Checklists

### <Checklist Name>

- [ ] Concrete, high-value checks.

## Output Expectations

When responding as this role:

- Bullet list of expectations (concrete examples, trade-offs, templates, etc.).
```

### 4. Verification

Before considering a skill "ready":

- [ ] `name` is valid (lowercase, hyphens, ≤ 64 chars).
- [ ] `description` states both WHAT and WHEN with clear trigger terms.
- [ ] Sections are concise and relevant (no generic filler text).
- [ ] No Windows-style paths in references (use `dir/file.ext`).
- [ ] The skill gives enough guidance to change behavior meaningfully vs. default agent.

If the user wants, present the skill draft for confirmation before writing it to disk.

## How to Use This Skill in Conversation

When the user asks for a new agent/role/workflow skill:

1. Apply the **Discovery** step and restate the summary back briefly.
2. Propose a **skill name** and **description**.
3. Draft the SKILL.md content using the template above, tuned to the context.
4. Create or update the file under `skills/<skill-name>/SKILL.md`, then run
   `node tools/generate.mjs` to regenerate `.claude/skills/`.
5. Tell the user how and when this new skill will be automatically applied.

