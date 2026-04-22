import { createAzure } from "@ai-sdk/azure";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

import type { LLMConfig } from "@/types/llm-config";

export function getModel(config: LLMConfig): LanguageModel {
  switch (config.provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey: config.apiKey });
      return openai(config.model);
    }
    case "azure": {
      const azure = createAzure({
        baseURL: normalizeAzureBaseUrl(config.endpoint),
        apiKey: config.apiKey,
        apiVersion: config.apiVersion,
        useDeploymentBasedUrls: true,
      });
      return azure.chat(config.deployment);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
      return google(config.model);
    }
    case "bedrock": {
      const bedrock = createAmazonBedrock({
        region: config.region,
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretKey,
      });
      return bedrock(config.modelId);
    }
    case "ollama": {
      const ollama = createOpenAI({
        baseURL: `${config.baseUrl.replace(/\/$/, "")}/v1`,
        apiKey: "ollama",
      });
      return ollama(config.model);
    }
  }
}

function normalizeAzureBaseUrl(endpoint: string): string {
  const trimmed = endpoint.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/openai") ? trimmed : `${trimmed}/openai`;
}
