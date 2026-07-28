#!/usr/bin/env node
// Validate the canonical source before generating.
//   node tools/validate.mjs        (exit 1 on any error)
//
// Catches the failure modes that actually bite: broken skill references,
// duplicated sections, agents that can't do their job, and stale cross-references.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...a) => join(ROOT, ...a);

const errors = [];
const warnings = [];

// ---------- load ----------
const agentFiles = readdirSync(p('agents')).filter((f) => f.endsWith('.md'));
const skillNames = readdirSync(p('skills')).filter((s) => existsSync(p('skills', s, 'SKILL.md')));
const domainNames = readdirSync(p('domains')).filter((d) => existsSync(p('domains', d, 'loop.md')));

const agents = agentFiles.map((f) => {
  const raw = readFileSync(p('agents', f), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { errors.push(`${f}: missing or malformed frontmatter`); return null; }
  const fm = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].trim();
  }
  return { file: f, name: fm.name || f.replace(/\.md$/, ''), fm, body: m[2] };
}).filter(Boolean);

const agentNames = new Set(agents.map((a) => a.name));
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

for (const a of agents) {
  const id = a.file;

  // required fields
  if (!a.fm.name) errors.push(`${id}: missing 'name'`);
  if (!a.fm.description) errors.push(`${id}: missing 'description'`);
  if (a.fm.name && a.fm.name !== a.file.replace(/\.md$/, ''))
    errors.push(`${id}: 'name' (${a.fm.name}) does not match filename`);
  if (a.fm.name && !/^[a-z0-9-]+$/.test(a.fm.name))
    errors.push(`${id}: name must be lowercase kebab-case`);

  // description quality — it is the routing signal
  if (a.fm.description) {
    if (a.fm.description.length < 40)
      warnings.push(`${id}: description is very short; it drives delegation`);
    if (!/\buse\b/i.test(a.fm.description))
      warnings.push(`${id}: description should say WHEN to use the agent`);
  }

  // domain must exist
  if (a.fm.domain && !domainNames.includes(a.fm.domain))
    errors.push(`${id}: unknown domain '${a.fm.domain}'`);

  // every referenced skill must exist
  for (const s of list(a.fm.skills))
    if (!skillNames.includes(s)) errors.push(`${id}: references unknown skill '${s}'`);

  // duplicated sections (the bug that shipped once already)
  const heads = (a.body.match(/^## .*$/gm) || [])
    .filter((h) => !isFenced(a.body, h));
  const seen = new Set();
  for (const h of heads) {
    const k = h.toLowerCase();
    if (seen.has(k)) errors.push(`${id}: duplicated section '${h.trim()}'`);
    seen.add(k);
  }

  // capability sanity
  const tools = list(a.fm.tools);
  if (tools.length) {
    // must be able to spawn subagents if it says it dispatches them
    if (/\bdispatch(es|ing)?\b[^.]{0,40}\bsubagent|\bdispatch to\b|\bas a subagent\b/i.test(a.body)
        && !tools.includes('Task'))
      errors.push(`${id}: body says it dispatches subagents but 'tools' lacks Task`);
    // must be able to run commands if it says it runs them
    if (/\brun the (project'?s? )?(tests|suite|build)\b/i.test(a.body) && !tools.includes('Bash'))
      errors.push(`${id}: body says it runs commands but 'tools' lacks Bash`);
    // must be able to edit if it has an implement mode
    if (/## Two Modes|\bmake the change\b/i.test(a.body)
        && !tools.includes('Edit') && !tools.includes('Write'))
      errors.push(`${id}: body has an implement path but 'tools' has neither Edit nor Write`);
  }

  // cross-references to other agents must resolve
  for (const m of a.body.matchAll(/`([a-z][a-z0-9-]{3,})`/g)) {
    const ref = m[1];
    if (agentNames.has(ref) || skillNames.includes(ref) || domainNames.includes(ref)) continue;
    // ignore obvious non-agent tokens (files, commands, fields)
    if (/[./]|^(node|git|npm|true|false|main|sonnet|haiku|opus|status|path)$/.test(ref)) continue;
    if (/-(engineer|architect|manager|designer|reviewer|runner|writer|specialist|intake|review)$/.test(ref))
      errors.push(`${id}: references unknown agent '${ref}'`);
  }
}

function isFenced(body, heading) {
  const idx = body.indexOf(heading);
  if (idx === -1) return false;
  const before = body.slice(0, idx);
  return (before.match(/```/g) || []).length % 2 === 1;
}

// orphan skills are allowed (user-invoked), but say so
for (const s of skillNames) {
  const used = agents.some((a) => list(a.fm.skills).includes(s));
  if (!used) warnings.push(`skill '${s}' is not referenced by any agent (fine if user-invoked)`);
}

// ---------- report ----------
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(
  `\n${agents.length} agents, ${skillNames.length} skills, ${domainNames.length} domains — ` +
  `${errors.length} error(s), ${warnings.length} warning(s)`,
);
process.exit(errors.length ? 1 : 0);
