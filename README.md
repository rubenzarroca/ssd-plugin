# SDD — Spec Driven Development for Claude Code

**The AI coding framework for people who think in business logic, not in code.**

Stop vibe coding. Start building with specs — and learn to write better ones along the way.

## Why SDD

**Without SDD** — You tell Claude "build me an OAuth2 login". Claude makes 200 decisions for you: session duration, token storage, error handling, refresh strategy, redirect flows. Each decision is reasonable in isolation, but they don't align with each other or with your architecture. You ship fast, understand little, and the next feature conflicts with the first.

**With SDD** — You specify what you actually need through a guided interview. Claude coaches you on gaps ("You haven't defined token refresh — with your expected 10k daily users, silent refresh with rotation would prevent session drops. Want me to add that?"). Every requirement is explicit before any code is written. You ship at the same speed, but you understand what you shipped and it holds together.

## The learning arc

SDD embeds a learning cycle into the development workflow. You don't study first and build later — you learn *by building*, with scaffolding that adapts to your level and fades as you improve.

**Coached specification** — During `/sdd:specify`, Claude monitors your input for vague requirements, missing edge cases, untestable criteria. Instead of silently fixing your input, it offers a concrete alternative using your actual data. If you say "the system must be fast," Claude will say: "With your current volume of 500 leads per week, a P95 response time of 500ms would keep the team flowing. Want me to set that as the threshold?" The coaching fades as your specs improve — no levels, no badges.

**Guided practice** — During `/sdd:implement --pair`, Claude generates the file structure, imports, and boilerplate, but leaves `// YOUR TURN:` markers where the business logic goes. You write the parts that matter most. The difficulty adapts: simpler hints on your first features, more open-ended challenges as your profile grows.

**Reflection** — After completing a feature, `/sdd:retro` asks 2 reflective questions and summarizes how your coaching profile changed. A 2-minute debrief to consolidate what you learned.

**Annotated examples** — `docs/examples/` contains two reference specs (a simple webhook and a complex scoring engine with external API integration) with inline learning notes explaining *why* each section is written the way it is.

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

## For existing projects

SDD is designed for incremental adoption:

1. **Run `/sdd:init`** on your existing project. It analyzes what's there and adapts. No retroactive spec writing needed.
2. **Use SDD for new features only.** Existing code stays outside of SDD scope.
3. **Optionally**, use `/sdd:validate` on legacy code by creating a retroactive spec, then checking for divergences.

## Full documentation

For detailed workflow documentation, state machine reference, MCP server setup, hooks, and project structure, see [Full Reference](docs/REFERENCE.md).

## Author

Built by Rubén Zarroca — a CFO who learned to build with AI and wanted a better way to do it. Designed for teams that want AI-assisted development without the chaos, and without losing the ability to think for themselves.

## License

MIT
