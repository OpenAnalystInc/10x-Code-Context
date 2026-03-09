<p align="center">
  <img src="https://10x.in/logo.png" alt="10x.in" width="120" />
</p>

<h1 align="center">10x-Code</h1>

<p align="center">
  <strong>Context Engineering Middleware for Claude Code</strong><br/>
  Intelligent codebase indexing, token-efficient file selection, and session persistence — all via local MD files
</p>

<p align="center">
  <a href="https://10x.in">Website</a> &middot;
  <a href="#installation">Install</a> &middot;
  <a href="#slash-commands">Commands</a> &middot;
  <a href="#how-it-works">How It Works</a> &middot;
  <a href="#agents">Agents</a>
</p>

---

> **Proprietary Software of [10x.in](https://10x.in)** — Designed, developed, and maintained by the **10x Team**. This plugin is the intellectual property of 10x.in. All rights reserved.

---

## What is 10x-Code?

**10x-Code** is a production-grade context engineering middleware built by the **10x Team** that sits between your queries and Claude Code. It ensures every interaction has precisely the right context — no wasted tokens exploring irrelevant files, no losing track of what changed.

**Before 10x-Code:** Claude Code explores your codebase from scratch on every query, reading files it doesn't need, losing context when the window fills up.

**With 10x-Code:** Your codebase is indexed once, only relevant files are read per query, and everything is tracked in local MD files that persist across sessions.

### Key Highlights

- **23 slash commands** across 6 categories — context, workflow, testing, research, git, operations
- **6 specialist agents** — context builder, test runner, code auditor, git tracker, knowledge guide, team lead
- **Dependency-aware indexing** — files ranked by import centrality, not just name matching
- **Zero-token context injection** — Glob + Grep lookups cost no API tokens
- **Session persistence** — commit-style task logging in local MD files
- **Hook system** — automated lifecycle hooks for session management and path protection
- **MCP server integration** — remote tools endpoint at `10x.in/api/mcp`
- **Cross-model optimized** — Haiku for scanning, Sonnet for coding, Opus for reasoning

## Installation

### npx (recommended)

```bash
npx 10x-code init
```

### bun

```bash
bunx 10x-code init
```

### Global install

```bash
npm install -g 10x-code
ccs init
```

### Manual

```bash
git clone https://github.com/10x-Anit/10x-Code-Context.git
# Copy each skill as its own directory (Claude Code requires one level deep)
for d in 10x-Code-Context/skills/*/; do
  name=$(basename "$d")
  cp -r "$d" ".claude/skills/ccs-$name/"
done
# Copy shared resources
cp -r 10x-Code-Context/{agents,templates,references} .claude/skills/_ccs/
# Copy MCP config
cp 10x-Code-Context/.mcp.json .mcp.json
```

> **Important:** Skills must be at `.claude/skills/<name>/SKILL.md` (one level deep). Do NOT nest deeper — Claude Code won't discover them.

## Slash Commands

### Context Management

| Command | Description |
|---------|-------------|
| `/ccs-init` | Deep-research the codebase, generate project-map, architecture, file-index, conventions |
| `/ccs-status` | Show what's indexed, staleness, file counts, token savings estimate |
| `/ccs-refresh` | Rebuild index (full, incremental, or session-based) |
| `/ccs-query [question]` | Preview which files would be selected for a given query |

### Workflow

| Command | Description |
|---------|-------------|
| `/ccs-plan [task]` | Plan a task with full dependency-aware context |
| `/ccs-build [task]` | Create/implement with tracked context and commit-style logging |
| `/ccs-refactor [scope]` | Scope a refactor — identify all affected files and dependencies |
| `/ccs-fix [issue]` | Fix bugs with dependency tracking, root-cause analysis, and verification |
| `/ccs-team [task]` | Spawn an agent team for complex multi-part tasks |

### Testing & Quality

| Command | Description |
|---------|-------------|
| `/ccs-test [scope]` | Run tests, track results locally, suggest and auto-fix failures |
| `/ccs-audit [scope]` | Audit code for security, performance, patterns, accessibility, dead code |
| `/ccs-review [scope]` | Code review with full context — style, logic, security, performance |

### Research & Docs

| Command | Description |
|---------|-------------|
| `/ccs-research [query]` | Search official docs, resolve errors, check deps, find best practices |

### Setup

| Command | Description |
|---------|-------------|
| `/ccs-connect` | Set up MCP server — creates/updates .mcp.json, verifies connection |

### Git Workflow

| Command | Description |
|---------|-------------|
| `/ccs-branch` | Create/switch branches with auto-generated context reference files |
| `/ccs-pr` | Prepare PR with full context — title, summary, blast radius, review areas |
| `/ccs-merge` | Merge with dependency checking — conflict prediction, resolution context |
| `/ccs-diff` | Smart diff with impact analysis — dependency chains, blast radius |
| `/ccs-sync` | Pull/rebase/push with conflict context and resolution recommendations |
| `/ccs-stash` | Stash with tracked context — remembers what you were working on |
| `/ccs-log` | Smart commit history — groups by branch, cross-references with task.md |

### Operations

| Command | Description |
|---------|-------------|
| `/ccs-deploy` | Pre-deployment checklist — tests, build, env vars, deps, breaking changes |
| `/ccs-track` | View/manage session task log, see all changes made this session |

## How It Works

### 1. Initialization (`/ccs-init`)

Scans your entire codebase and generates local reference files in `.ccs/`:

- **project-map.md** — File tree + dependency graph (imports/exports/references)
- **architecture.md** — Tech stack, patterns, entry points, data flow
- **file-index.md** — Files ranked by importance (most-imported = highest rank)
- **conventions.md** — Coding style, naming patterns, test patterns

### 2. Per-Query Context (automatic)

When you ask Claude Code anything, the skill:
1. Looks up the pre-built index for matching files/symbols
2. Runs targeted Glob + Grep (zero API cost) to find candidates
3. Follows import/dependency chains of matched files
4. Claude Code reads ONLY the files that matter

### 3. Session Tracking

Every action is logged in `.ccs/task.md` with git-commit-style entries:
- Task description, files read/modified/created/deleted
- Dependencies identified, status, diff summary
- Persists context without consuming API tokens

## Agents

| Agent | Role |
|-------|------|
| **Context Builder** | Deep codebase analysis, generates `.ccs/` index files |
| **Test Runner** | Runs tests, tracks results, auto-fixes failures |
| **Code Auditor** | Security, performance, dead code, accessibility audits |
| **Git Tracker** | Git workflow — branches, PRs, merges, diffs, sync |
| **Knowledge Guide** | Proactive methodology guidance, note quality, connection suggestions |
| **Team Lead** | Multi-agent team coordination, task decomposition, parallel dispatch |

## Model Strategy

| Model | Used For | Commands |
|-------|----------|----------|
| **Haiku 4.5** | Lightweight lookups, scanning, status checks | status, refresh, query, track, stash, log |
| **Sonnet 4.6** | Standard coding execution | build, fix, test, branch, sync |
| **Opus 4.6** | Deep reasoning, architecture, complex analysis | init, plan, refactor, audit, review, research, deploy, pr, merge, diff, team |

## MCP Server Connection

The plugin ships with a `.mcp.json` that configures the CCS remote MCP server automatically:

```json
{
  "mcpServers": {
    "ccs": {
      "type": "http",
      "url": "https://10x.in/api/mcp"
    }
  }
}
```

This provides 6 MCP tools: skill info, all 23 command docs, OS-specific install commands, model strategy, and context file details. Run `/ccs-connect` to configure or verify.

## Hooks System

Automated lifecycle hooks for session management:

| Hook | Trigger | What It Does |
|------|---------|-------------|
| `path-guard.sh` | PreToolUse | Blocks writes to immutable paths, warns on guarded paths |
| `session-orient.sh` | SessionStart | Injects workspace tree, goals, conditions, maintenance signals |
| `write-validate.sh` | PostToolUse | Validates YAML frontmatter on note files |
| `auto-commit.sh` | PostToolUse | Auto-commits changes to git after writes |
| `session-capture.sh` | Stop | Saves session state, commits artifacts |

## Generated Files

All context files are stored in `.ccs/` (add to `.gitignore`):

```
.ccs/
├── project-map.md      # File structure + dependency graph
├── architecture.md     # Tech stack, patterns, data flow
├── file-index.md       # Files ranked by importance
├── conventions.md      # Coding style and patterns
├── task.md             # Session task log (commit-style)
├── preferences.json    # User preferences (refresh mode, etc.)
├── branches/<name>.md  # Per-branch reference files
├── pulls/<name>.md     # PR documentation
├── merge-history.md    # Append-only merge log
├── commit-log.md       # Summarized commit history
└── team-board.md       # Multi-agent team task board
```

## Project Structure

```
10x-Code/
├── skills/             # 23 slash command definitions
├── agents/             # 6 specialist subagent definitions
├── references/         # Strategy docs, quality standards, feature docs
├── templates/          # MD templates for generated files
├── hooks/              # Claude Code lifecycle hooks
├── src/                # TypeScript source
├── dist/               # Compiled output
├── bin/                # CLI entry points
├── statusline/         # Statusline integration
├── manifest.json       # Machine-readable skill/agent definitions
├── SKILLS-TREE.md      # Master skill index
├── AGENTS-INDEX.md     # Agent lookup reference
├── CLAUDE.md           # Plugin orchestrator
├── package.json        # v2.0.0
└── LICENSE             # Proprietary
```

## Requirements

- Node.js 16+
- Claude Code (or compatible AI coding assistant)
- Python 3.8+ (optional, for some analysis features)

## License

**Proprietary Software** — Copyright (c) 2025-2026 [10x.in](https://10x.in). All rights reserved.

This software is the exclusive intellectual property of 10x.in. No part of this software may be reproduced, distributed, modified, or transmitted without prior written permission from 10x.in.

See [LICENSE](LICENSE) for full terms. For licensing inquiries, contact the 10x Team at [10x.in](https://10x.in).

---

<p align="center">
  <sub>Built with precision by the <strong>10x Team</strong> at <a href="https://10x.in">10x.in</a></sub><br/>
  <sub>10x-Code v2.0.0</sub>
</p>
