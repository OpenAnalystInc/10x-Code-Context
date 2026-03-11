#!/usr/bin/env node
// Session Orientation Hook — SessionStart (cross-platform)
// Injects workspace structure, identity, goals, and maintenance signals at session start.
// Works on Windows, Mac, and Linux — no bash dependency.

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

// Only run in CCS-enabled projects
const ccsMarker = path.join(cwd, '.ccs');
if (!fs.existsSync(ccsMarker)) {
  process.exit(0);
}

try {
  const output = [];
  output.push('## Workspace Structure');
  output.push('');

  // Show markdown files up to 3 levels deep
  const mdFiles = [];
  function walkDir(dir, depth) {
    if (depth > 3) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath, depth + 1);
      } else if (entry.name.endsWith('.md')) {
        mdFiles.push(path.relative(cwd, fullPath).replace(/\\/g, '/'));
      }
    }
  }
  walkDir(cwd, 0);
  mdFiles.sort();
  for (const f of mdFiles) {
    const depth = f.split('/').length - 1;
    const indent = '  '.repeat(depth);
    output.push(`${indent}${path.basename(f)}`);
  }

  output.push('');
  output.push('---');
  output.push('');

  // Previous session state (continuity)
  const currentSession = path.join(cwd, 'ops', 'sessions', 'current.json');
  if (fs.existsSync(currentSession)) {
    output.push('--- Previous session context ---');
    output.push(fs.readFileSync(currentSession, 'utf8'));
    output.push('');
  }

  // Persistent working memory (goals)
  for (const goalsPath of ['self/goals.md', 'ops/goals.md']) {
    const full = path.join(cwd, goalsPath);
    if (fs.existsSync(full)) {
      output.push(fs.readFileSync(full, 'utf8'));
      output.push('');
      break;
    }
  }

  // Identity (if self space enabled)
  const identityPath = path.join(cwd, 'self', 'identity.md');
  if (fs.existsSync(identityPath)) {
    output.push(fs.readFileSync(identityPath, 'utf8'));
    const methPath = path.join(cwd, 'self', 'methodology.md');
    if (fs.existsSync(methPath)) output.push(fs.readFileSync(methPath, 'utf8'));
    output.push('');
  }

  // Condition-based maintenance signals
  function countFiles(dir, ext) {
    try {
      return fs.readdirSync(dir).filter(f => f.endsWith(ext)).length;
    } catch { return 0; }
  }

  const obsCount = countFiles(path.join(cwd, 'ops', 'observations'), '.md');
  const tensCount = countFiles(path.join(cwd, 'ops', 'tensions'), '.md');
  const sessCount = countFiles(path.join(cwd, 'ops', 'sessions'), '.json') - (fs.existsSync(currentSession) ? 1 : 0);
  const inboxCount = countFiles(path.join(cwd, 'inbox'), '.md');

  if (obsCount >= 10) output.push(`CONDITION: ${obsCount} pending observations. Consider reviewing them.`);
  if (tensCount >= 5) output.push(`CONDITION: ${tensCount} unresolved tensions. Consider reviewing them.`);
  if (sessCount >= 5) output.push(`CONDITION: ${sessCount} unprocessed sessions. Consider mining insights.`);
  if (inboxCount >= 3) output.push(`CONDITION: ${inboxCount} items in inbox. Consider processing.`);

  process.stdout.write(output.join('\n'));
} catch {
  // Silent failure
}
