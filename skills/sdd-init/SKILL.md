---
name: sdd-init
description: "Initialize SDD (Specification-Driven Development) workflow in a project. Use when setting up SDD for the first time, when the user says 'start SDD', 'init project', 'initialize specs', or asks to add specification-driven development to an existing codebase. Generates CLAUDE.md, constitution.md, state.json, and project structure."
argument-hint: "[project-name]"
user-invokable: true
---

# /sdd:init — Initialize SDD workflow for this project

You are setting up Specification-Driven Development for a project. Follow these steps exactly, in order. Do NOT skip steps. Do NOT read source code — only directory listing and package manifest.

## Step 0: Orient the user

Before any detection or file creation, briefly explain what is about to happen — in plain language, not technical jargon:

"Before we write any code, we're going to set up two things: a **project constitution** (your non-negotiable rules — like which tools to use and how code should be organized) and a **specifications workflow** (a structured way to define features before building them). Without clear rules, an AI makes hundreds of small decisions on your behalf — naming conventions, folder structure, which libraries to use — and many will conflict with what you actually want. These two tools stop that. I'll ask you a few questions — there are no wrong answers, and we can always refine later."

Then ask: "Can you describe in one or two sentences what this project does?" Use the answer to ground all subsequent questions — refer back to the user's own words, use their terminology, and frame every technical concept through their business context throughout the entire init process.

## Coaching Layer

Init is the user's first encounter with SDD. The coaching here focuses on the constitution interview (Step 5), where the user must articulate project principles they may never have formalized.

**Scaffolding triggers during the constitution interview:**

| What Claude detects | What Claude does |
|---|---|
| User says "I don't know" to a category question | Propose based on detected stack: "Based on your package.json, you're using Next.js with App Router. That typically means file-based routing with colocated components. Does that sound right?" |
| User gives an overly broad answer ("we test everything" / "standard security") | Narrow with specifics: "What do you test today? Unit tests on business logic? E2E on key flows? If nothing is set up yet, that's fine — we'll define it when you build your first feature." |
| User provides a non-verifiable principle ("keep code clean", "follow best practices") | Reframe concretely: "'Clean code' means different things to different teams. For your project, could we say 'All functions under 50 lines' or 'No file exceeds 300 lines'? What does clean mean to you?" |
| User defers all decisions ("whatever you think is best") | Anchor to their project: "I can suggest defaults based on your stack, but these rules are yours — they'll constrain everything I build later. Let me propose something and you tell me if it fits." |

**Rules:**
1. Same scaffolding principles as other SDD skills: contextual, one intervention at a time, suggest (don't impose), use the user's project vocabulary.
2. **Seed the coaching_profile.** For each constitution category, note whether the user needed scaffolding or provided strong answers independently. Populate the relevant categories in `coaching_profile` when creating state.json in Step 6 — this gives downstream skills initial calibration data.
3. **Ground every question in detections.** Reference what was found in the package manifest and directory structure. "Your project uses Prisma — should we add 'All database access goes through Prisma, no raw SQL' as a principle?"

## Step 1: Detect project stack

Run `ls` on the project root. Look for:
- `package.json` → Node/TypeScript/JavaScript (read it for framework, deps, scripts)
- `requirements.txt` / `pyproject.toml` / `setup.py` → Python
- `Cargo.toml` → Rust
- `go.mod` → Go
- `pom.xml` / `build.gradle` → Java/Kotlin
- `Gemfile` → Ruby

Read the manifest file to extract: project name, language, framework, key dependencies, test command, build command.

## Step 2: Check for existing files

Check if any of these already exist: `CLAUDE.md`, `constitution.md`, `.sdd/`, `specs/`.

If any exist, list them and ask the user: "These SDD-related files already exist: [list]. Should I overwrite them, merge with them, or abort?" Wait for answer before continuing.

## Step 3: Create folder structure

Create these directories if they don't exist:
- `specs/`
- `docs/` (if not existing)
- `docs/adr/` (if not existing)
- `.sdd/`
- `.sdd/api-docs/`

Add `.sdd/api-docs/` to the project's `.gitignore` file (create the file if it doesn't exist, or append if it does). This directory contains cached external API documentation that should not be committed — it's fetched from live sources and may become stale.

## Step 4: Generate CLAUDE.md

