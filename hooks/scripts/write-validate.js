#!/usr/bin/env node
// Schema Enforcement Hook — PostToolUse Write (cross-platform)
// Validates notes in the knowledge space have required fields.
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
    const filePath = data.tool_input?.file_path || '';

    if (!filePath || !fs.existsSync(filePath)) process.exit(0);

    // Only validate notes in knowledge space
    const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    if (!relPath.includes('/notes/') && !relPath.includes('thinking/')) {
      process.exit(0);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(0, 20);
    const header = lines.join('\n');
    const warns = [];

    if (!header.includes('description:')) warns.push('Missing description field.');
    if (!header.includes('topics:')) warns.push('Missing topics field.');
    if (!lines[0] || lines[0].trim() !== '---') warns.push('Missing YAML frontmatter.');

    if (warns.length > 0) {
      const filename = path.basename(filePath, '.md');
      process.stdout.write(JSON.stringify({
        additionalContext: `Schema warnings for ${filename}: ${warns.join(' ')}`
      }));
    }
  } catch {
    // Silent failure
  }
});
