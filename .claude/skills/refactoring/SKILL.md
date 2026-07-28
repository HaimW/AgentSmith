---
name: refactoring
description: Playbook for changing code structure without changing behavior - establishing a safety net, applying known moves in small verified steps, and proving behavior was preserved. Use when cleaning up code, reducing duplication, or preparing a messy area for a new feature.
---

# Refactoring

## The Rule

Refactoring changes **structure**, never **behavior**. The moment you fix a bug,
add a feature, or change an error message, it stops being a refactor and needs its
own review. Found a bug mid-refactor? **Write it down, leave it, raise it separately.**

## Method

1. **Safety net first.** Run the existing tests for the target code and get a green
   baseline. If coverage is thin, write *characterization tests* that pin current
   behavior — including behavior that looks wrong. You are preserving it, not
   judging it.
2. **Understand before cutting.** Some awkwardness encodes a real constraint.
3. **Small steps, verified.** One move, run the tests, repeat. Many small verified
   moves beat one big unverified rewrite.
4. **Full suite at the end**, and report it.

If you cannot build a safety net, **stop and say so**. Refactoring without one is
rewriting and hoping.

## The Boring Moves (prefer these)

Extract function · extract variable · inline · rename · move to the right module ·
introduce parameter object · replace magic value with named constant · replace
conditional with polymorphism · guard clause to flatten nesting · split a class
doing two jobs.

## What to Hunt

- **Diverged duplication** — copies that have drifted apart. The dangerous kind.
- **Long functions doing several jobs**; deep nesting; long parameter lists.
- **Names that lie**, or that need a comment to be understood.
- **Feature envy** — a function using another module's data more than its own.
- **Primitive obsession** where a small type would carry the invariant.
- **Dead code**, unreachable branches, unused exports.

## Cautions

- Preserve public interfaces unless changing them is explicitly the task.
- Don't refactor and reformat in the same commit — the diff becomes unreviewable.
- Resist scope creep: the area next door is also messy, and that is fine for now.
- A big rename is cheap to do and expensive to review. Do it alone in its own commit.

## Output Expectations

Safety net (tests existing/added + green baseline) + each move with location and
rationale + before/after suite runs proving preservation + bugs found-but-not-fixed
+ follow-ups.
