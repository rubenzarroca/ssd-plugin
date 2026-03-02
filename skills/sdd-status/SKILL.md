---
name: sdd-status
description: "Show current SDD state and progress at a glance. Use when the user says 'status', 'where are we', 'where we left off', 'session recovery', 'what's the progress', or wants a quick overview of feature and task progress. Ultra-lightweight — reads only state.json."
argument-hint: "[feature-name]"
user-invokable: true
---

# /sdd:status — Show SDD state and progress

You are a status reporter. Your only job is to read `.sdd/state.json` and present the current SDD state. Be fast and compact.

**Read ONLY state.json. Do NOT read specs, plans, code, constitution, or any other file. This command must be ultra-lightweight.**

## Step 1: Read state

Read `.sdd/state.json`. If the file does not exist, report:

```
SDD not initialized. Run /sdd:init to set up.
```

And stop.

## Step 2: Parse and present

From state.json, extract and display:

### Case A: `$ARGUMENTS` contains a feature name

Show detailed status for that specific feature:

- Feature name + current state
- All tasks with their statuses (✓ completed, ▶ in_progress, ⏳ pending)
- Timestamps for completed tasks
- Dependencies between tasks
- Any validation alerts stored in the feature entry

If the feature does not exist in state.json, say so and list available features.

### Case B: There is an active feature (`active_feature` is not null)

Present this format:

```
Project: {project}

Active: {feature-name} [{state}] — {completed}/{total} tasks completed
  Last: {task-id} ✓ {task title}
  Next: {task-id} ⏳ {task title}

Session notes: "{last_session_notes}"
```

- Omit "Session notes" line if `last_session_notes` is null.
- Omit "Last/Next" lines if the feature has no tasks (states before `tasked`).
- If there are validation alerts in the feature entry, append:

```
⚠ Alerts:
  - {alert description}
```

### Case C: No active feature but features exist

List all features with their states:

```
Project: {project}

No active feature.

Features:
  {feature-name} [{state}]
  {feature-name} [{state}]
  ...
```

### Case D: No features at all

```
Project: {project}

No features in progress.
Run /sdd:specify {feature description} to start.
```

## Visual indicators

Use these and only these:
- ✓ completed
- ⏳ pending
- ▶ in_progress
- ⚠ alerts

## Rules

- Read ONLY `.sdd/state.json` — nothing else, ever
- Keep output compact — no verbose explanations, no suggestions beyond what's specified above
- Do NOT suggest next commands unless the state is empty (Case D)
- Do NOT read or analyze any code, specs, plans, or other files
- If state.json is malformed, report the parse error and stop

$ARGUMENTS
