---
name: sdd-prd
description: >
  Generate a Product Requirements Document (PRD) as the foundation for Specification-Driven Development.
  Use when starting a new product, defining a new product vision, or when the user says "create PRD",
  "generate PRD", "product requirements", "define the product", "documento madre", or references
  needing a high-level product definition before writing feature specs. This is the first step
  in the SDD workflow — the PRD feeds context to all downstream /sdd:specify commands.
  Always use this skill before /sdd:specify when no PRD exists yet.
disable-model-invocation: true
argument-hint: "[product-name]"
user-invokable: true
---

# SDD PRD — Product Requirements Document Generator

The PRD is the strategic foundation of the SDD workflow. It defines WHAT you're building and WHY, without going into implementation details. Every feature spec (`/sdd:specify`) inherits context from the PRD.

## Philosophy

The PRD is not a technical document. It's a product document. No stack decisions, no data models, no API endpoints. Those belong in the feature specs. The PRD answers three questions: What problem are we solving? For whom? What does success look like?

This PRD is designed to be consumed by AI agents, not just read by humans. Every section exists because an agent downstream needs it: the spec-generator needs problem context and success criteria to write precise specs. The plan-architect needs system context to design integrations correctly. The task-decomposer needs domain vocabulary to name things consistently. The implementation-engine needs non-goals to know when to stop.

A traditional PRD tolerates ambiguity because humans ask clarifying questions. This PRD does not — because agents don't ask, they invent. Every gap you leave here will be filled with a guess downstream.

## Coaching Layer

Claude monitors the user's answers during the discovery interview. When it detects a common weakness, it intervenes with a brief, contextual correction — never abstract theory.

**Scaffolding triggers:**

| What Claude detects | What Claude does |
|---|---|
| User describes a solution instead of a problem ("I want to build a notification system") | Redirects to the pain point: "That sounds like a solution — what's the problem it solves? What's happening today that's painful for your team?" |
| User names users too broadly ("everyone", "the team", "our users") | Narrows: "Who feels the most pain? The sales rep who misses hot leads, or the manager who can't see pipeline? Their needs might shape this differently." |
| Success criteria written as features instead of outcomes ("Build a dashboard") | Reframes as measurable outcome: "That's a feature, not a success criterion. What would change if the dashboard worked perfectly? Maybe: 'Reduce time to identify top leads from 2 hours to 5 minutes'?" |
| Non-goals section is empty or vague | Prompts with a concrete boundary: "What should this product explicitly NOT do? For example, should it handle lead nurturing, or just scoring?" |
| Assumptions stated as certainties | Surfaces the risk: "You said leads always provide a valid phone number. Is that confirmed, or is it an assumption? If it's an assumption, it belongs in the Risks section — because if it's wrong, it changes the product." |
| User provides no system context ("it's standalone") | Probes: "Even standalone products have external dependencies — authentication, email, payments, hosting. What does your team already use that this product should work with?" |
| Domain terms used inconsistently (says "client" and "customer" interchangeably) | Clarifies: "I noticed you used 'client' and 'customer' — do they mean the same thing in your context, or are they different concepts? If they're different, we should define both." |

**Scaffolding rules:**
1. **Contextual, never abstract.** Never say "you should define measurable criteria." Instead, offer a concrete rewrite using the user's own data.
2. **One intervention at a time.** If multiple weaknesses appear in one answer, address the most impactful one first.
3. **Suggest, don't impose.** Every coaching intervention ends with a question or option, never a mandate. DO: "With your team size, defining buyer vs. user might shape this differently. What do you think?" DON'T: "You need to distinguish between buyer and user. Here's the difference."
4. **Business language first.** Introduce technical terms only when needed, always alongside their practical meaning.
5. **Use the user's project, not generic examples.** Reference the project description from `/sdd:init`, use their exact vocabulary, and make every coaching intervention feel like it was written for this specific project — not pulled from a template.
6. **Fade as competence grows.** Read `.sdd/state.json` field `coaching_profile` at the start of the discovery interview. For categories relevant to the PRD (`problem_vs_solution`, `user_specificity`, `measurable_outcomes`, `non_goals`, `system_context`, `domain_vocabulary`): when `unscaffolded` reaches 1, reduce coaching intensity. When it reaches 2+, skip coaching on that category entirely. A user who has already demonstrated they can frame problems correctly doesn't need to be redirected from solutions to problems again. **Cap `unscaffolded` increments at one per category per session.**

