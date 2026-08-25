#!/usr/bin/env node
// Generate the Claude Code folders from the canonical source.
//
//   agents/*.md            (canonical, hand-edited)
//   skills/*/SKILL.md      (canonical, hand-edited)
//   domains/*/loop.md      (canonical, hand-edited)
//        |
//        v   node tools/generate.mjs
//   .claude/agents/*  .claude/skills/*     (Claude Code)
//   domains/*/AGENTS.md                    (org-chart index)
//   CLAUDE.md                              (Claude Code entry point)
//
// Zero dependencies (Node >= 18 stdlib). Idempotent: running twice makes no diff.
import {
  readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync, existsSync,
  chmodSync,
} from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// SRC  = where the canonical source lives (parent of this tools/ dir).
// OUT  = where the generated folders (.claude/, CLAUDE.md) are written.
//        Same as SRC in this template repo. When the swarm is vendored into a
//        consumer repo under `.agentsmith/`, OUT is that repo's root so the
//        tools find their folders at the top level. Override with AGENTSMITH_OUT.
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.AGENTSMITH_OUT
  ? process.env.AGENTSMITH_OUT
  : basename(SRC) === '.agentsmith' ? dirname(SRC) : SRC;
// Path prefix used in generated docs: empty in the template repo, '.agentsmith/'
// when vendored, so CLAUDE.md points at where the canonical source actually is.
const SRCREL = SRC === OUT ? '' : `${relative(OUT, SRC)}/`;
const p = (...a) => join(SRC, ...a);       // read canonical source + write docs
const o = (...a) => join(OUT, ...a);       // write generated tool folders

// ---------- tiny frontmatter parser (scalars only) ----------
function parse(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: text.trim() };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].trim();
  }
  return { fm, body: m[2].trim() };
}
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

// ---------- load canonical agents ----------
const agents = readdirSync(p('agents'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { fm, body } = parse(readFileSync(p('agents', f), 'utf8'));
    return { file: f, name: fm.name || f.replace(/\.md$/, ''), fm, body };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// Append a generated "## Skills" section so each role lists the skills it uses.
function withSkills(body, fm) {
  const skills = list(fm.skills);
  if (!skills.length) return body;
  const sec = '## Skills\n\n' + skills.map((s) => `- \`${s}\``).join('\n');
  return `${body}\n\n${sec}`;
}

function frontmatter(pairs) {
  const lines = pairs.filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

// ---------- reset generated dirs ----------
for (const d of ['.claude/agents', '.claude/skills']) {
  rmSync(o(d), { recursive: true, force: true });
  mkdirSync(o(d), { recursive: true });
}

// ---------- emit agents ----------
// Claude Code is the only emit target. To add another tool (e.g. Cursor),
// add its dir to the reset loop above, write a second file here with whatever
// frontmatter that tool supports (Cursor: name + description only, no
// tools/model), and copy skills/ into its folder below.
for (const a of agents) {
  const body = withSkills(a.body, a.fm);

  // Claude Code: name, description, tools, model (documented fields).
  const claude = frontmatter([
    ['name', a.name],
    ['description', a.fm.description],
    ['tools', a.fm.tools],
    ['model', a.fm.model],
  ]) + '\n' + body + '\n';
  writeFileSync(o('.claude/agents', a.file), claude, 'utf8');
}

// ---------- copy skills verbatim (includes any scripts/ and reference.md) ----------
cpSync(p('skills'), o('.claude/skills'), { recursive: true });

// ---------- settings + hooks ----------
// Emitted only when absent, so a project's own hook config is never clobbered.
mkdirSync(o('.claude/hooks'), { recursive: true });
const hookSrc = p('templates/post-edit.sh');
if (existsSync(hookSrc)) {
  cpSync(hookSrc, o('.claude/hooks/post-edit.sh'));
  try { chmodSync(o('.claude/hooks/post-edit.sh'), 0o755); } catch { /* non-posix */ }
}
const settingsSrc = p('templates/settings.json');
if (existsSync(settingsSrc) && !existsSync(o('.claude/settings.json'))) {
  cpSync(settingsSrc, o('.claude/settings.json'));
}

// ---------- regenerate domain AGENTS.md indexes ----------
const domains = readdirSync(p('domains')).filter((d) => existsSync(p('domains', d, 'loop.md')));
for (const domain of domains) {
  const { fm, body } = parse(readFileSync(p('domains', domain, 'loop.md'), 'utf8'));
  const roles = agents.filter((a) => a.fm.domain === domain);
  const roleLines = roles.map((a) => `- \`${a.name}\`: ${a.fm.description}`).join('\n');
  const skills = list(fm.skills);
  const skillLine = skills.length ? `\n### Key skills commonly used\n\n${skills.map((s) => `\`${s}\``).join(', ')}\n` : '';
  const out =
`<!-- GENERATED by tools/generate.mjs from domains/${domain}/loop.md + agents/*.md. Do not edit by hand. -->

## ${fm.title || domain}

${fm.summary || ''}

### Roles (agents)

${roleLines}

${body}
${skillLine}`;
  writeFileSync(p('domains', domain, 'AGENTS.md'), out, 'utf8');
}

// ---------- generate CLAUDE.md ----------
const byDomain = {};
for (const a of agents) (byDomain[a.fm.domain] ||= []).push(a);
const domainOrder = ['web_app', 'backend_heavy', 'embedded', 'cross_cutting'];
const domainNames = Object.keys(byDomain).sort(
  (a, b) => (domainOrder.indexOf(a) + 1 || 99) - (domainOrder.indexOf(b) + 1 || 99),
);
const rosterBlocks = domainNames.map((d) => {
  const rows = byDomain[d].map((a) => `- \`${a.name}\` — ${a.fm.description}`).join('\n');
  return `### ${d}\n\n${rows}`;
}).join('\n\n');

const claudeMd = `<!-- GENERATED by tools/generate.mjs. Edit templates/canonical sources, not this file. -->

# AgentSmith Swarm

This project carries an AgentSmith agent swarm — a set of specialist subagents
plus reusable skills — under \`.claude/agents/\` and \`.claude/skills/\`.

## How to run a team

1. **Personalize first (once per project):** run the \`project-intake\` agent. It
   interviews you, writes \`.agentsmith/profile.md\`, and prunes/tunes the swarm to
   your stack.
2. **For any non-trivial change:** invoke the \`orchestrator\` agent. It triages the
   size, runs the domain's delivery flow, dispatches the specialists below, and
   keeps a shared task workspace under \`.agentsmith/tasks/\`.
3. **Day to day:** \`code-reviewer\` on a diff, \`debugger\` on a live failure,
   \`test-runner\` to get the suite green, \`security-architect\` for a targeted review.

Reviews are **advisory** — the implementing engineer decides and owns the result.

## Available agents

${rosterBlocks}

## Skills

Reusable playbooks live in \`.claude/skills/\`: ${
  readdirSync(p('skills')).filter((s) => existsSync(p('skills', s, 'SKILL.md'))).map((s) => `\`${s}\``).join(', ')
}.

## Editing the swarm

Do **not** edit \`.claude/\` by hand — it is generated. Edit the
canonical source in \`${SRCREL}agents/*.md\`, \`${SRCREL}skills/*/SKILL.md\`, and
\`${SRCREL}domains/*/loop.md\`, then run \`node ${SRCREL}tools/generate.mjs\`.
`;
writeFileSync(o('CLAUDE.md'), claudeMd, 'utf8');

console.log(`Generated ${agents.length} agents -> .claude/, ${domains.length} domain indexes, CLAUDE.md (out: ${OUT})`);
