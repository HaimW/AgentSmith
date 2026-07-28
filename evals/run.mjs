#!/usr/bin/env node
// Eval runner for the AgentSmith swarm.
//
//   node evals/run.mjs                     run every case
//   node evals/run.mjs --case code-reviewer-idor
//   node evals/run.mjs --agent code-reviewer
//   node evals/run.mjs --command "<cmd>"   override how the agent is invoked
//   node evals/run.mjs --save baseline     record results for later comparison
//   node evals/run.mjs --compare baseline  diff against a saved run
//
// Scoring is deterministic: each case declares regexes that MUST appear in the
// agent's output (it found the seeded defect) and regexes that must NOT (it
// waved the code through). No LLM judge, so results are reproducible and free
// to interpret.
//
// The invoked command receives the prompt on stdin and must print the agent's
// response on stdout. Default assumes the Claude Code CLI in print mode.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CASES = join(ROOT, 'evals/cases');
const RESULTS = join(ROOT, 'evals/results');

// ---------- args ----------
const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? dflt : argv[i + 1];
};
const only = arg('case');
const onlyAgent = arg('agent');
const saveAs = arg('save');
const compareTo = arg('compare');
const COMMAND = arg('command', 'claude -p --permission-mode plan');

// ---------- parse cases ----------
function parseCase(file) {
  const raw = readFileSync(join(CASES, file), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const fm = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].trim();
  }
  const body = m[2];
  const section = (name) => {
    const re = new RegExp(`## ${name}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const s = body.match(re);
    return s ? s[1].trim() : '';
  };
  const patterns = (name) => section(name)
    .split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter((l) => l.startsWith('/'))
    .map((l) => {
      const last = l.lastIndexOf('/');
      return new RegExp(l.slice(1, last), l.slice(last + 1) || undefined);
    });
  return {
    name: file.replace(/\.md$/, ''),
    agent: fm.agent,
    prompt: section('Prompt'),
    mustFind: patterns('Must find'),
    mustNotFind: patterns('Must not find'),
  };
}

let cases = readdirSync(CASES).filter((f) => f.endsWith('.md')).map(parseCase);
if (only) cases = cases.filter((c) => c.name === only);
if (onlyAgent) cases = cases.filter((c) => c.agent === onlyAgent);
if (!cases.length) { console.error('No matching cases.'); process.exit(1); }

// ---------- run ----------
mkdirSync(RESULTS, { recursive: true });
const results = [];
console.log(`Running ${cases.length} case(s) with: ${COMMAND}\n`);

for (const c of cases) {
  const prompt = `Use the ${c.agent} agent.\n\n${c.prompt}`;
  let output = '', error = null;
  const started = Date.now();
  try {
    output = execSync(COMMAND, {
      input: prompt, encoding: 'utf8', cwd: ROOT,
      maxBuffer: 32 * 1024 * 1024, timeout: 10 * 60 * 1000,
    });
  } catch (e) {
    output = (e.stdout || '') + (e.stderr || '');
    error = e.message.split('\n')[0];
  }
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  const found = c.mustFind.map((re) => ({ re: String(re), hit: re.test(output) }));
  const violations = c.mustNotFind.map((re) => ({ re: String(re), hit: re.test(output) }));
  const hits = found.filter((f) => f.hit).length;
  const bad = violations.filter((v) => v.hit).length;
  const score = c.mustFind.length ? hits / c.mustFind.length : (bad ? 0 : 1);
  const pass = hits === c.mustFind.length && bad === 0;

  writeFileSync(join(RESULTS, `${c.name}.out.md`), output);
  results.push({ name: c.name, agent: c.agent, score, pass, hits,
                 total: c.mustFind.length, violations: bad, seconds, error });

  const mark = pass ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${c.name.padEnd(34)} ${hits}/${c.mustFind.length} found` +
              `${bad ? `, ${bad} violation(s)` : ''}  (${seconds}s)`);
  if (!pass) {
    for (const f of found.filter((f) => !f.hit)) console.log(`      missed:    ${f.re}`);
    for (const v of violations.filter((v) => v.hit)) console.log(`      violated:  ${v.re}`);
  }
  if (error) console.log(`      command error: ${error}`);
}

// ---------- summary ----------
const passed = results.filter((r) => r.pass).length;
const mean = (results.reduce((s, r) => s + r.score, 0) / results.length * 100).toFixed(0);
console.log(`\n${passed}/${results.length} cases passed · mean score ${mean}%`);
console.log(`Outputs written to evals/results/`);

if (saveAs) {
  writeFileSync(join(RESULTS, `${saveAs}.json`), JSON.stringify(results, null, 2) + '\n');
  console.log(`Saved as '${saveAs}'.`);
}

if (compareTo) {
  const file = join(RESULTS, `${compareTo}.json`);
  if (!existsSync(file)) { console.error(`No saved run '${compareTo}'.`); process.exit(1); }
  const base = JSON.parse(readFileSync(file, 'utf8'));
  console.log(`\nvs '${compareTo}':`);
  let moved = 0;
  for (const r of results) {
    const b = base.find((x) => x.name === r.name);
    if (!b || b.score === r.score) continue;
    moved++;
    const dir = r.score > b.score ? 'improved' : 'REGRESSED';
    console.log(`  ${dir}  ${r.name}: ${(b.score * 100).toFixed(0)}% -> ${(r.score * 100).toFixed(0)}%`);
  }
  if (!moved) console.log('  no change');
}

process.exit(results.every((r) => r.pass) ? 0 : 1);
