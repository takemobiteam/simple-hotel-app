import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { Hotel } from "./types.js";

export function parseHotels(result: CallToolResult): Hotel[] {
  try {
    // structuredContent.text holds the raw JSON string of the hotels array
    const structured = (result as Record<string, unknown>).structuredContent as { text?: string } | undefined;
    if (structured?.text) {
      const parsed = JSON.parse(structured.text);
      if (Array.isArray(parsed)) return parsed;
    }
    // Fallback: content text may be a JSON-encoded envelope { text: "..." }
    const textBlock = result.content?.find((c) => c.type === "text");
    if (!textBlock || textBlock.type !== "text") return [];
    const parsed = JSON.parse(textBlock.text);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed?.text === "string") {
      const inner = JSON.parse(parsed.text);
      return Array.isArray(inner) ? inner : [];
    }
    return [];
  } catch {
    return [];
  }
}
