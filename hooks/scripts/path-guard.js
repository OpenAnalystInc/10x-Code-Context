#!/usr/bin/env node
// Path Guard — PreToolUse hook (cross-platform)
// Blocks writes/edits/deletes to protected CCS paths.
// Reads tool input JSON from stdin.
// Returns {"decision":"block","reason":"..."} to prevent the tool from running.
// Works on Windows, Mac, and Linux — no bash dependency.

const fs = require('fs');
const path = require('path');

// Only run in CCS-enabled projects
const ccsMarker = path.join(process.cwd(), '.ccs');
if (!fs.existsSync(ccsMarker)) {
  process.stdin.resume();
  process.stdin.on('data', () => {});
  process.stdin.on('end', () => {});
  process.exit(0);
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data.tool_input?.file_path || data.tool_input?.path || '';
    const command = data.tool_input?.command || '';
    const toolName = data.tool_name || '';

    // Normalize to forward-slash relative path
    const relPath = filePath
      ? path.relative(process.cwd(), filePath).replace(/\\/g, '/')
      : '';

    // ── BLOCK: ops/sessions — immutable once written by session-capture ──
    if (relPath && (relPath.startsWith('ops/sessions/') || relPath === 'ops/sessions')) {
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason: 'PROTECTED: ops/sessions/ records are immutable. Session data must never be modified or deleted after capture. These are the permanent audit trail of completed sessions.'
      }));
      process.exit(0);
    }

    // ── BLOCK: installed skill plugin files ──
    if (relPath && relPath.match(/\.claude\/skills\/ccs-/)) {
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason: 'PROTECTED: Installed CCS skill plugin files (.claude/skills/ccs-*/) must not be modified. To update the skill, reinstall from the source repo.'
      }));
      process.exit(0);
    }

    // ── BLOCK: hook scripts and manifest ──
    if (relPath && (relPath.startsWith('hooks/scripts/') || relPath === 'hooks/hooks.json')) {
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason: 'PROTECTED: CCS hook scripts and hooks.json must not be modified during normal operation. Changes to hooks require explicit deliberate intent.'
      }));
      process.exit(0);
    }

    // ── BLOCK: Bash commands that rm/delete session files ──
    if (command && /ops\/sessions/.test(command) && /(rm|del|unlink|truncate)/.test(command)) {
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason: 'PROTECTED: Deletion commands targeting ops/sessions/ are blocked. Session records are immutable after capture.'
      }));
      process.exit(0);
    }

    // ── WARN: references/ — no bulk refactor, individual edits allowed ──
    if (relPath && relPath.startsWith('references/')) {
      const content = data.tool_input?.content || '';
      if (!content && toolName === 'Write') {
        process.stdout.write(JSON.stringify({
          decision: 'block',
          reason: 'GUARDED: Refusing to overwrite a references/ file with empty content. References are system documentation — individual targeted edits are allowed but empty overwrites are not.'
        }));
        process.exit(0);
      }
      process.stdout.write(JSON.stringify({
        additionalContext: 'GUARDED PATH: references/ files are CCS system documentation. Scoped individual edits are allowed. Do NOT bulk-refactor, mass-rename, or delete reference files.'
      }));
      process.exit(0);
    }

    // ── WARN: skills/ and agents/ — targeted edits only ──
    if (relPath && (relPath.match(/^skills\/.*\/SKILL\.md$/) || relPath.match(/^agents\/.*\.md$/))) {
      process.stdout.write(JSON.stringify({
        additionalContext: 'GUARDED PATH: CCS skill/agent definition files. Targeted single-file edits are permitted. Do NOT bulk-refactor the skills/ or agents/ directories.'
      }));
      process.exit(0);
    }
  } catch {
    // Silent failure — hooks must never break the session
  }
});
