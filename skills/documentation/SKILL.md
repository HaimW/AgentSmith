---
name: documentation
description: Playbook for writing docs people actually use - READMEs, setup guides, API references, ADRs, and changelogs. Use when documentation is missing or stale, or when a change alters how the system is used or operated.
---

# Documentation

## Quick Start

1. **Name the reader and their job.** First-time user? Integrator? On-call
   operator? Future maintainer? One doc, one primary reader.
2. **Read the code first.** Never document behavior you have not verified.
3. **Update what exists** rather than adding a competing file.
4. **Run every command and sample you wrote.** Untested docs rot immediately.

## Principles

- **Task first, architecture later.** "How do I run this locally" outranks a tour
  of the design. Common path up top; edge cases below.
- **Show, then explain.** A working example beats a paragraph describing one.
- **Every command runnable as written** — real paths, real flags, no placeholders
  unless clearly marked.
- **State prerequisites and versions.**
- **Document the edges**: what it does *not* do, known limits, gotchas.
- Active voice, short sentences. Cut "simply" and "just" — if it were simple, they
  wouldn't be reading.

## Templates

**README** — what it is → who it's for → install → quickstart → common tasks →
configuration → troubleshooting → links.

**Setup guide** — prerequisites → numbered steps → **a verification step that
proves it worked** → troubleshooting for the usual failures.

**API reference** — per endpoint/function: purpose, parameters (types, required,
defaults), return shape, error cases, one realistic example.

**ADR** — context/forces → decision → alternatives considered and why rejected →
consequences (good and bad). Immutable once accepted: supersede, don't rewrite.

**Changelog** — grouped by release, newest first. Call out breaking changes and
give the migration step.

## Smells

- Describes the implementation instead of the usage.
- Examples that were never run (wrong flags, stale paths).
- "See the code for details" — that is the thing the doc was supposed to spare them.
- Docs that duplicate a neighbouring doc and will drift apart.

## Output Expectations

Files written/updated with paths + the commands and samples you verified + what
remains undocumented and who can answer it.
