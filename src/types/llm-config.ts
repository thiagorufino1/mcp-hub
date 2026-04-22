export type LLMConfig =
  | { provider: "openai"; apiKey: string; model: string }
  | {
      provider: "azure";
      endpoint: string;
      apiKey: string;
      deployment: string;
      apiVersion: string;
    }
  | {
      provider: "bedrock";
      accessKeyId: string;
      secretKey: string;
      region: string;
      modelId: string;
    }
  | { provider: "google"; apiKey: string; model: string }
  | { provider: "ollama"; baseUrl: string; model: string };

export const LLM_CONFIG_STORAGE_KEY = "mcp-portal-llm-config";
export const LLM_CONFIGURED_COOKIE = "mcp-portal-configured";
