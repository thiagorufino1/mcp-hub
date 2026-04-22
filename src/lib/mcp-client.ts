import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import type {
  McpDiscoveredTool,
  McpInspectResponse,
  McpServerConfig,
  McpTransport,
} from "@/types/mcp";

type MutableMcpServer = Omit<McpServerConfig, "tools" | "connectionStatus"> & {
  tools?: McpDiscoveredTool[];
  connectionStatus?: McpServerConfig["connectionStatus"];
};

function parseCommand(command: string, args: string[]) {
  const trimmed = command.trim();
  if (!trimmed) {
    return { args, command: "" };
  }

  if (args.length > 0 || !trimmed.includes(" ")) {
    return { args, command: trimmed };
  }

  const [parsedCommand, ...parsedArgs] = trimmed.split(/\s+/);
  return { args: parsedArgs, command: parsedCommand };
}

function buildHeaders(server: McpServerConfig) {
  return Object.keys(server.headers ?? {}).length > 0 ? server.headers : undefined;
}

function buildTransport(server: McpServerConfig) {
  switch (server.transport) {
    case "stdio": {
      const parsed = parseCommand(server.command ?? "", server.args);
      return new StdioClientTransport({
        args: parsed.args,
        command: parsed.command,
        env: {
          ...getDefaultEnvironment(),
          ...server.env,
        },
        stderr: "pipe",
      });
    }
    case "sse":
      return new SSEClientTransport(new URL(server.url ?? ""), {
        requestInit: {
          headers: buildHeaders(server),
        },
      });
    default:
      return new StreamableHTTPClientTransport(new URL(server.url ?? ""), {
        requestInit: {
          headers: buildHeaders(server),
        },
      });
  }
}

async function createConnectedClient(server: McpServerConfig) {
  const client = new Client(
    {
      name: "trc-ai-chat-assistant",
      version: "1.0.0",
    },
    {
      capabilities: {},
    },
  );
  const transport = buildTransport(server);
  await client.connect(transport);

  return {
    client,
    async close() {
      await transport.close().catch(() => undefined);
    },
  };
}

export function createInspectableServerConfig(server: MutableMcpServer): McpServerConfig {
  return {
    approvalMode: server.approvalMode ?? "never",
    approvedToolNames: server.approvedToolNames ?? [],
    args: server.args,
    command: server.command,
    connectionStatus: server.connectionStatus ?? "pending",
    description: server.description,
    env: server.env,
    errorMessage: server.errorMessage,
    headers: server.headers,
    id: server.id,
    lastCheckedAt: server.lastCheckedAt,
    name: server.name,
    tools: server.tools ?? [],
    transport: server.transport,
    url: server.url,
  };
}

export async function inspectMcpServer(server: McpServerConfig): Promise<McpInspectResponse> {
  let close: (() => Promise<void>) | null = null;

  try {
    const connection = await createConnectedClient(server);
    const client = connection.client;
    close = connection.close;

    const toolsResult = await client.listTools();

    const tools: McpDiscoveredTool[] = toolsResult.tools.map((tool) => ({
      description: tool.description,
      inputSchema:
        tool.inputSchema && typeof tool.inputSchema === "object"
          ? {
              type: "object",
              properties: tool.inputSchema.properties,
              required: tool.inputSchema.required,
            }
          : undefined,
      name: tool.name,
      readOnly: tool.annotations?.readOnlyHint ?? false,
      isDestructive: tool.annotations?.destructiveHint === true,
    }));

    return {
      server: {
        ...server,
        approvedToolNames:
          server.approvalMode === "selected"
            ? server.approvedToolNames.filter((toolName) =>
                tools.some((tool) => tool.name === toolName),
              )
            : server.approvalMode === "never"
              ? tools.map((tool) => tool.name)
              : [],
        connectionStatus: "connected",
        errorMessage: undefined,
        lastCheckedAt: new Date().toISOString(),
        tools,
      },
    };
  } catch (error) {
    return {
      server: {
        ...server,
        connectionStatus: "error",
        errorMessage:
          error instanceof Error ? error.message : "Não foi possível conectar ao servidor MCP.",
        lastCheckedAt: new Date().toISOString(),
        tools: [],
      },
    };
  } finally {
    if (close) {
      await close();
    }
  }
}

export async function executeMcpTool(
  server: McpServerConfig,
  toolName: string,
  args: Record<string, unknown>,
) {
  const { client, close } = await createConnectedClient(server);

  try {
    return await client.callTool({
      name: toolName,
      arguments: args,
    });
  } finally {
    await close();
  }
}

export function supportsOpenAIMcpTool(server: McpServerConfig) {
  return server.transport === "streamable-http" && server.connectionStatus === "connected";
}

export function getRemoteMcpHeaders(server: McpServerConfig) {
  return buildHeaders(server);
}

export function describeMcpTransport(transport: McpTransport) {
  switch (transport) {
    case "stdio":
      return "STDIO";
    case "sse":
      return "SSE";
    default:
      return "Streamable HTTP";
  }
}
