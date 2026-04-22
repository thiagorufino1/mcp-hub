"use client";

import { Anthropic, Aws, AzureAI, DeepSeek, Gemini, Groq, Mistral, Ollama, OpenAI, XAI } from "@lobehub/icons";
import { cn } from "@/lib/utils";
import type { LLMConfig } from "@/types/llm-config";

type ProviderType = LLMConfig["provider"];

type Props = {
  provider: ProviderType;
  className?: string;
  iconClassName?: string;
};

export function ProviderLogo({ provider, className, iconClassName }: Props) {
  const shellClassName =
    "inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.05)]";

  const sizeMatch = iconClassName?.match(/size-(\d+)/);
  const sizePx = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 24;

  const iconMap: Record<ProviderType, React.ReactNode> = {
    openai: <OpenAI size={sizePx} />,
    azure: <AzureAI.Color size={sizePx} />,
    google: <Gemini.Color size={sizePx} />,
    bedrock: <Aws.Color size={sizePx} />,
    ollama: <Ollama size={sizePx} />,
    anthropic: <Anthropic size={sizePx} />,
    groq: <Groq size={sizePx} />,
    xai: <XAI size={sizePx} />,
    mistral: <Mistral.Color size={sizePx} />,
    deepseek: <DeepSeek.Color size={sizePx} />,
  };

  return <span className={cn(shellClassName, className)}>{iconMap[provider]}</span>;
}
