# Codebase Context Skill — Skills Tree v2.0.0

> **For agents**: Read this file first. Match your task to a skill below, then read only `skills/<name>/SKILL.md` for full instructions. Do not read all skills — pick only what you need.

## Quick Reference

| # | Skill | Category | Model | Tags | Depends On | Token Est. | Parallel |
|---|-------|----------|-------|------|-----------|-----------|---------|
| 1 | init | context | opus | index, scan, setup, architecture | — | ~8K | no |
| 2 | status | context | haiku | check, health, staleness | init | ~1K | yes |
| 3 | query | context | haiku | search, preview, lookup | init | ~1.5K | yes |
| 4 | refresh | context | opus | rebuild, update, incremental | init | ~5K | no |
| 5 | plan | workflow | opus | plan, task, dependency | init | ~4K | yes |
| 6 | build | workflow | sonnet | implement, create, feature | init, plan | ~6K | no |
| 7 | fix | workflow | sonnet | debug, bugfix, root-cause | init | ~5K | no |
| 8 | refactor | workflow | opus | restructure, blast-radius | init | ~5K | no |
| 9 | team | workflow | opus | multi-agent, parallel, coordination | init | ~8K | no |
| 10 | test | quality | sonnet | test, verify, auto-fix | init | ~4K | yes |
| 11 | audit | quality | opus | security, performance, a11y, dead-code | init | ~6K | yes |
| 12 | review | quality | opus | code-review, style, logic | init | ~5K | yes |
| 13 | research | quality | opus | docs, errors, best-practices | — | ~3K | yes |
| 14 | branch | git | sonnet | branch, switch, context-ref | init | ~2K | no |
| 15 | pr | git | opus | pull-request, summary, blast-radius | init, branch | ~4K | yes |
| 16 | merge | git | opus | merge, conflict, resolution | init, branch | ~4K | no |
| 17 | diff | git | opus | diff, impact, dependency-chain | init | ~3K | yes |
| 18 | sync | git | sonnet | pull, push, rebase, conflict | init | ~3K | no |
| 19 | log | git | haiku | history, commits, cross-ref | init | ~1.5K | yes |
| 20 | stash | git | haiku | stash, wip, restore | init | ~1.5K | yes |
| 21 | deploy | ops | opus | deploy, checklist, env-vars, breaking-changes | init | ~4K | no |
| 22 | track | ops | haiku | session, task-log, changes | — | ~1K | yes |
| 23 | connect | setup | sonnet | mcp, server, endpoint | — | ~2K | no |

## Categories

### Context Management
`init` · `status` · `query` · `refresh`

Core indexing and lookup. Run `init` first on any new codebase — all other skills depend on the `.ccs/` index it generates.

### Workflow
`plan` · `build` · `fix` · `refactor` · `team`

Task execution with dependency tracking. `plan` before `build`. `fix` for bugs. `refactor` for structural changes. `team` for multi-agent parallel dispatch.

### Quality
`test` · `audit` · `review` · `research`

Verification and knowledge. These skills are read-heavy and parallel-safe — run multiple simultaneously.

### Git
`branch` · `pr` · `merge` · `diff` · `sync` · `log` · `stash`

Version control with context awareness. Each generates/updates context reference files in `.ccs/`.

### Operations
`deploy` · `track` · `connect`

Deployment checklists, session tracking, and MCP server setup.

## Agents

| Agent | File | Role | Model | Tools |
|-------|------|------|-------|-------|
| context-builder | `agents/context-builder.md` | Deep codebase scan → .ccs/ index | opus | Read, Glob, Grep, Write |
| test-runner | `agents/test-runner.md` | Execute tests, track results, auto-fix | sonnet | Bash, Read, Grep, Write |
| code-auditor | `agents/code-auditor.md` | Security, perf, dead code, a11y analysis | opus | Read, Glob, Grep |
| git-tracker | `agents/git-tracker.md` | Branch, PR, merge, diff, sync ops | sonnet | Bash, Read, Grep, Write |
| knowledge-guide | `agents/knowledge-guide.md` | Methodology guidance, note quality | haiku | Read, Grep |
| team-lead | `agents/team-lead.md` | Multi-agent coordination, task decomposition | opus | Read, Write, Glob, Grep, Bash, Task |

## Dependency Graph

```
init ──┬──→ status, query, refresh
       ├──→ plan ──→ build
       ├──→ fix, refactor
       ├──→ team (orchestrates plan, build, fix, test, review)
       ├──→ test ──→ fix (auto-fix loop)
       ├──→ audit, review, diff
       ├──→ branch ──→ pr ──→ merge
       ├──→ sync, log, stash
       └──→ deploy

research, track, connect → independent (no init dependency)
```

## Shared State (`.ccs/` directory)

| File | Written By | Read By |
|------|-----------|---------|
| `project-map.md` | init, refresh | all skills |
| `architecture.md` | init, refresh | plan, build, refactor, audit, review |
| `file-index.md` | init, refresh | query, build, fix, refactor |
| `conventions.md` | init, refresh | build, review, audit |
| `task.md` | all skills (append) | status, log, track |
| `preferences.json` | init | refresh |
| `branches/*.md` | branch | pr, merge, sync |
| `pulls/*.md` | pr | merge, review |
| `merge-history.md` | merge | log |
| `commit-log.md` | log | track |
| `team-board.md` | team | team-lead agent |

## For Swarm Orchestrators

- **Discovery**: Read this file (~2.5K tokens) → pick skill → read that skill (~3-8K tokens)
- **Machine-readable**: See `manifest.json` for programmatic access
- **Agent lookup**: See `AGENTS-INDEX.md` for 6 agents with tool restrictions
- **Coordination**: Filesystem-based via `.ccs/` — no network required
- **Parallel reads**: Any number of agents can read the index simultaneously
- **Write lock**: Only one agent should write to `.ccs/task.md` at a time (append-only)
- **Isolation**: Each skill operates in forked context — no cross-skill state leakage
- **Model tiering**: Use the model column to route to appropriate compute tier

---
*10x-Code — 10x-Code v2.0.0*