## Workflow

### Step 1: Discovery Interview

If `$ARGUMENTS` contains a product name or description, use it to seed the conversation.
Confirm it with the user: "I'll create a PRD for **[argument]**. Is that correct, or do you
want to adjust the scope?"
If `$ARGUMENTS` is empty, begin the discovery interview from scratch.

Before writing anything, conduct a focused interview. Ask questions ONE AT A TIME (never batch). Wait for confirmation before moving to the next question.

**Required questions (ask in this order):**

1. "What problem does this product solve? Describe the pain point as it exists today."
2. "Who experiences this problem? Be specific: role, context, frequency."
3. "What does the world look like if this product works perfectly? What changes?"
4. "What are the main functional areas or modules you envision? Don't worry about details, just the big blocks."
5. "Is there anything this product should explicitly NOT do? Boundaries help as much as features."
   - *Coaching trigger: If the user says "I don't know" or gives a vague answer, guide them:* "Think about the closest thing to your product that you do NOT want to build. For example, if you're building a CRM, you probably don't want to also build an email marketing platform — even though they're related. What's the boundary for your product?"
6. "What existing systems or platforms does this product need to connect with? Think about data sources, APIs, or tools your team already uses."
7. "Are there any terms in your business that could be ambiguous? For example, does 'user' mean the person using the product, or the account holder? Does 'conversion' mean a sale, a signup, or something else?"

**Conditional questions (ask only if relevant):**

- If B2B: "Who is the buyer vs. the user? Are they the same person?"
- If platform/marketplace: "Which side of the marketplace do you build for first?"
- If existing product: "What exists today that this replaces or extends?"

Do NOT proceed to Step 2 until the user has answered all required questions and confirmed they're ready.

### Step 2: Generate the PRD

Create the PRD as a Markdown file following this exact structure. Save to `specs/prd.md` (or `specs/PRD.md` if the user prefers).

