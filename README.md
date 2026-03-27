# Hotel Search MCP App

An MCP App that searches for hotels and displays results in an interactive React UI.

## MCP Client Configuration

Add to your MCP client configuration (stdio transport):

```json
{
  "mcpServers": {
    "hotel-search": {
      "command": "bash",
      "args": [
        "-c",
        "cd ~/code/mcp-onsite && npm run build >&2 && node dist/index.js --stdio"
      ]
    }
  }
}
```

## Overview

The LLM calls the `search-hotels` tool with a city and optional parameters. The host renders the React UI, which listens for the tool result via `ontoolresult` and displays the hotels as a list of cards.

### Tool: `search-hotels`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `city` | string | yes | City name to search in |
| `stateCode` | string | no | State/province code (required for US/Canada) |
| `countryCode` | string | no | ISO country code, defaults to `US` |
| `checkinDate` | string | no | Check-in date in `MM-DD-YYYY` format |
| `checkoutDate` | string | no | Check-out date in `MM-DD-YYYY` format |
| `adultCount` | number | no | Number of adults, defaults to `1` |

## Key Files

- [`server.ts`](server.ts) - MCP server: registers the `search-hotels` tool and HTML resource
- [`src/mcp-app.tsx`](src/mcp-app.tsx) - React UI: receives tool results and renders hotel cards

## Getting Started

```bash
npm install
npm run dev
```

## Testing

For local testing, use MCPJam

```bash
npx @mcpjam/inspector@latest
```

### Add a new server
Connection type: HTTP

URL: http://localhost:3000 (check your mcp server url from the above step)

No Authentication

### Running a query

Go the the App Builder tab

Enter a query like `Show me hotels in Las Vegas 5/1 to 5/5`

## How It Works

1. The server registers a `search-hotels` tool linked to a UI resource (`ui://search-hotels/mcp-app.html`).
2. When the LLM calls the tool, the host renders the UI from the resource.
3. The tool result is passed to the UI via `app.ontoolresult`.
4. The UI parses the hotel JSON and renders each hotel as a card showing name, brand, address, star rating, guest rating, and nightly rate.

## Build System

Bundled into a single HTML file using Vite with `vite-plugin-singlefile` — see [`vite.config.ts`](vite.config.ts). This allows all UI content to be served as a single MCP resource.
