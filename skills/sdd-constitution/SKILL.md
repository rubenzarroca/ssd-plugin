---
name: sdd-constitution
description: "Define or edit the project's non-negotiable principles (architecture, testing, security, dependencies, code standards). Use when the user says 'set up rules', 'define principles', 'edit constitution', 'update project standards', 'what are our rules', or wants to establish or modify the project's technical guardrails."
argument-hint: "[category]"
user-invokable: true
---

# /sdd:constitution — Define or edit project principles

You are managing the project's constitution — the set of verifiable, non-negotiable principles that govern all implementation. Follow the instructions below based on whether `constitution.md` already exists in the project root.

First, check if `constitution.md` exists in the project root. Then branch:

- If it does NOT exist → **Create mode**
- If it exists → **Edit mode**

If `$ARGUMENTS` contains a specific category name (e.g., "testing", "architecture", "security", "dependencies", "code standards"), jump directly to that category instead of going through all categories sequentially.

---

## Create mode (constitution.md does not exist)

### Step 1: Read package manifest

Read the project's package manifest (`package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod`, or equivalent) to extract the full list of installed dependencies. You will need this for the Dependencies category.

Do NOT read source code files. Only the package manifest.

### Step 2: Guide user through questions by category

Ask questions one category at a time. Wait for the user's answer to each category before moving to the next. For each category, ask 1-2 focused questions:

**Architecture:**
- "What architectural pattern does this project follow? (e.g., monolith, microservices, modular monolith, serverless, App Router)"
- "Are there folder structure rules? (e.g., features in src/features/, colocated routes, tests next to source)"

**Testing:**
- "What's your testing approach? (e.g., unit + integration, E2E only, no tests yet)"
- "Any minimum coverage target? Test framework preference?"

**Security:**
- "How is authentication handled? (e.g., OAuth, JWT, session-based, Supabase Auth)"
- "Input validation approach? (e.g., zod schemas, manual, framework-provided)"

**Dependencies:**
- Present the full list of currently installed dependencies from the manifest (both production and dev).
- "Are all of these approved? Any that should be removed?"
- "What's the process for adding new dependencies?"

**Code Standards:**
- "Naming conventions? (e.g., camelCase functions, PascalCase components, kebab-case files)"
- "Any formatting/linting tools already configured? (e.g., prettier, eslint, biome)"

### Step 3: Convert answers to verifiable principles

For each answer the user gives, express it as a **verifiable principle** — something that can be checked programmatically or by review, not a vague guideline.

Examples of GOOD principles:
- "All React components use PascalCase. Files use kebab-case."
- "Allowed test frameworks: vitest, @testing-library/react. No jest."
- "All API routes validate input with zod schemas before processing."
- "New dependencies require explicit approval. No dependencies with fewer than 1,000 weekly downloads."

Examples of BAD principles (do NOT generate these):
- "Follow good naming practices."
- "Use appropriate testing tools."
- "Keep the code secure."
- "Use well-maintained libraries."

If the user's answer is vague, ask for clarification. Do NOT generate a vague principle to fill the space.

### Step 4: Generate constitution.md

Create `constitution.md` in the project root with this structure:

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

- All features go through the SDD lifecycle (specify -> clarify -> plan -> tasks -> implement -> validate).
- No implementation without a reviewed spec.
- No scope creep during implementation -- report blockers instead.
```

Fill each section with the verifiable principles derived from the user's answers. The Process section is fixed and should always be included as shown.

### Step 5: Present the result

Show the full generated constitution.md to the user for review. If they want changes, apply them immediately.

---

## Edit mode (constitution.md exists)

### Step 1: Read existing constitution

Read `constitution.md` from the project root.

### Step 2: Present current principles

Display the current principles organized by category. Use this format:

```
Current constitution:

**Architecture:**
- {principle 1}
- {principle 2}

**Testing:**
- {principle 1}
...
```

### Step 3: Ask what to modify

Ask the user: "Which category or principle would you like to modify? You can also add new principles to any category."

If `$ARGUMENTS` specified a category, skip this question and jump directly to that category — present only that category's principles and ask what to change.

### Step 4: Apply changes

Use the Edit tool to update `constitution.md` in-place. Do NOT rewrite the entire file — only modify the sections that changed.

After editing, show the updated section to confirm the changes.

---

## Restrictions

- Do NOT modify `.sdd/state.json`. The constitution is independent of the feature lifecycle.
- Do NOT read source code files. Only read the package manifest (for dependency listing) and `constitution.md` itself.
- If the user's answers are vague, ask for clarification. Do NOT generate vague or non-verifiable principles.
- Do NOT suggest running any other `/sdd:*` command after finishing. Present the result and stop.
- The constitution.md header note ("This document takes precedence over CLAUDE.md in case of conflict.") must always be present.

$ARGUMENTS
