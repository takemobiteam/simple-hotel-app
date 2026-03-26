import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

export interface Hotel {
  propertyId: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  stateCode: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  starRating: number;
  guestRating: number | null;
  reviewCount: number;
  lowestRate: number | null;
  currency: string;
  heroImageUrl: string | null;
}

const FAKE_HOTELS: Hotel[] = [
  {
    propertyId: "01001",
    name: "La Quinta Inn & Suites Downtown",
    brand: "La Quinta",
    address: "123 Main St",
    city: "Las Vegas",
    stateCode: "NV",
    countryCode: "US",
    latitude: 36.1699,
    longitude: -115.1398,
    starRating: 3,
    guestRating: 8.4,
    reviewCount: 1243,
    lowestRate: 89,
    currency: "USD",
    heroImageUrl: null,
  },
  {
    propertyId: "01002",
    name: "Wyndham Grand Resort & Spa",
    brand: "Wyndham Grand",
    address: "456 Paradise Rd",
    city: "Las Vegas",
    stateCode: "NV",
    countryCode: "US",
    latitude: 36.1750,
    longitude: -115.1500,
    starRating: 4,
    guestRating: 9.1,
    reviewCount: 3872,
    lowestRate: 179,
    currency: "USD",
    heroImageUrl: null,
  },
  {
    propertyId: "01003",
    name: "Days Inn by Wyndham Strip",
    brand: "Days Inn",
    address: "789 Las Vegas Blvd",
    city: "Las Vegas",
    stateCode: "NV",
    countryCode: "US",
    latitude: 36.1620,
    longitude: -115.1440,
    starRating: 2,
    guestRating: 7.2,
    reviewCount: 589,
    lowestRate: 59,
    currency: "USD",
    heroImageUrl: null,
  },
  {
    propertyId: "01004",
    name: "Ramada by Wyndham Convention Center",
    brand: "Ramada",
    address: "321 Convention Center Dr",
    city: "Las Vegas",
    stateCode: "NV",
    countryCode: "US",
    latitude: 36.1800,
    longitude: -115.1600,
    starRating: 3,
    guestRating: 7.8,
    reviewCount: 1104,
    lowestRate: 74,
    currency: "USD",
    heroImageUrl: null,
  },
  {
    propertyId: "01005",
    name: "Super 8 by Wyndham Airport",
    brand: "Super 8",
    address: "600 Airport Connector Rd",
    city: "Las Vegas",
    stateCode: "NV",
    countryCode: "US",
    latitude: 36.0840,
    longitude: -115.1537,
    starRating: 2,
    guestRating: 6.9,
    reviewCount: 412,
    lowestRate: 49,
    currency: "USD",
    heroImageUrl: null,
  },
];

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
        stateCode: z.string().optional().describe("State/province code (required for US/Canada)"),
        countryCode: z.string().default("US").describe("ISO country code (e.g. US, CA, MX)"),
        checkinDate: z.string().optional().describe("Check-in date in MM-DD-YYYY format"),
        checkoutDate: z.string().optional().describe("Check-out date in MM-DD-YYYY format"),
        adultCount: z.number().int().min(1).default(1).describe("Number of adults"),
      },
      _meta: { ui: { resourceUri } },
    },
    async (input): Promise<CallToolResult> => {
      const city = input.city.trim().toLowerCase();
      const hotels = FAKE_HOTELS.filter((h) => h.city.toLowerCase().includes(city));
      return {
        content: [{ type: "text", text: JSON.stringify(hotels) }],
      };
    },
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(path.join(DIST_DIR, "mcp-app.html"), "utf-8");
      return {
        contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    },
  );

  return server;
}
