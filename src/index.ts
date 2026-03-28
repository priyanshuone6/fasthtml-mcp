import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

const CTX_URL = "https://www.fastht.ml/docs/llms-ctx.txt";
const MAX_SECTION_CHARS = 2800;

function splitSections(text: string): string[] {
  return text
    .split(/\n(?=##\s)/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getHeading(section: string): string {
  const firstLine = section.split("\n")[0]?.trim() || "";
  return firstLine.replace(/^##\s*/, "");
}

function scoreSection(section: string, query: string): number {
  const hay = section.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += 1;
  }

  const heading = getHeading(section).toLowerCase();
  for (const term of terms) {
    if (heading.includes(term)) score += 2;
  }

  return score;
}

function truncate(text: string, max = MAX_SECTION_CHARS): string {
  return text.length <= max ? text : text.slice(0, max) + "\n\n[truncated]";
}

async function fetchCtxText(): Promise<string> {
  const res = await fetch(CTX_URL, {
    headers: {
      "user-agent": "fasthtml-mcp-worker/0.1",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch FastHTML context: ${res.status} ${res.statusText}`);
  }

  return await res.text();
}

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "FastHTML Docs MCP",
    version: "0.1.0",
  });

  async init() {
    this.server.tool(
      "search_fasthtml_docs",
      {
        query: z.string().min(1),
        maxResults: z.number().int().min(1).max(8).optional(),
      },
      async ({ query, maxResults }) => {
        try {
          const text = await fetchCtxText();
          const sections = splitSections(text);

          const ranked = sections
            .map((section) => ({
              section,
              score: scoreSection(section, query),
            }))
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults ?? 5);

          if (!ranked.length) {
            return {
              content: [
                {
                  type: "text",
                  text: `No relevant FastHTML sections found for: ${query}`,
                },
              ],
            };
          }

          const output = ranked
            .map(
              (item, i) =>
                `### Match ${i + 1}: ${getHeading(item.section)}\n\n${truncate(item.section)}`
            )
            .join("\n\n---\n\n");

          return {
            content: [{ type: "text", text: output }],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: `search_fasthtml_docs failed: ${
                  err instanceof Error ? err.message : String(err)
                }`,
              },
            ],
          };
        }
      }
    );

    this.server.tool(
      "read_fasthtml_section",
      {
        heading: z.string().min(1),
      },
      async ({ heading }) => {
        try {
          const text = await fetchCtxText();
          const sections = splitSections(text);
          const wanted = heading.toLowerCase();

          const match =
            sections.find((s) => getHeading(s).toLowerCase() === wanted) ||
            sections.find((s) => getHeading(s).toLowerCase().includes(wanted));

          if (!match) {
            return {
              content: [
                {
                  type: "text",
                  text: `No FastHTML section found for heading: ${heading}`,
                },
              ],
            };
          }

          return {
            content: [{ type: "text", text: truncate(match, 8000) }],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: `read_fasthtml_section failed: ${
                  err instanceof Error ? err.message : String(err)
                }`,
              },
            ],
          };
        }
      }
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
