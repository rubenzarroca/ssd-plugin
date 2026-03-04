# SDD — Spec Driven Development Plugin for Claude Code

Stop vibe coding. Start building with specs — and learn to write better ones along the way.

SDD is a Claude Code plugin that gives you a structured way to define what you want **before** any code is written. When you ask an AI to build a feature without a plan, it makes hundreds of small decisions on your behalf — and many of them will conflict with each other or with what you actually wanted. SDD prevents that.

But SDD does something else that no other spec framework does: **it teaches you**. Every interaction is designed so that you finish the feature knowing more than when you started — about writing requirements, about making architectural decisions, about thinking in edge cases.

When AI writes all the code, two things break simultaneously. The technical debt multiplies — LLMs don't reason about your architecture or conventions unless you tell them explicitly. And the skill atrophy kicks in — you ship features faster but understand them less, until you become a passenger in your own codebase. SDD prevents both through three governance mechanisms (specs, constitution, state machine) and three pedagogical ones (coached spec writing, pair-programming mode, retrospectives). Claude can't skip steps, can't auto-advance, and can't implement anything that isn't in a confirmed spec.

## Install

### From GitHub

```bash
# 1. Add the repo as a marketplace
/plugin marketplace add rubenzarroca/sdd-plugin

# 2. Install the plugin (choose scope: user, project, or local)
/plugin install sdd@sdd-plugin
```

Or use the interactive UI: run `/plugin`, go to **Discover**, and select **sdd**.

### Local development

```bash
claude --plugin-dir /path/to/sdd-plugin
```

After installing, open any project and run `/sdd:init` to set up the SDD structure.

## Quick start

```
/sdd:init my-project          → Analyzes your project, generates CLAUDE.md + constitution
/sdd:prd                       → (Optional) Guided interview to create a Product Requirements Document
/sdd:specify auth "OAuth2"     → Creates the spec with coaching — teaches you to write better requirements
/sdd:clarify auth              → Finds gaps and ambiguities in the spec
/sdd:plan auth                 → Generates technical plan + ADR
/sdd:tasks auth                → Decomposes plan into atomic tasks (S/M/L complexity)
/sdd:implement                 → Implements tasks (auto-batches small ones), validates, stops
/sdd:implement TASK-002 --pair → Pair mode: Claude scaffolds, you write the business logic
/sdd:validate auth             → Drift detection: spec vs code, constitution compliance
/sdd:retro auth                → (Optional) Reflect on what you learned during this feature
```

Every step requires your explicit approval before moving to the next. Claude never auto-advances.

## The learning arc

SDD embeds a learning cycle into the development workflow. You don't study first and build later — you learn *by building*, with scaffolding that adapts to your level and fades as you improve.

**1. Coached specification** — During `/sdd:specify`, Claude monitors your input for common weaknesses: vague requirements, missing edge cases, untestable criteria, hardcoded values. Instead of silently fixing your input, it offers a concrete alternative using your actual data. If you say "the system must be fast," Claude will say: "With your current volume of 500 leads per week, a P95 response time of 500ms would keep the team flowing. Want me to set that as the threshold?" The coaching fades as you improve — no levels, no badges, the scaffolding simply becomes unnecessary.

**2. Guided practice** — During `/sdd:implement --pair`, Claude generates the file structure, imports, and boilerplate, but leaves `// YOUR TURN:` markers where the business logic goes. You write the parts that matter most. The difficulty adapts: simpler hints on your first features, more open-ended challenges as your profile grows.

**3. Reflection** — After completing a feature, `/sdd:retro` asks 2 reflective questions and summarizes how your coaching profile changed. A 2-minute debrief to consolidate what you learned.

**4. Annotated examples** — `docs/examples/` contains two reference specs (a simple webhook and a complex scoring engine with external API integration) with inline learning notes explaining *why* each section is written the way it is. The complex example includes a Clearbit API dependency to demonstrate the full external API workflow: cached docs, rate limiting, and graceful degradation.