Generate `CLAUDE.md` in the project root. Must be **under 60 lines** and **under 2,500 tokens**. Use this structure, filling in detected values:

```markdown
# {Project Name}

{One-line description of what the project does, inferred from manifest and directory structure.}

## Tech Stack

| Layer | Technology |
|-------|-----------|
{Table rows for each detected technology: language, framework, DB, testing, deployment, etc.}

## SDD Workflow

This project uses Specification-Driven Development. All features follow this lifecycle:

0. `/sdd:prd` — (Optional) Generate a Product Requirements Document
1. `/sdd:specify` — Write a spec from a feature description
2. `/sdd:clarify` — Identify and resolve gaps in the spec
3. `/sdd:plan` — Design the technical approach + generate ADR
4. `/sdd:tasks` — Decompose plan into atomic, testable tasks
5. `/sdd:implement TASK-NNN` — Implement one task at a time
6. `/sdd:validate` — Verify implementation matches spec

State is tracked in `.sdd/state.json`. Run `/sdd:status` for a quick overview.

For project principles and non-negotiables, see `constitution.md`. **In case of conflict between this file and constitution.md, constitution.md takes precedence.**

## Key Commands

- `/sdd:status` — Show current feature state and progress
- `/sdd:constitution` — View or edit project principles
- `/sdd:init` — Re-initialize (use with caution)

## Rules

1. Never implement without a spec. If there's no spec, run `/sdd:specify` first.
2. Never skip clarification. Ambiguity in specs becomes bugs in code.
3. One task at a time. Do not batch-implement multiple tasks.
4. Report blockers, don't work around them. If a task needs something not in its scope, stop and report.
```

Adapt the description and tech stack to what you detected. Do NOT add sections beyond what's shown.

## Step 5: Generate constitution.md

This is interactive. Guide the user through questions by category. For each category below, first explain in one sentence what the category means in practical terms, then ask the questions. If the user doesn't know the answer to a question, say: "That's fine — we can leave this open and refine it later as we build." Never pressure the user to answer questions they aren't ready for.

**Architecture** — _This is about how the different pieces of your application are organized and communicate with each other._
- "What architectural pattern does this project follow? (e.g., monolith, microservices, modular monolith, serverless)"
- "Are there folder structure rules? (e.g., features in src/features/, tests next to source)"

**Testing** — _This is about how you verify that your code works correctly before shipping._
- "What's your testing approach? (e.g., unit + integration, E2E only, no tests yet)"
- "Any minimum coverage target? Test framework preference?"

**Security** — _This is about how your application verifies who users are and protects their data._
- "How is authentication handled? Any security patterns required?"
- "Input validation approach? (e.g., zod schemas, manual, framework-provided)"

**Dependencies** — _These are the external libraries your project uses. Controlling them prevents surprises._
- List the currently installed dependencies from the manifest.
- "Are all of these approved? Any that should be removed? What's the process for adding new ones?"

**Code Standards** — _These are the formatting and naming rules that keep the codebase consistent._
- "Naming conventions? (e.g., camelCase functions, PascalCase components, snake_case files)"
- "Any formatting/linting tools already configured?"

After each answer, write the principle in verifiable form. Examples:
- GOOD: "All React components use PascalCase. Files use kebab-case."
- BAD: "Follow good naming practices."
- GOOD: "Allowed test frameworks: vitest, @testing-library/react. No jest."
- BAD: "Use appropriate testing tools."

Generate `constitution.md` with this structure:

```markdown
# Constitution

Project principles and non-negotiables. This document takes precedence over CLAUDE.md in case of conflict.

## Architecture
{Verifiable principles from user answers}

## Testing
{Verifiable principles from user answers}

## Security
{Verifiable principles from user answers}

## Allowed Dependencies
{List of approved dependencies + process for adding new ones}

## Code Standards
{Verifiable principles from user answers}

## Process
- All features go through the SDD lifecycle (specify → clarify → plan → tasks → implement → validate).
- No implementation without a reviewed spec.
- No scope creep during implementation — report blockers instead.
```

## Step 6: Create .sdd/state.json

Create `.sdd/state.json` with this exact schema (fill project name and timestamp):

