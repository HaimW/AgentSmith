#!/usr/bin/env node
// Print the project's real test / lint / typecheck / build commands.
// Deterministic discovery beats the model guessing `npm test` and being wrong.
//
//   node detect-commands.mjs [projectDir]
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = process.argv[2] || process.cwd();
const found = [];        // {kind, command, source}
const read = (f) => { try { return readFileSync(join(DIR, f), 'utf8'); } catch { return null; } };

const KINDS = [
  ['test',      /^(test|tests|test:unit|unit|spec|jest|vitest|pytest)$/i],
  ['typecheck', /^(typecheck|type-check|tsc|types)$/i],
  ['lint',      /^(lint|eslint|ruff|flake8|clippy)$/i],
  ['format',    /^(format|fmt|prettier)$/i],
  ['build',     /^(build|compile)$/i],
  ['e2e',       /^(e2e|test:e2e|playwright|cypress)$/i],
];
const classify = (name) => (KINDS.find(([, re]) => re.test(name)) || [])[0];

// ---- Node ----
const pkgRaw = read('package.json');
if (pkgRaw) {
  try {
    const pkg = JSON.parse(pkgRaw);
    const pm = existsSync(join(DIR, 'pnpm-lock.yaml')) ? 'pnpm'
             : existsSync(join(DIR, 'yarn.lock')) ? 'yarn'
             : existsSync(join(DIR, 'bun.lockb')) ? 'bun' : 'npm';
    for (const [name] of Object.entries(pkg.scripts || {})) {
      const kind = classify(name);
      if (kind) found.push({ kind, command: `${pm} run ${name}`, source: 'package.json' });
    }
  } catch { /* malformed package.json — ignore */ }
}

// ---- Python ----
if (read('pyproject.toml') || read('setup.cfg') || read('tox.ini')) {
  if (existsSync(join(DIR, 'tests')) || read('pyproject.toml')?.includes('pytest'))
    found.push({ kind: 'test', command: 'pytest', source: 'pyproject.toml' });
  const py = read('pyproject.toml') || '';
  if (py.includes('ruff')) found.push({ kind: 'lint', command: 'ruff check .', source: 'pyproject.toml' });
  if (py.includes('mypy')) found.push({ kind: 'typecheck', command: 'mypy .', source: 'pyproject.toml' });
}

// ---- Make / just ----
for (const [file, runner] of [['Makefile', 'make'], ['justfile', 'just'], ['Justfile', 'just']]) {
  const src = read(file);
  if (!src) continue;
  for (const m of src.matchAll(/^([a-zA-Z][\w-]*):/gm)) {
    const kind = classify(m[1]);
    if (kind) found.push({ kind, command: `${runner} ${m[1]}`, source: file });
  }
}

// ---- Rust / Go ----
if (read('Cargo.toml')) {
  found.push({ kind: 'test', command: 'cargo test', source: 'Cargo.toml' });
  found.push({ kind: 'lint', command: 'cargo clippy', source: 'Cargo.toml' });
}
if (read('go.mod')) {
  found.push({ kind: 'test', command: 'go test ./...', source: 'go.mod' });
  found.push({ kind: 'build', command: 'go build ./...', source: 'go.mod' });
}

// ---- CI, as corroboration ----
const wfDir = join(DIR, '.github/workflows');
const ci = [];
if (existsSync(wfDir)) {
  for (const f of readdirSync(wfDir).filter((f) => /\.ya?ml$/.test(f))) {
    // matches both "run: cmd" and the list form "- run: cmd"
    for (const m of (read(join('.github/workflows', f)) || '').matchAll(/^\s*-?\s*run:\s*(.+)$/gm)) {
      const cmd = m[1].trim();
      if (/test|lint|tsc|typecheck|build/i.test(cmd) && !ci.includes(cmd)) ci.push(cmd);
    }
  }
}

// ---- report ----
if (!found.length && !ci.length) {
  console.log('No test/build commands detected. Ask the user, or inspect the repo manually.');
  process.exit(0);
}
const order = ['test', 'typecheck', 'lint', 'build', 'e2e', 'format'];
const seen = new Set();
console.log('Detected commands:\n');
for (const kind of order) {
  for (const f of found.filter((f) => f.kind === kind)) {
    const key = `${f.kind}:${f.command}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  ${kind.padEnd(10)} ${f.command.padEnd(28)} (${f.source})`);
  }
}
if (ci.length) {
  console.log('\nCI runs (authoritative — match these):');
  for (const c of ci.slice(0, 12)) console.log(`  ${c}`);
}