```markdown
# [Product Name] — Product Requirements Document

**Version:** 1.0
**Date:** [YYYY-MM-DD]
**Author:** [name]
**Status:** Draft | Review | Approved

---

## 1. Context & Problem Statement

[2-3 paragraphs in narrative form. Describe the current situation, the pain point,
and why it matters. Include quantitative impact if available. This section should
make anyone — technical or not — understand why this product needs to exist.]

## 2. Vision & Success Criteria

[1 paragraph describing the desired end state. Then 3-5 measurable success criteria
written as outcomes, not features. Example: "Reduce average first-contact time
from 4 hours to 15 minutes" NOT "Build a notification system".]

## 3. Target Users & Personas

[For each persona: role, context, primary need, and how they interact with the product.
Keep it to 2-4 personas maximum. If buyer ≠ user, make that explicit.]

### Persona 1: [Role Name]
- **Context:** [When and where they encounter the problem]
- **Primary need:** [What they need from this product]
- **Current workaround:** [How they solve it today without this product]

### Persona 2: [Role Name]
[Same structure]

## 4. Product Modules

[High-level map of the main functional areas. Each module gets a short paragraph
explaining what it does and how it relates to other modules. No technical details.
Think of this as the table of contents for future feature specs.]

### Module: [Name]
[What this module does from the user's perspective. 2-3 sentences max.]

### Module: [Name]
[Same structure]

## 5. System Context

[Describe the technical ecosystem this product lives in. Not implementation
details — integration context. What does this product connect to? What does
it consume? What constraints does the existing system impose?]

### Existing Systems
[What systems, APIs, databases, or platforms does this product interact with?
Example: "Reads leads from HubSpot via API. Writes qualified leads to Salesforce.
Uses Stripe for payment processing."]

### Integration Constraints
[Non-negotiable technical boundaries imposed by the environment.
Example: "Must run on GCP (company standard). Must support Spanish and English.
All PII must stay in EU region (GDPR)."]

### Data Context
[What data does this product consume and produce? Not the schema — the business
meaning. Example: "Consumes lead contact data and interaction history. Produces
a qualification score and recommended next action."]

## 6. Domain Vocabulary

[Define the key terms of your domain. This is not optional — agents will use
these terms literally. If "lead" means something specific in your business,
define it here. If "conversion" has a precise definition, write it down.
Ambiguous vocabulary propagates through specs, code, and tests.]

| Term | Definition | NOT to be confused with |
|------|-----------|------------------------|
| [term] | [precise definition in business context] | [common confusion] |

## 7. Scope & Non-Goals

### In Scope
[What this product WILL do in its first version. Be specific enough to prevent
scope creep but not so detailed that it becomes a feature spec.]

### Non-Goals (Explicit)
[What this product will NOT do. Each non-goal should explain WHY it's excluded.
This is one of the most valuable sections — it prevents misaligned expectations.]

## 8. Assumptions & Risks

### Assumptions
[Things you're taking as true that, if wrong, would change the product direction.
Example: "We assume leads provide a valid phone number in 80%+ of cases."]

### Risks
[Things that could go wrong. For each risk, note the impact (high/medium/low)
and whether there's a mitigation strategy.]

## 9. Open Questions

[Things not yet decided that need resolution before certain features can be specified.
Each question should have an owner and a target date for resolution.]

- [ ] [Question] — Owner: [name] — By: [date]
```

### Step 3: Review & Confirm

After generating the PRD, present it to the user and ask:

1. "Does the problem statement capture the real pain accurately?"
2. "Are the success criteria measurable and aligned with what matters to you?"
3. "Are the non-goals correct? Is there anything listed in scope that shouldn't be, or vice versa?"
4. "Does the system context cover all the systems this product needs to interact with?"
5. "Is the domain vocabulary complete? Would someone outside your team understand every term?"

Do NOT mark the PRD as "Approved" until the user explicitly confirms. Leave status as "Draft" or "Review".

## Integration with SDD Workflow

Once the PRD is approved:
- Read `.sdd/state.json` first. If it does not exist, warn the user: "No SDD project found. Run `/sdd:init` first to set up the project before saving PRD state." Do not attempt to create or update state.json — init owns that file.
- If state.json exists, update it: `"prd": { "status": "approved", "path": "specs/prd.md", "approved_at": "{ISO 8601 timestamp}" }`
- **Update coaching_profile:** For each scaffolding category that applied during the interview, increment `scaffolded` if Claude had to intervene, or `unscaffolded` if the user demonstrated competence unprompted. Relevant PRD categories: `problem_vs_solution`, `user_specificity`, `measurable_outcomes`, `non_goals`, `system_context`, `domain_vocabulary`.
- When the user runs `/sdd:specify` for any feature, Claude should read the PRD first to inherit context
- The PRD's modules map directly to potential `/sdd:specify` targets

## Rules

1. **Never include technical decisions** in the PRD. No stack, no architecture, no data models. If the user starts going there, acknowledge it and note it for the future spec, but keep the PRD clean.
2. **One question at a time.** Never batch questions. Wait for the answer before asking the next one.
3. **Narrative over bullets.** The PRD should read like a document a non-technical stakeholder can understand and approve.
4. **Non-goals are mandatory.** A PRD without non-goals is incomplete. Push the user to define boundaries.
5. **Success criteria must be measurable.** If a criterion can't be measured, rewrite it until it can or flag it as an open question.
6. **Respect the user's domain expertise.** Claude provides structure and identifies gaps; the user provides business context and decisions.

$ARGUMENTS
