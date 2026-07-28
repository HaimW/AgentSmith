# Evals — measure the swarm instead of guessing

Without this, every change you make to an agent is a hunch. A tightened prompt
*feels* better; you have no idea whether it is. These evals give you a number.

## How it works

Each case in `cases/` points an agent at a task — usually a fixture in
`fixtures/` containing **deliberately seeded defects** — and declares regexes
that must appear in the output (it found the problem) and regexes that must not
(it waved the code through).

Scoring is **deterministic**: no LLM judge, so a run is reproducible, free to
interpret, and cannot flatter itself.

## Running

```bash
node evals/run.mjs                        # every case
node evals/run.mjs --case debugger-boundary
node evals/run.mjs --agent code-reviewer  # every case for one agent
```

By default each case is invoked with `claude -p --permission-mode plan`, with the
prompt on stdin. Override with `--command` for a different CLI or a mock.

Exit code is 0 only when every case passes, so this works in CI.

## The workflow that matters

```bash
node evals/run.mjs --save baseline        # before you change anything
# ... edit agents/<role>.md ...
node evals/run.mjs --compare baseline     # did it actually help?
```

`--compare` prints improvements and, more importantly, **regressions**. Sharpening
one agent's prompt often quietly degrades another case; this is how you notice.

Full agent outputs land in `evals/results/*.out.md`. Read them — the score tells
you *that* something is wrong, the output tells you *what*.

## Writing a case

```markdown
---
agent: code-reviewer
fixture: evals/fixtures/orders-api/orders.js
---

## Prompt
Review `evals/fixtures/orders-api/orders.js`. Report your findings.

## Must find
- /IDOR|ownership|object[- ]level/i
- /SQL injection|parameteri[sz]ed/i

## Must not find
- /LGTM|no issues found/i
```

Guidelines learned the hard way:

- **Seed a real defect and assert it is found.** That is objective. Asserting
  "the output is good" is not.
- **Write patterns with alternatives** (`/IDOR|ownership|access control/i`) so you
  measure whether the agent *found the problem*, not whether it used your vocabulary.
- **Always include a "must not find"** for the failure you actually fear — usually
  a confident all-clear.
- **Include at least one clean case** (`code-reviewer-clean`) so you catch the
  opposite failure: an agent that invents problems to look useful.
- Keep prompts plan-only where the agent could otherwise edit files.

## Current cases

| Case | Agent | Checks |
|---|---|---|
| `code-reviewer-security` | code-reviewer | Finds 6 seeded defects: IDOR, SQL injection, mass assignment, missing idempotency, hardcoded key, stack leak |
| `code-reviewer-clean` | code-reviewer | Approves correct code without inventing findings |
| `debugger-boundary` | debugger | Root-causes an off-by-one at a discount tier boundary |
| `api-design-pagination` | backend-engineer-web | Proposes cursor pagination with a capped limit |
| `security-review-authz` | security-architect | Classifies data and ranks authz/injection risk |
| `orchestrator-triage-small` | orchestrator | Routes a typo to the trivial path — does **not** convene a team |
| `orchestrator-triage-large` | orchestrator | Routes a multi-tenancy migration to the complex path with rollback |
| `technical-writer-setup` | technical-writer | Writes a setup guide with prerequisites and a verification step |

## Honest limits

- Regex matching detects **whether a topic was raised**, not whether the reasoning
  was correct. A high score is necessary, not sufficient — read the outputs.
- Eight cases is a starting point, not coverage. **Add a case every time an agent
  disappoints you in real work**; that is how this becomes valuable rather than
  decorative.
- Model runs vary between invocations. Treat a one-case swing as noise; trust the
  trend across the suite.
