import { createInspectableServerConfig, inspectMcpServer } from "@/lib/mcp-client";
import type { McpInspectResponse, McpServerConfig } from "@/types/mcp";

import { z } from "zod";

const ServerPayloadSchema = z.object({
  approvalMode: z.enum(["always", "never", "selected"]).optional().default("never"),
  approvedToolNames: z.array(z.string()).optional().default([]),
  args: z.array(z.string()).optional().default([]),
  command: z.string().trim().optional(),
  description: z.string().trim().optional(),
  env: z.record(z.string(), z.string()).optional().default({}),
  headers: z.record(z.string(), z.string()).optional().default({}),
  id: z.string().min(1),
  name: z.string().trim().min(1, "Defina um nome para o MCP."),
  transport: z.enum(["stdio", "sse", "streamable-http"]),
  url: z.string().trim().optional(),
}).refine(data => {
  if (data.transport === "stdio" && (!data.command || data.command.length === 0)) {
    return false;
  }
  return true;
}, { message: "Informe o comando do servidor MCP.", path: ["command"] })
.refine(data => {
  if (data.transport !== "stdio" && (!data.url || data.url.length === 0)) {
    return false;
  }
  return true;
}, { message: "Informe a URL do servidor MCP.", path: ["url"] });

export async function POST(request: Request) {
  let body: { server?: Partial<McpServerConfig> };
  try {
    body = (await request.json()) as { server?: Partial<McpServerConfig> };
  } catch {
    return Response.json({ error: "Corpo da requisicao invalido." }, { status: 400 });
  }

  const parsed = ServerPayloadSchema.safeParse(body.server ?? {});
  
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const serverConfig = createInspectableServerConfig({
    ...parsed.data,
    connectionStatus: "pending",
    tools: [],
  } as McpServerConfig);

  const result = await inspectMcpServer(serverConfig);

  return Response.json(result satisfies McpInspectResponse, {
    status: result.server.connectionStatus === "connected" ? 200 : 422,
  });
}
