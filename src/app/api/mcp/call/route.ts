import { executeMcpTool } from "@/lib/mcp-client";
import type { McpServerConfig } from "@/types/mcp";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isRecordOfStrings(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}

function normalizeServerPayload(server: Partial<McpServerConfig>) {
  if (!server.id || !server.name || !server.transport) {
    return { error: "Configuracao MCP invalida." as const };
  }

  if (!["stdio", "sse", "streamable-http"].includes(server.transport)) {
    return { error: "Transporte MCP invalido." as const };
  }

  if (server.args && (!Array.isArray(server.args) || server.args.some((arg) => typeof arg !== "string"))) {
    return { error: "Os argumentos do MCP precisam ser uma lista de texto." as const };
  }

  if (server.env && !isRecordOfStrings(server.env)) {
    return { error: "As variaveis de ambiente do MCP sao invalidas." as const };
  }

  if (server.headers && !isRecordOfStrings(server.headers)) {
    return { error: "Os headers do MCP sao invalidos." as const };
  }

  if (server.transport === "stdio" && !server.command?.trim()) {
    return { error: "Informe o comando do servidor MCP." as const };
  }

  if (server.transport !== "stdio" && !server.url?.trim()) {
    return { error: "Informe a URL do servidor MCP." as const };
  }

  return {
    server: {
      approvalMode: server.approvalMode ?? "never",
      approvedToolNames: server.approvedToolNames ?? [],
      args: server.args ?? [],
      command: server.command?.trim(),
      connectionStatus: server.connectionStatus ?? "pending",
      description: server.description?.trim() || undefined,
      env: server.env ?? {},
      errorMessage: server.errorMessage,
      headers: server.headers ?? {},
      id: server.id,
      lastCheckedAt: server.lastCheckedAt,
      name: server.name.trim(),
      tools: server.tools ?? [],
      transport: server.transport,
      url: server.url?.trim(),
    } satisfies McpServerConfig,
  };
}

export async function POST(request: Request) {
  let body: { server?: Partial<McpServerConfig>; toolName?: string; args?: unknown };

  try {
    body = (await request.json()) as { server?: Partial<McpServerConfig>; toolName?: string; args?: unknown };
  } catch {
    return Response.json({ error: "Corpo da requisicao invalido." }, { status: 400 });
  }

  const normalized = normalizeServerPayload(body.server ?? {});
  if ("error" in normalized) {
    return Response.json({ error: normalized.error }, { status: 400 });
  }

  if (typeof body.toolName !== "string" || body.toolName.trim().length === 0) {
    return Response.json({ error: "Informe a tool do MCP." }, { status: 400 });
  }

  if (!isRecord(body.args)) {
    return Response.json({ error: "Os argumentos da tool precisam ser um objeto JSON." }, { status: 400 });
  }

  try {
    const result = await executeMcpTool(normalized.server, body.toolName.trim(), body.args);
    return Response.json({ ok: true, result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao executar a tool MCP." },
      { status: 422 },
    );
  }
}
