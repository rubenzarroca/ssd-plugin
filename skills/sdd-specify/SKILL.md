---
name: sdd-specify
description: "Create a feature specification from a description. Use when the user wants to spec a feature, write a spec, define requirements, says 'specify feature', 'write spec for', 'define what X should do', or starts describing a new feature to build. First step of SDD after init."
argument-hint: "feature-name: description of the feature"
user-invokable: true
---

# /sdd:specify — Create a feature specification

You are creating a feature specification from a description. This is the first step in the SDD lifecycle after init. Follow these steps exactly, in order. Do NOT skip steps. Do NOT read source code — only constitution.md and state.json.

## Step 1: Read and validate state

Read `.sdd/state.json`. Check if the feature name (parsed from arguments in Step 3) already exists in `features`:

- If it exists with state `specified`: warn the user that re-specifying will overwrite the existing spec. Ask for confirmation before continuing.
- If it exists with a state **beyond** `specified` (e.g., `clarified`, `planned`, `tasked`, `implementing`, `validating`, `completed`): warn the user that re-specifying will reset the feature to `specified` state, potentially invalidating clarifications, plans, tasks, and implementation work. Ask for explicit confirmation before continuing.
- If it doesn't exist: proceed normally.

## Step 2: Read constitution

Read `constitution.md` to internalize the project's non-negotiable principles. These principles must inform the spec — every requirement you generate should be compatible with the constitution. Do NOT read any other files.

## Step 3: Parse arguments

Parse the feature name and description from `$ARGUMENTS`. Expected format:

```
/sdd:specify feature-name: A description of what the feature should do
```

If `$ARGUMENTS` is empty or doesn't contain a clear feature name and description, ask the user to provide them in the format above. Do not proceed without both.

Extract:
- **Feature name**: the part before the colon (kebab-case, e.g., `user-auth`, `dark-mode`, `export-csv`). If not kebab-case, convert it.
- **Description**: everything after the colon.

## Step 4: Ask clarification questions

Analyze the description for gaps, ambiguities, and missing details. Identify up to 5 areas where the description is insufficient to write a complete spec.

**Ask questions ONE AT A TIME.** Ask the first question, wait for the user's answer, then ask the next question. Do NOT batch all questions together. Each question should build on previous answers when relevant.

Types of gaps to look for:
- **Scope boundaries**: What is explicitly NOT included?
- **User interactions**: Who uses this and how?
- **Edge cases**: What happens when inputs are invalid, empty, or at limits?
- **Integration points**: How does this connect to existing functionality?
- **Non-functional expectations**: Performance targets, security requirements, accessibility needs?

If the description is exceptionally detailed and you identify fewer than 5 gaps, ask only the questions that matter. Do not invent unnecessary questions.

After all questions are answered, proceed to Step 5.

## Step 5: Generate spec.md

Generate the specification document with these exact sections:

```markdown
# Spec: {Feature Name}

## Context

{Why this feature is needed. Reference the project's current state and what gap this fills.}

## Problem Statement

{What specific problem this feature solves. Be precise — not "users need X" but "currently, users cannot X because Y, which causes Z."}

## Proposed Solution

{High-level approach. Describe WHAT will be built, not HOW it will be implemented. Implementation details belong in the plan, not the spec.}

## Functional Requirements

1. {Requirement — specific, testable, unambiguous}
2. {Requirement}
3. ...

## Non-Functional Requirements

1. {Performance, security, accessibility, compatibility, or other quality requirements}
2. ...

## Acceptance Criteria

### AC-1: {Title}
- **Given** {precondition}
- **When** {action}
- **Then** {expected result}

### AC-2: {Title}
- **Given** {precondition}
- **When** {action}
- **Then** {expected result}

{Add as many acceptance criteria as needed to cover all functional requirements.}

## Out of Scope

- {Explicit exclusion 1}
- {Explicit exclusion 2}
- ...

## Clarifications

{Empty — this section is populated by /sdd:clarify}
```

Every functional requirement must have at least one corresponding acceptance criterion. Acceptance criteria must use Given/When/Then format exclusively.

## Step 6: Save the spec

Save the generated spec to `specs/{feature-name}/spec.md`. Create the `specs/{feature-name}/` directory if it doesn't exist.

## Step 7: Update state.json

Read `.sdd/state.json` again (to avoid stale data). Update it:

- Add (or replace) the feature entry under `features.{feature-name}`:

```json
{
  "state": "specified",
  "created_at": "{ISO 8601 timestamp}",
  "transitions": [
    {
      "from": null,
      "to": "specified",
      "at": "{ISO 8601 timestamp}",
      "command": "sdd-specify"
    }
  ],
  "tasks": {}
}
```

- If the feature already existed (re-spec scenario), preserve `created_at` but reset `transitions` to only the new transition and reset `tasks` to empty.
- Set `active_feature` to the feature name.

Write the updated state.json.

## Step 8: Present the spec

Display the complete spec.md content to the user for review. After presenting it, stop and wait for the user's feedback.

## Restrictions

- Do NOT suggest `/sdd:clarify` or `/sdd:plan`. Present the spec and wait for user confirmation.
- Context budget: Read ONLY `constitution.md` and `.sdd/state.json`. Do NOT read source code files, package manifests, or any other project files.
- Questions must be asked one at a time, sequentially. Never batch all questions together.
- Do NOT generate implementation details in the spec. The spec describes WHAT, not HOW.
- If the user's description is too vague to even start asking questions, say so and ask for a more detailed description before proceeding.

$ARGUMENTS
