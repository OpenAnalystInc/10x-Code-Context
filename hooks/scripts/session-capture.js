#!/usr/bin/env node
// Session Capture Hook — Stop (cross-platform)
// Persists session state on session end.
// Receives session info as JSON on stdin.
// Works on Windows, Mac, and Linux — no bash dependency.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cwd = process.cwd();

// Only run in CCS-enabled projects
const ccsMarker = path.join(cwd, '.ccs');
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
    const sessionId = data.session_id || '';

    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').replace(/\..+/, '').replace(/(\d{8})(\d{6})/, '$1-$2');

    const sessDir = path.join(cwd, 'ops', 'sessions');
    if (!fs.existsSync(sessDir)) fs.mkdirSync(sessDir, { recursive: true });

    // Save session state
    if (sessionId) {
      const record = JSON.stringify({
        id: sessionId,
        ended: now.toISOString(),
        status: 'completed'
      });
      fs.writeFileSync(path.join(sessDir, `${timestamp}.json`), record + '\n');
    }

    // Auto-commit session artifacts
    try {
      // Persist goals if they exist
      for (const goalsPath of ['self/goals.md', 'ops/goals.md']) {
        if (fs.existsSync(path.join(cwd, goalsPath))) {
          execSync(`git add ${goalsPath}`, { cwd, stdio: 'pipe' });
        }
      }
      execSync('git add ops/sessions/ ops/observations/ ops/methodology/', { cwd, stdio: 'pipe' });
      execSync(`git commit -m "Session capture: ${timestamp}" --quiet --no-verify`, { cwd, stdio: 'pipe' });
    } catch {
      // Git operations are best-effort
    }
  } catch {
    // Silent failure
  }
});
