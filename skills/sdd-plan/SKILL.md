---
name: sdd-plan
description: "Design the technical approach for a specified feature. Use when the user says 'plan the feature', 'design the architecture', 'how should we build this', 'create a technical plan', or wants to move from spec to implementation design. Generates plan.md and an ADR. Runs after /sdd:clarify."
argument-hint: "[feature-name]"
user-invokable: true
---

# /sdd:plan — Design the technical approach

You are designing the technical approach for a feature that has been fully specified and clarified. Follow these steps exactly, in order. Do NOT skip steps. Do NOT read source code — only spec.md, constitution.md, and state.json. Source code analysis belongs to the tasks phase.

## Step 1: Read and validate state

Read `.sdd/state.json`. Check the feature's current state:

- If the feature is in state `clarified`: proceed normally.
- If the feature is in any other state: tell the user what state it is in and what command to run first. For example:
  - `drafting` or `specified` → "This feature needs clarification first. Run `/sdd:clarify {feature-name}`."
  - `planned` or beyond → "This feature already has a plan. Re-planning will overwrite the existing plan and ADR." Ask for explicit confirmation before continuing.
- If no feature is found: list available features from state.json and ask the user which one to plan.

## Step 2: Parse feature name

Parse the feature name from `$ARGUMENTS`.

- If a feature name is provided: use it. Verify it exists in `state.json` features.
- If `$ARGUMENTS` is empty: check `active_feature` in state.json. If set, use it.
- If no active feature and no argument: list all features with their current states and ask the user which one to plan. Do not proceed without a feature name.

## Step 3: Read the spec

Read `specs/{feature-name}/spec.md`. This is the full specification including any clarifications added by `/sdd:clarify`. Internalize:

- Functional requirements
- Non-functional requirements
- Acceptance criteria
- Out of scope items
- Clarifications

## Step 4: Read the constitution

Read `constitution.md`. The technical plan must respect every principle defined here. Architecture decisions that conflict with the constitution are not valid options.

## Step 5: Generate the technical plan

Based on the spec and constitution, generate a technical plan with these sections:

### Architecture

Describe how the feature fits into the existing codebase. Cover:
- Components or modules involved
- Data flow (where data originates, how it transforms, where it lands)
- Integration points with existing systems
- Patterns to follow (consistent with constitution)

### Dependencies

List everything needed:
- External packages (with version constraints if relevant)
- Internal modules that will be used or extended
- APIs or services consumed
- Database tables or views affected

### Files Affected

List every file that will be created or modified:
- Mark each as `[create]` or `[modify]`
- Group by logical area (e.g., components, API routes, utilities, tests)

### Risks and Trade-offs

Identify what could go wrong and what compromises are being made:
- Technical risks (performance, compatibility, complexity)
- Scope risks (what might grow beyond the spec)
- Trade-offs (speed vs. thoroughness, simplicity vs. flexibility)

## Step 6: Present alternatives (if applicable)

If there are genuinely different architectural approaches to implement this feature:

- Present a maximum of 2-3 options.
- For each option, provide:
  - A short name (e.g., "Option A: Server-side rendering", "Option B: Client-side with API")
  - Pros (bullet list)
  - Cons (bullet list)
  - Constitution compatibility note (any tensions with defined principles)
- Ask the user to choose. Wait for their answer before proceeding to Step 7.

If there is only one reasonable approach: state it clearly and explain briefly why alternatives were not considered. Move directly to Step 7 without asking the user to choose.

## Step 7: Generate the ADR

An ADR (Architecture Decision Record) MUST be generated regardless of whether there were alternatives. Even if the approach is straightforward, document it.

### Determine ADR number

Read the `docs/adr/` directory listing. If the directory doesn't exist, create it. Determine the next ADR number:

- If no ADR files exist: use `001`.
- If ADR files exist (e.g., `001-some-decision.md`, `002-another.md`): use the next sequential number (e.g., `003`).

### Create the ADR file

Create `docs/adr/NNN-{decision-title}.md` where `{decision-title}` is a kebab-case summary of the decision. Use this exact format:

```markdown
# ADR-NNN: {Decision Title}

**Date**: {YYYY-MM-DD}
**Status**: Accepted
**Feature**: {feature-name}

## Context
{Why this decision was needed. Reference the feature spec and the problem it solves.}

## Alternatives Considered
{List each alternative with its pros and cons. If there was only one viable approach, state: "No viable alternatives. The approach described below was the only option consistent with the project's constitution and requirements." and briefly explain why.}

## Decision
{What was decided. If the user chose between options, reference their choice. If there was only one approach, state it directly.}

## Consequences
{Positive and negative impacts of this decision. Be honest about downsides.}
```

## Step 8: Save the plan

Save the plan to `specs/{feature-name}/plan.md` with this exact structure:

```markdown
# Plan: {Feature Name}

## Architecture
{Architecture description from Step 5}

## Dependencies
{Dependencies list from Step 5}

## Files Affected
{File list with [create]/[modify] annotations from Step 5}

## Risks and Trade-offs
{Risk analysis from Step 5}

## Decision
See docs/adr/NNN-{decision-title}.md
```

## Step 9: Update state.json

Read `.sdd/state.json` again (to avoid stale data). Update it:

- Set `features.{feature-name}.state` to `"planned"`.
- Append a new transition record:

```json
{
  "from": "clarified",
  "to": "planned",
  "at": "{ISO 8601 timestamp}",
  "command": "sdd-plan"
}
```

- Keep `active_feature` set to the feature name.

Write the updated state.json.

## Step 10: Present the plan

Display the complete plan.md content and the ADR to the user for review. After presenting them, stop and wait for the user's feedback.

## Restrictions

- Do NOT suggest `/sdd:tasks`. Present the plan and wait for confirmation.
- Context budget: Read ONLY `specs/{feature-name}/spec.md`, `constitution.md`, and `.sdd/state.json`. Do NOT read source code files. Source code analysis belongs to the tasks phase, not the planning phase.
- An ADR MUST always be generated, even if there is only one viable approach. If the feature is small enough that no meaningful architectural decisions are needed, generate a minimal ADR documenting the straightforward approach chosen.
- If alternatives exist, present a maximum of 2-3 options. Do not overwhelm with choices.
- The plan describes HOW to build the feature, but does NOT decompose it into tasks. Task decomposition is the responsibility of `/sdd:tasks`.
- Do NOT implement anything. This command produces documents only.

$ARGUMENTS