People with strong business context but limited technical vocabulary can produce implementation-ready specs from day one, while building technical literacy organically. Experienced developers get a structured workflow without condescending tutorials.

## The workflow

### 0. PRD (`/sdd:prd`)

Optional but recommended. Generates a Product Requirements Document through a guided interview: product vision, target users, modules, scope boundaries, success criteria. Feeds context to all downstream `/sdd:specify` commands.

### 1. Initialize (`/sdd:init`)

Run once per project. Detects your stack, generates a CLAUDE.md (< 60 lines) and walks you through creating a constitution.md with your project's non-negotiable principles. Creates the state machine (`.sdd/state.json`) and folder structure. Never overwrites without confirmation.

### 2. Specify (`/sdd:specify`)

Generates a comprehensive feature spec through a focused discovery interview: metadata, context, goals & non-goals, user stories, functional requirements (FR-001...), non-functional requirements (NFR-001...), technical design, data models, API contracts, edge cases (EC-001...), and open questions. The coaching layer described in "The learning arc" runs here — adapting to your spec-writing skill level.

### 3. Clarify (`/sdd:clarify`)

Optional. Analyzes the spec for ambiguities (terms with multiple interpretations), unvalidated assumptions, and edge cases. Questions come one at a time, not in a batch.

### 4. Plan (`/sdd:plan`)

Generates the technical plan: architecture, dependencies, files affected, risks and trade-offs. If there are architectural alternatives, presents 2-3 options with pros/cons — your choice generates an Architecture Decision Record in `docs/adr/`.

**External API check:** Before planning, scans the spec for references to external services. If it detects integrations without cached API documentation, it blocks the plan and directs you to run `/sdd:api-docs` first. This prevents building against assumed API behavior from training data.

### 5. Tasks (`/sdd:tasks`)

Decomposes the plan into atomic tasks with ID, description, files, dependencies, complexity (S/M/L), and validation criterion. Tasks are grouped into parallel waves — independent tasks execute simultaneously.

### 6. Implement (`/sdd:implement`)

Executes tasks with minimal context budget — reads only the task block and its listed files. For tasks involving external APIs, loads only the specific endpoint contract via `sdd_api_lookup`. Auto-batches S-complexity tasks. Reports blockers instead of silently implementing undocumented requirements. Retries validation up to 3 times before asking for help.

**Pair mode (`--pair`):** Claude scaffolds, you write the business logic via `// YOUR TURN:` markers. Difficulty adapts to your experience. Maximum 3 markers per file, zero on boilerplate files.

### 7. Validate (`/sdd:validate`)

Drift detection. Reports which requirements are covered, which are missing, and which code doesn't correspond to any requirement (orphan code). Checks constitution compliance: imports, prohibited patterns, testing standards.

### 8. Retro (`/sdd:retro`)

Optional. Run after completing a feature — never suggested automatically, never blocks anything. Saves to `specs/{feature}/retro.md`. Over time, retro files become a journal of your growth as a spec writer.

## Supporting commands

**`/sdd:constitution`** — Creates or edits the project's non-negotiable principles (architecture, testing, security, dependencies, code standards). Expressed as verifiable rules. The constitution wins over CLAUDE.md in conflicts.

**`/sdd:api-docs`** — Fetches and caches external API documentation to `.sdd/api-docs/{service}.json` (gitignored). The cache is queried surgically during implementation — only the specific endpoint a task needs enters the context window.

```
/sdd:api-docs stripe https://docs.stripe.com/api    → Fetches, parses, caches
/sdd:api-docs bigquery                                → WebSearch finds docs, then caches
```

**`/sdd:status`** — Session recovery. Shows active feature, current state, task progress, pending alerts. The lightest command — reads only `state.json`.

## State machine

Every feature moves through a strict lifecycle:

```
[prd] → drafting → specified → clarified → planned → tasked → implementing → validating → completed
```

