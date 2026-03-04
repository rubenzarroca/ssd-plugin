import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ArtifactReader } from "../artifacts/reader.js";
import type { ApiListOutput } from "../types.js";

export function registerApiList(server: McpServer, artifactReader: ArtifactReader): void {
  server.registerTool(
    "sdd_api_list",
    {
      description:
        "List cached external API documentation. Returns a lightweight index: service name, auth type, and endpoint summaries. Use to verify docs exist before planning or implementing.",
      inputSchema: {
        service: z
          .string()
          .optional()
          .describe("Filter by service name. Omit to list all cached services."),
      },
    },
    async ({ service }) => {
      const allDocs = service
        ? [await artifactReader.readApiDocs(service)].filter(Boolean)
        : await artifactReader.listApiDocs();

      if (allDocs.length === 0) {
        const message = service
          ? `No API docs found for service "${service}". Run /sdd:api-docs ${service} to fetch and cache the documentation.`
          : "No API docs cached. Run /sdd:api-docs <service-name> to fetch external API documentation.";

        return {
          content: [{ type: "text" as const, text: JSON.stringify({ services: [], message }) }],
        };
      }

      const output: ApiListOutput = {
        services: allDocs.map((doc) => ({
          service: doc!.service,
          base_url: doc!.base_url,
          auth_type: doc!.auth.type,
          endpoint_count: doc!.endpoints.length,
          endpoints: doc!.endpoints.map((ep) => ({
            method: ep.method,
            path: ep.path,
            purpose: ep.purpose,
          })),
          fetched_at: doc!.fetched_at,
        })),
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
      };
    }
  );
}
