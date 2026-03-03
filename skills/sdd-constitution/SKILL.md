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

## Coaching Layer

The constitution is the highest-authority document in the project — every spec, plan, and validation checks against it. Weak principles cascade into every downstream step.

**Create mode:** Use the same scaffolding triggers as sdd-init's coaching layer — detect vague answers, non-verifiable principles, and deferred decisions. Propose concrete options grounded in the detected stack. Read `.sdd/state.json` field `completed_features`: on the first feature (`0`), explain what makes a principle verifiable with examples from the user's own project. On subsequent sessions, skip the explanation.

**Edit mode scaffolding:**

| What Claude detects | What Claude does |
|---|---|
| Overly broad new rule ("no external dependencies") | Flag the impact: "This would prevent using any npm package, including ones you already use. Did you mean 'no new dependencies without approval'?" |
| Overly specific rule ("always use lodash.debounce") | Suggest abstraction: "This locks you to one library. Would 'all debounce logic must go through a shared utility' work better? You can swap the implementation later." |
| Rule contradicts existing principle | Surface the conflict: "This conflicts with [existing rule]. Which one takes priority? We should resolve this so validate doesn't flag false violations." |
| Rule duplicates a tool's enforcement | Note the redundancy: "Your ESLint config already enforces this — adding it here means two places to maintain. Keep it in one place, or add it here as documentation?" |

**Calibration:** Read `coaching_profile` for the relevant category. If the user is strong in that category (e.g., `security` has `unscaffolded >= 2`), trust their input and coach only when a genuine issue is detected.

---

## Create mode (constitution.md does not exist)

### Pre-check: Verify SDD is initialized

Check if `.sdd/state.json` exists. If it does not, warn the user: "SDD is not initialized in this project. The constitution is created as part of `/sdd:init`, which also sets up project detection, state tracking, and the specs workflow. Run `/sdd:init` to set up everything at once." Then stop — do not proceed with a standalone constitution creation.

If state.json exists, proceed to Step 1.

### Step 1: Read package manifest

Read the project's package manifest (`package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod`, or equivalent) to extract the full list of installed dependencies. You will need this for the Dependencies category.

Do NOT read source code files. Only the package manifest.

### Step 2: Guide user through questions by category

Ask questions one category at a time. Wait for the user's answer to each category before moving to the next. For each category below, first explain in one sentence what the category means in practical terms, then ask the questions. If the user doesn't know the answer to a question, say: "That's fine — we can leave this open and refine it later as we build." Never pressure the user to answer questions they aren't ready for.

**Use AskUserQuestionTool for questions with discrete options.** Most constitution questions have natural choices — present them as selectable options so the user can decide quickly. Use the description field to explain each option's implications. The user can always pick "Other" for a non-standard setup. For open-ended questions (like folder structure rules or naming conventions), ask conversationally instead.

**Architecture** — _This is about how the different pieces of your application are organized and communicate with each other._
- "What architectural pattern does this project follow?" → Use AskUserQuestionTool with options like: Monolith, Modular monolith, Microservices, Serverless — each with a one-sentence description of when it fits.
- "Are there folder structure rules?" → Ask conversationally (open-ended).

**Testing** — _This is about how you verify that your code works correctly before shipping._
- "What's your testing approach?" → Use AskUserQuestionTool with options like: Unit + integration, E2E only, No tests yet — with descriptions of what each implies for the constitution.
- "Any minimum coverage target? Test framework preference?" → Ask conversationally (project-specific).

**Security** — _This is about how your application verifies who users are and protects their data._
- "How is authentication handled?" → Use AskUserQuestionTool with options like: OAuth, JWT, Session-based, Auth provider (Supabase/Auth0/Clerk) — with descriptions.
- "Input validation approach?" → Use AskUserQuestionTool with options like: Zod schemas, Framework-provided, Manual validation — with descriptions.

**Dependencies** — _These are the external libraries your project uses. Controlling them prevents surprises._
- Present the full list of currently installed dependencies from the manifest (both production and dev).
- "Are all of these approved? Any that should be removed?" → Ask conversationally (requires reviewing the list).
- "What's the process for adding new dependencies?" → Use AskUserQuestionTool with options like: No restrictions, Explicit approval required, Allowlist only — with descriptions.

**Code Standards** — _These are the formatting and naming rules that keep the codebase consistent._
- "Naming conventions?" → Ask conversationally (too varied for options).
- "Any formatting/linting tools already configured? (e.g., prettier, eslint, biome)" → Ask conversationally (project-specific).

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

**Why verifiable?** These principles aren't just guidelines — they're rules that `/sdd:validate` checks programmatically when your feature is built. "Follow good naming practices" is impossible to verify automatically. "All React components use PascalCase" can be checked in every file. The more specific your principles, the more useful the automated compliance checks become.

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

**Important context for edits:** Changing the constitution affects all future specs and validations. If you have a feature in progress, the new rules will apply to its next validation — existing code may be flagged for rules that didn't exist when it was written. This is intentional: the constitution represents how you want things to be going forward, not how they were. Explain this to the user before making changes.

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

**Use AskUserQuestionTool** to ask which category to modify. Present each category from the existing constitution as a selectable option (Architecture, Testing, Security, Dependencies, Code Standards, etc.), with a brief summary of the current principles as the description. Include "Add new category" as an option.

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
