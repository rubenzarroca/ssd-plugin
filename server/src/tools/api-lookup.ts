import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ArtifactReader } from "../artifacts/reader.js";
import type { ApiLookupOutput } from "../types.js";

const VALID_SECTIONS = ["auth", "rate_limits", "sdk", "endpoint", "all"] as const;

export function registerApiLookup(server: McpServer, artifactReader: ArtifactReader): void {
  server.registerTool(
    "sdd_api_lookup",
    {
      description:
        "Surgical lookup into cached API documentation. Returns only the requested section — auth config, rate limits, SDK info, or a specific endpoint's full contract (request/response/errors). Use during implementation to get exact API details without loading the entire doc.",
      inputSchema: {
        service: z.string().describe("Service name (e.g., 'stripe', 'bigquery')"),
        section: z
          .enum(VALID_SECTIONS)
          .describe(
            "Section to retrieve: 'auth', 'rate_limits', 'sdk', 'endpoint', or 'all' for the complete doc"
          ),
        endpoint: z
          .string()
          .optional()
          .describe(
            "Required when section='endpoint'. Format: 'METHOD /path' (e.g., 'POST /charges', 'GET /users/:id')"
          ),
      },
    },
    async ({ service, section, endpoint }) => {
      const docs = await artifactReader.readApiDocs(service);

      if (!docs) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: "service_not_found",
                service,
                hint: `No cached docs for "${service}". Run /sdd:api-docs ${service} to fetch and cache the documentation.`,
              }),
            },
          ],
          isError: true,
        };
      }

      let data: unknown;

      switch (section) {
        case "auth":
          data = docs.auth;
          break;

        case "rate_limits":
          data = docs.rate_limits ?? { message: "No rate limit info cached for this service." };
          break;

        case "sdk":
          data = docs.sdk ?? { message: "No SDK info cached for this service." };
          break;

        case "endpoint": {
          if (!endpoint) {
            // Return all endpoints as a summary
            data = docs.endpoints.map((ep) => ({
              method: ep.method,
              path: ep.path,
              purpose: ep.purpose,
            }));
            break;
          }

          // Parse "METHOD /path" format
          const parts = endpoint.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+)$/i);
          if (!parts) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify({
                    error: "invalid_endpoint_format",
                    endpoint,
                    hint: "Use format: 'METHOD /path' (e.g., 'POST /charges')",
                  }),
                },
              ],
              isError: true,
            };
          }

          const [, method, path] = parts;
          const match = docs.endpoints.find(
            (ep) =>
              ep.method.toUpperCase() === method!.toUpperCase() &&
              ep.path === path
          );

          if (!match) {
            // Fuzzy match: try path-only match
            const pathMatches = docs.endpoints.filter((ep) => ep.path === path);
            if (pathMatches.length > 0) {
              data = {
                message: `No exact match for ${method} ${path}. Found these endpoints for ${path}:`,
                matches: pathMatches,
              };
            } else {
              data = {
                message: `Endpoint ${method} ${path} not found in cached docs.`,
                available: docs.endpoints.map((ep) => `${ep.method} ${ep.path}`),
              };
            }
          } else {
            data = match;
          }
          break;
        }

        case "all":
          data = docs;
          break;
      }

      const output: ApiLookupOutput = { service, section, data };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
      };
    }
  );
}
