import { z } from "zod";

export const VERSION = "0.1.0";

export type ToolError = {
  ok: false;
  error: string;
  status: 400 | 404;
};

export type ToolSuccess = {
  ok: true;
  data: Record<string, unknown>;
};

export type ToolRunResult = ToolSuccess | ToolError;

export type ToolDefinition = {
  name: string;
  description: string;
  method: "POST";
  path: string;
  input: Record<string, string>;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  run: (input: unknown) => ToolRunResult;
};

const echoInputSchema = z.object({
  message: z.string(),
});

function runEcho(input: unknown): ToolRunResult {
  if (input === null || typeof input !== "object") {
    return {
      ok: false,
      status: 400,
      error: 'Expected JSON body: { "message": "..." }',
    };
  }

  const message = (input as { message?: unknown }).message;
  if (typeof message !== "string") {
    return {
      ok: false,
      status: 400,
      error: 'Field "message" must be a string',
    };
  }

  return {
    ok: true,
    data: {
      tool: "echo",
      result: message,
    },
  };
}

/** Single registry — HTTP and MCP both call this. */
export const TOOLS: ToolDefinition[] = [
  {
    name: "echo",
    description: "Return the message you send. Useful as a smoke test.",
    method: "POST",
    path: "/tools/echo",
    input: { message: "string" },
    inputSchema: echoInputSchema,
    run: runEcho,
  },
];

export function listToolCatalog() {
  return TOOLS.map(({ name, description, method, path, input }) => ({
    name,
    description,
    method,
    path,
    input,
  }));
}

export function getTool(name: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.name === name);
}

export function runTool(name: string, input: unknown): ToolRunResult {
  const tool = getTool(name);
  if (!tool) {
    return {
      ok: false,
      status: 404,
      error: `Unknown tool: ${name}`,
    };
  }
  return tool.run(input);
}

export function healthPayload() {
  return {
    ok: true as const,
    service: "toolbox",
    version: VERSION,
  };
}
