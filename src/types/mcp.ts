export type McpTransport = "stdio" | "sse" | "streamable-http";

export type McpConnectionStatus = "pending" | "connected" | "error";

export type McpApprovalMode = "always" | "never" | "selected";

export type McpDiscoveredTool = {
  name: string;
  description?: string;
  readOnly?: boolean;
  isDestructive?: boolean;
  inputSchema?: {
    type: "object";
    properties?: Record<string, object>;
    required?: string[];
  };
};

export type McpServerConfig = {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  transport: McpTransport;
  command?: string;
  args: string[];
  url?: string;
  env: Record<string, string>;
  headers?: Record<string, string>;
  tools: McpDiscoveredTool[];
  connectionStatus: McpConnectionStatus;
  errorMessage?: string;
  lastCheckedAt?: string;
  approvalMode: McpApprovalMode;
  approvedToolNames: string[];
};

export type McpInspectResponse = {
  server: McpServerConfig;
};
