import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import FAKE_HOTELS from "./hotels.json" with { type: "json" };

// Works both from source (src/server/server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "../../dist")
  : import.meta.dirname;

/**
 * Creates a new MCP server instance with tools and resources registered.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Hotel Search MCP App",
    version: "1.0.0",
  });

  const resourceUri = "ui://search-hotels/mcp-app.html";

  registerAppTool(
    server,
    "search-hotels",
    {
      title: "Search Hotels",
      description: "Search for available hotels in a city.",
      inputSchema: {
        city: z.string().describe("City name to search in"),
        stateCode: z
          .string()
          .optional()
          .describe("State/province code (required for US/Canada)"),
        countryCode: z
          .string()
          .default("US")
          .describe("ISO country code (e.g. US, CA, MX)"),
        checkinDate: z
          .string()
          .optional()
          .describe("Check-in date in MM-DD-YYYY format"),
        checkoutDate: z
          .string()
          .optional()
          .describe("Check-out date in MM-DD-YYYY format"),
        adultCount: z
          .number()
          .int()
          .min(1)
          .default(1)
          .describe("Number of adults"),
      },
      _meta: { ui: { resourceUri } },
    },
    async (input): Promise<CallToolResult> => {
      const city = input.city.trim().toLowerCase();
      const hotels = FAKE_HOTELS.filter((h) =>
        h.city.toLowerCase().includes(city),
      );
      return {
        content: [{ type: "text", text: JSON.stringify(hotels) }],
      };
    },
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    {
      mimeType: RESOURCE_MIME_TYPE,
    },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "mcp-app.html"),
        "utf-8",
      );
      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: {
              ui: {
                csp: {
                  resourceDomains: ["https://*.photos"],
                },
              },
            },
          },
        ],
      };
    },
  );

  return server;
}