```json
{
  "version": "1.0.0",
  "project": "{detected project name}",
  "initialized_at": "{ISO 8601 timestamp}",
  "active_feature": null,
  "last_session_notes": null,
  "last_session_end": null,
  "coaching_profile": {
    "problem_vs_solution": { "scaffolded": 0, "unscaffolded": 0 },
    "user_specificity": { "scaffolded": 0, "unscaffolded": 0 },
    "measurable_outcomes": { "scaffolded": 0, "unscaffolded": 0 },
    "non_goals": { "scaffolded": 0, "unscaffolded": 0 },
    "quantified_nfrs": { "scaffolded": 0, "unscaffolded": 0 },
    "edge_cases": { "scaffolded": 0, "unscaffolded": 0 },
    "testable_criteria": { "scaffolded": 0, "unscaffolded": 0 },
    "data_models": { "scaffolded": 0, "unscaffolded": 0 },
    "api_contracts": { "scaffolded": 0, "unscaffolded": 0 },
    "security": { "scaffolded": 0, "unscaffolded": 0 },
    "configurability": { "scaffolded": 0, "unscaffolded": 0 }
  },
  "completed_features": 0,
  "milestones": {
    "adr_explained": false,
    "orphan_code_explained": false,
    "atomic_tasks_explained": false,
    "gap_taxonomy_explained": false,
    "role_transition_explained": false,
    "requirement_traceability_explained": false
  },
  "prd": {
    "status": "none",
    "path": "specs/prd.md"
  },
  "features": {},
  "allowed_transitions": {
    "drafting": ["specified"],
    "specified": ["clarified", "planned", "drafting"],
    "clarified": ["planned", "drafting"],
    "planned": ["tasked", "drafting"],
    "tasked": ["implementing", "drafting"],
    "implementing": ["validating", "tasked", "drafting"],
    "validating": ["completed", "implementing", "drafting"],
    "completed": ["drafting"]
  }
}
```

**Important:** The coaching_profile values above are defaults. Before writing state.json, update them based on the constitution interview in Step 5: for each category where the user needed scaffolding, set `scaffolded: 1`. For each category where the user provided strong, specific answers without prompting, set `unscaffolded: 1`. This seeds the profile so downstream skills start with real calibration data instead of a blank slate.

## Step 7: Create .sdd/hooks.json

Create `.sdd/hooks.json`:

```json
{
  "SessionStart": {
    "enabled": false,
    "action": "sdd-status",
    "description": "Show SDD status at the beginning of each session"
  },
  "PrePlan": {
    "enabled": true,
    "action": "check-api-docs",
    "description": "Block /sdd:plan if external services are detected without cached API documentation. Prevents building against assumed API behavior."
  },
  "PreCompact": {
    "enabled": false,
    "action": "save-state",
    "description": "Save session notes to state.json before context compaction"
  },
  "PostImplement": {
    "enabled": false,
    "action": "sdd-validate",
    "description": "Run validation automatically after all tasks are completed"
  }
}
```

Also create the `.sdd/api-docs/` directory for cached external API documentation.

## Step 8: Evaluate AGENTS.md

Look at the project directory structure. If the project has **multiple clear entry points** (e.g., frontend + backend, multiple services, CLI + library) or **clear module boundaries**, suggest:

"This project appears to have [describe boundaries]. An AGENTS.md file tells Claude which parts of the codebase have specialized rules or different expertise needs — for example, a frontend module might have different testing patterns than a backend API. Would you like me to create one?"

If the user declines or the project is a single-module project, skip this step.

## Step 9: Present summary

Show everything that was created:

```
SDD initialized for {project name}

Created:
  CLAUDE.md          — Project overview + SDD workflow reference
  constitution.md    — Project principles (architecture, testing, security, deps, standards)
  .sdd/state.json    — Feature state tracking
  .sdd/hooks.json    — Hook configuration (PrePlan enabled by default)
  .sdd/api-docs/     — External API documentation cache (gitignored)
  specs/             — Feature specifications directory
  docs/adr/          — Architecture Decision Records directory

Next steps:
  - If this is a new product, start with /sdd:prd to define the product vision and scope
  - If you already have a clear product definition, go directly to /sdd:specify {feature description}
```

## Restrictions

- Do NOT auto-advance to `/sdd:prd` or `/sdd:specify` after init. Present the summary and stop.
- Do NOT read source code files. Only read directory listing and package manifest.
- Do NOT make assumptions about project architecture beyond what the manifest and directory structure reveal.
- If the user's answers to constitution questions are vague, ask for clarification. Do not generate vague principles.

$ARGUMENTS
