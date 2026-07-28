#!/usr/bin/env node
// Update a vendored AgentSmith swarm from its upstream template.
//
//   node .agentsmith/tools/sync.mjs [--dry-run]
//
// Run from inside a consumer repo where the swarm was installed with init.mjs.
// It clones the recorded upstream, and for each canonical file:
//   - new upstream file            -> added
//   - unchanged locally            -> updated to upstream
//   - locally modified + upstream changed -> CONFLICT: upstream saved as <file>.upstream
//   - locally modified + upstream same     -> kept as-is
// Then it rewrites manifest.json and regenerates the tool folders.
//
// Zero dependencies (Node >= 18 stdlib). Requires `git` and network access.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, cpSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const DRY = process.argv.includes('--dry-run');
const HOME = dirname(dirname(fileURLToPath(import.meta.url)));   // <repo>/.agentsmith
const TARGET = dirname(HOME);                                    // <repo>
const manifestPath = join(HOME, 'manifest.json');
if (!existsSync(manifestPath)) {
  console.error(`No manifest at ${manifestPath}. Was this installed with init.mjs?`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (!manifest.upstream) {
  console.error('manifest.json has no upstream URL; cannot sync automatically.');
  process.exit(1);
}

const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const SUBDIRS = ['agents', 'skills', 'domains', 'tools', 'docs', 'templates', 'evals'];
// Generated files are rebuilt locally by generate.mjs — never sync them.
const isGenerated = (rel) => rel.endsWith('AGENTS.md');

// ---------- clone upstream ----------
const tmp = mkdtempSync(join(tmpdir(), 'agentsmith-'));
console.log(`Cloning ${manifest.upstream} ...`);
try {
  execFileSync('git', ['clone', '--depth', '1', manifest.upstream, tmp], { stdio: 'pipe' });
} catch (e) {
  console.error('Clone failed:', e.stderr?.toString() || e.message);
  process.exit(1);
}
let newCommit = '';
try { newCommit = execFileSync('git', ['-C', tmp, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch {}

// ---------- walk upstream canonical files ----------
function walk(root) {
  const out = [];
  (function rec(dir) {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) rec(full);
      else out.push(full);
    }
  })(root);
  return out;
}

const added = [], updated = [], conflicts = [], kept = [];
for (const sub of SUBDIRS) {
  for (const upFile of walk(join(tmp, sub))) {
    const rel = relative(tmp, upFile);                // e.g. agents/frontend-engineer.md
    if (isGenerated(rel)) continue;
    const localFile = join(HOME, rel);
    const upBuf = readFileSync(upFile);
    const upHash = sha(upBuf);
    if (!existsSync(localFile)) {
      if (!DRY) { mkdirSync(dirname(localFile), { recursive: true }); writeFileSync(localFile, upBuf); }
      added.push(rel);
      continue;
    }
    const localHash = sha(readFileSync(localFile));
    const baseHash = manifest.files?.[rel];
    if (localHash === upHash) { kept.push(rel); continue; }          // already identical
    if (localHash === baseHash) {                                    // untouched locally
      if (!DRY) writeFileSync(localFile, upBuf);
      updated.push(rel);
    } else {                                                         // locally modified
      if (!DRY) writeFileSync(`${localFile}.upstream`, upBuf);
      conflicts.push(rel);
    }
  }
}

// ---------- report ----------
const line = (label, arr) => arr.length && console.log(`${label} (${arr.length}):\n  ${arr.join('\n  ')}`);
console.log(`\nSync ${DRY ? '(dry run) ' : ''}${manifest.commit || '?'} -> ${newCommit || '?'}`);
line('Added', added);
line('Updated', updated);
line('Conflicts — review the .upstream files then delete them', conflicts);
if (!added.length && !updated.length && !conflicts.length) console.log('Up to date ✓');

if (DRY) { console.log('\nDry run: no files written.'); process.exit(0); }

// ---------- rewrite manifest + regenerate ----------
if (added.length || updated.length) {
  const files = {};
  for (const f of walk(HOME)) {
    const rel = relative(HOME, f);
    if (f.endsWith('.upstream') || isGenerated(rel) || rel === 'manifest.json') continue;
    files[rel] = sha(readFileSync(f));
  }
  manifest.commit = newCommit || manifest.commit;
  manifest.files = files;
  manifest.syncedAt = new Date().toISOString();
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  execFileSync('node', [join(HOME, 'tools', 'generate.mjs')], {
    stdio: 'inherit',
    env: { ...process.env, AGENTSMITH_OUT: TARGET },
  });
  console.log('\n✓ Regenerated tool folders. Review, then commit.');
}
