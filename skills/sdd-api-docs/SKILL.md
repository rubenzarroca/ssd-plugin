---
name: sdd-api-docs
description: "Fetch, read, and cache external API documentation before planning or implementing integrations. Use when the user says 'fetch api docs', 'cache api', 'api-docs', 'document external api', or when /sdd:plan detects external services without cached docs. Prevents Claude from assuming API behavior based on training data."
argument-hint: "<service-name> [docs-url]"
user-invokable: true
---

# /sdd:api-docs — Fetch and cache external API documentation

You are fetching real documentation for an external API/service and caching it locally so that all downstream SDD commands (plan, implement) use verified API contracts instead of assumptions from training data.

**Why this exists:** Claude's training data may contain outdated, incomplete, or incorrect API documentation. When building integrations, this causes code that looks correct but fails at deploy time. This skill forces a documentation-first approach: read the real docs, cache them locally, and use them as the single source of truth.

## Step 1: Parse arguments

Parse from `$ARGUMENTS`:
- **Service name** (required): kebab-case identifier (e.g., `stripe`, `bigquery`, `holded-api`)
- **Docs URL** (optional): direct URL to the API documentation

If no service name is provided, ask: "Which external service do you need to document? Give me the name and optionally the URL to its API docs."

## Step 2: Check for existing cache

Check if `.sdd/api-docs/{service-name}.json` already exists by calling `sdd_api_list` with the service name.

If it exists, report:
- When it was fetched (`fetched_at`)
- How many endpoints are cached
- Ask: "Documentation for `{service}` is already cached (fetched {date}). Do you want to refresh it or keep the current version?"

If the user wants to keep it, stop.

## Step 3: Locate documentation

### If a docs URL was provided:
Use `WebFetch` to read the documentation page. If the page is large or paginated, fetch the most relevant sections:
1. Authentication / Authorization
2. API reference / Endpoints
3. Rate limits
4. Error codes
5. SDKs / Libraries

### If no URL was provided:
Use `WebSearch` to find the official API documentation:
- Search: `"{service-name}" API documentation site:docs OR site:developer`
- Identify the official documentation site (prefer official docs over third-party tutorials)
- Use `WebFetch` on the official docs pages

### Multi-page documentation:
Most API docs span multiple pages. Follow this strategy:
1. Fetch the main API reference/overview page first
2. Identify the endpoints relevant to the project (cross-reference with the feature spec if one exists in `.sdd/state.json`)
3. Fetch individual endpoint documentation pages as needed
4. Stop when you have enough detail for the endpoints the project will actually use — do NOT try to document the entire API

## Step 4: Extract and structure

From the fetched documentation, extract and organize into this structure:

```json
{
  "service": "{service-name}",
  "base_url": "{base API URL}",
  "auth": {
    "type": "{bearer|api_key|oauth2|basic|custom}",
    "header": "{header name, e.g., Authorization}",
    "notes": "{any important auth details — token format, scopes, etc.}"
  },
  "rate_limits": {
    "rpm": null,
    "rps": null,
    "notes": "{rate limit details from the docs}"
  },
  "endpoints": [
    {
      "method": "{GET|POST|PUT|PATCH|DELETE}",
      "path": "{/endpoint/path}",
      "purpose": "{one-line description}",
      "request": {},
      "response": {},
      "errors": [
        { "code": 400, "meaning": "{when this happens}" }
      ]
    }
  ],
  "sdk": {
    "package": "{npm/pip package name}",
    "version": "{recommended version}",
    "notes": "{installation, initialization}"
  },
  "fetched_at": "{ISO 8601 timestamp}",
  "source_url": "{URL where docs were fetched from}"
}
```

### Extraction rules:

1. **Request/response shapes must come from the docs, not from memory.** If the docs show a field called `amount_in_cents`, use that — do not normalize to `amount`. The whole point is to capture the real API contract.

2. **Include all error codes documented.** Error handling is where assumptions cause the most deploy failures.

3. **Capture auth details precisely.** Token format, required headers, scopes, API key placement (header vs query param) — these details matter.

4. **Rate limits matter for architecture.** If the docs mention rate limits, capture them. They affect retry logic, caching decisions, and queue design.

5. **Only document endpoints the project needs.** If the feature spec exists, cross-reference it. A project using Stripe for payments doesn't need the Stripe Connect endpoints documented.

6. **When the docs are ambiguous or unclear**, note it in the `notes` field rather than guessing. Example: `"notes": "Docs unclear on whether pagination is cursor-based or offset-based. Verify with a test call."`

## Step 5: Save the cache

Ensure `.sdd/api-docs/` directory exists. Save the structured JSON to `.sdd/api-docs/{service-name}.json`.

## Step 6: Verify with MCP

Call `sdd_api_list` with the service name to verify the cache was saved correctly. Report:

```
API documentation cached for {service-name}:
  Source: {source_url}
  Auth: {auth.type}
  Endpoints: {N} documented
  Rate limits: {summary or "not documented"}
  SDK: {package@version or "none"}

Cached at: .sdd/api-docs/{service-name}.json

This documentation will be used by:
  - /sdd:plan — to verify external dependencies before planning
  - /sdd:implement — to load exact API contracts when building integration tasks

To refresh: /sdd:api-docs {service-name} [new-url]
```

## Step 7: Show endpoint index

List all cached endpoints in a compact table:

```
| Method | Path | Purpose |
|--------|------|---------|
| POST | /charges | Create a new charge |
| GET | /charges/:id | Retrieve a charge |
```

Ask: "Are these the endpoints you'll need, or should I fetch docs for additional ones?"

If the user requests additional endpoints, go back to Step 3 targeting those specific endpoints, then merge into the existing cache file.

## Restrictions

- Do NOT invent or assume API details. Every field in the output must come from the fetched documentation. If something isn't in the docs, leave it as `null` or omit it — never fill it from training data.
- Do NOT modify any project source code. This command produces only the cache file.
- Do NOT read project source code. Only read state.json (to cross-reference feature specs) and the external documentation.
- Context budget: the fetched docs may be large. Extract what's needed and discard the rest. The structured JSON is the deliverable, not a copy of the full docs.
- If WebFetch fails (e.g., docs behind auth wall, CORS issues), report clearly: "Could not fetch docs from {url}. You may need to provide the documentation manually. Create `.sdd/api-docs/{service}.json` with the structure shown above, or paste the relevant docs and I'll structure them for you."

$ARGUMENTS
