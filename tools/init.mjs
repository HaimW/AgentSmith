#!/usr/bin/env node
// Vendor the AgentSmith swarm into another repository.
//
//   node tools/init.mjs <target-repo-path>
//
// What it does:
//   1. Copies the canonical source (agents/, skills/, domains/, tools/) into
//      <target>/.agentsmith/  — the swarm's editable home in the consumer repo.
//   2. Writes <target>/.agentsmith/manifest.json stamping the upstream commit
//      and a hash of every vendored file (used later by sync.mjs).
//   3. Generates .claude/ + CLAUDE.md at the target root.
//
// Zero dependencies (Node >= 18 stdlib).
import { execFileSync } from 'node:child_process';
import {
  cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync, existsSync,
} from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- args ----------
const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--'));
if (!target) {
  console.error('Usage: node tools/init.mjs <target-repo-path>');
  process.exit(1);
}
const TARGET = resolve(target);
if (!existsSync(TARGET) || !statSync(TARGET).isDirectory()) {
  console.error(`Target is not a directory: ${TARGET}`);
  process.exit(1);
}

const HOME = join(TARGET, '.agentsmith');
if (existsSync(HOME)) {
  console.error(`${HOME} already exists. Use tools/sync.mjs to update an existing install.`);
  process.exit(1);
}

// ---------- copy canonical source into <target>/.agentsmith ----------
mkdirSync(HOME, { recursive: true });
for (const d of ['agents', 'skills', 'domains', 'tools', 'docs', 'templates', 'evals']) {
  if (existsSync(join(SRC, d))) cpSync(join(SRC, d), join(HOME, d), { recursive: true });
}

// ---------- hash every vendored file for future sync ----------
const isGenerated = (rel) => rel.endsWith('/AGENTS.md') || rel.endsWith('AGENTS.md');
function hashTree(root) {
  const out = {};
  (function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else {
        const rel = relative(HOME, full);
        if (!isGenerated(rel)) out[rel] = createHash('sha256').update(readFileSync(full)).digest('hex');
      }
    }
  })(root);
  return out;
}

let upstream = '';
try {
  upstream = execFileSync('git', ['-C', SRC, 'config', '--get', 'remote.origin.url'], { encoding: 'utf8' }).trim();
} catch { /* not a git checkout — leave blank */ }
let commit = '';
try {
  commit = execFileSync('git', ['-C', SRC, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
} catch { /* ignore */ }

writeFileSync(join(HOME, 'manifest.json'), JSON.stringify({
  upstream,
  commit,
  tool: 'claude',
  vendoredAt: new Date().toISOString(),
  files: hashTree(HOME),
}, null, 2) + '\n', 'utf8');

// ---------- generate the Claude Code folders at target root ----------
execFileSync('node', [join(HOME, 'tools', 'generate.mjs')], {
  stdio: 'inherit',
  env: { ...process.env, AGENTSMITH_OUT: TARGET },
});

console.log(`\n✓ Vendored AgentSmith into ${HOME}`);
console.log(`✓ Generated .claude/ + CLAUDE.md at ${TARGET}`);
console.log('\nNext steps:');
console.log('  1. Commit the vendored files:');
console.log(`       cd ${TARGET}`);
console.log('       git add .agentsmith .claude CLAUDE.md');
console.log('       git commit -m "Vendor AgentSmith swarm"');
console.log('  2. Personalize the swarm to this repo:');
console.log('       claude "run the project-intake agent"');
console.log('  3. Later, pull upstream updates:');
console.log(`       node ${join(TARGET, '.agentsmith', 'tools', 'sync.mjs')}`);
