#!/usr/bin/env node
// Auto-Commit Hook — PostToolUse Write (cross-platform, async)
// Commits changes after writes to keep the project in version control.
// Works on Windows, Mac, and Linux — no bash dependency.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// Only run in CCS-enabled projects
const ccsMarker = path.join(cwd, '.ccs');
if (!fs.existsSync(ccsMarker)) {
  process.stdin.resume();
  process.stdin.on('data', () => {});
  process.stdin.on('end', () => {});
  process.exit(0);
}

// Drain stdin (async hook still receives input)
process.stdin.resume();
process.stdin.on('data', () => {});
process.stdin.on('end', () => {
  try {
    // Only commit if inside a git repository
    execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'pipe' });

    // Stage all changes
    execSync('git add -A', { cwd, stdio: 'pipe' });

    // Check if there are staged changes
    try {
      execSync('git diff --cached --quiet', { cwd, stdio: 'pipe' });
      // If no error, there are no changes — exit
      process.exit(0);
    } catch {
      // Non-zero exit means there ARE staged changes — continue
    }

    // Build commit message from changed files
    const changedFiles = execSync('git diff --cached --name-only', { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
      .trim().split('\n').filter(Boolean);
    const stats = execSync('git diff --cached --stat', { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
      .trim().split('\n').pop() || '';

    let msg;
    if (changedFiles.length === 1) {
      msg = `Auto: ${changedFiles[0]}`;
    } else {
      msg = `Auto: ${changedFiles.length} files`;
    }
    if (stats) msg += ` | ${stats}`;

    execSync(`git commit -m "${msg}" --no-verify`, { cwd, stdio: 'pipe' });
  } catch {
    // Silent failure — auto-commit is best-effort
  }
});
