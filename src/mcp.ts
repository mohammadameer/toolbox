import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { TOOLS, VERSION } from "./tools";

export function createToolboxMcpServer() {
  const server = new McpServer({
    name: "opentoolbox",
    version: VERSION,
  });

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args) => {
        const result = tool.run(args);
        if (!result.ok) {
          return {
            isError: true,
            content: [{ type: "text", text: result.error }],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data),
            },
          ],
          structuredContent: result.data,
        };
      },
    );
  }

  return server;
}

/** Streamable HTTP MCP handler — same tools as POST /tools/:name. */
export const mcpHandler = createMcpHandler(createToolboxMcpServer);