The PRD phase is optional — projects without a PRD start at `drafting`.

Transitions are enforced. You can't implement without a confirmed plan. You can't validate without completing all tasks. If you need to go back:

- `implementing → tasked` (re-plan tasks without losing spec or plan)
- Any state `→ drafting` (full reset, start the spec from scratch)

## For existing projects

SDD is designed for incremental adoption:

1. **Run `/sdd:init`** on your existing project. It analyzes what's there and adapts. No retroactive spec writing needed.
2. **Use SDD for new features only.** Existing code stays outside of SDD scope.
3. **Optionally**, use `/sdd:validate` on legacy code by creating a retroactive spec, then checking for divergences.

## Project structure

After init, your project will have:

```
your-project/
├── CLAUDE.md                    ← Entry point for Claude (< 60 lines)
├── constitution.md              ← Non-negotiable principles
├── .sdd/
│   ├── state.json               ← State machine + coaching profile
│   ├── hooks.json               ← Hook config
│   └── api-docs/                ← Cached external API docs (gitignored)
├── specs/
│   ├── prd.md                   ← Product Requirements Document (optional)
│   └── [feature-name]/
│       ├── spec.md / spec.json  ← Feature specification (human + structured)
│       ├── plan.md              ← Technical plan
│       ├── tasks.md / tasks.json← Task decomposition (human + structured)
│       └── retro.md             ← What you learned (optional)
└── docs/
    ├── adr/                     ← Architecture Decision Records
    └── examples/                ← Annotated reference specs with learning notes
```

Everything is plain text (markdown + JSON), git-friendly, and produces readable diffs.

## Hooks

SDD generates four hooks in `.sdd/hooks.json`:

- **SessionStart** (disabled): auto-runs `/sdd:status` when you open Claude Code
- **PrePlan** (enabled): blocks `/sdd:plan` if external services lack cached API docs
- **PreCompact** (disabled): saves session notes before context compaction
- **PostImplement** (disabled): runs validation after all tasks complete

## Design principles

**Governance is programmatic, not conversational.** The constitution isn't a suggestion — it's a contract that `/sdd:validate` can verify.

**The scaffolding fades.** Coaching interventions decrease as your specs improve. Pair-mode markers become more open-ended. The system adapts instead of treating every user the same.

**Context budget by design.** Each command loads only what it needs. `/sdd:status` reads only state.json. `/sdd:implement` reads only the task and its files.

## MCP server

The plugin includes an MCP server for deterministic state machine enforcement — no probabilistic interpretation, no silent state corruption.

### Tools

| Tool | Type | Description |
|------|------|-------------|
| `sdd_get_state` | read | Get project or feature state |
| `sdd_transition` | write | Transition a feature to a new state (enforces preconditions) |
| `sdd_validate` | read | Structured coverage report (deterministic + heuristic) |
| `sdd_next_action` | read | Available transitions and ready tasks |
| `sdd_api_list` | read | Index of cached external API docs |
| `sdd_api_lookup` | read | Surgical lookup: specific endpoint, auth, rate limits, or SDK |

### Setup

```bash
cd server && npm install && npm run build
```

```bash
claude mcp add sdd-server -- node /absolute/path/to/sdd-plugin/server/build/index.js /path/to/your/project
```

The second argument is the project root where `.sdd/state.json` and `specs/` live. If omitted, defaults to the current working directory.

Skills handle the human-facing workflow (coaching, interviews, explanations). The MCP server handles the machine-facing enforcement (state transitions, precondition validation, coverage calculation). In a future version, these same tools could be orchestrated through [Programmatic Tool Calling (PTC)](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/programmatic-tool-calling) for autonomous execution of the full SDD lifecycle — the `sdd_next_action` tool is already designed for this.

## Author

Built by Rubén Zarroca. Designed for teams that want AI-assisted development without the chaos — and without losing the ability to think for themselves.

## License

MIT
