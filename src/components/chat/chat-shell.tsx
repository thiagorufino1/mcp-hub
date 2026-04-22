"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChatThread } from "@/components/chat/chat-thread";
import { ConversationStarters } from "@/components/chat/conversation-starters";
import { useAppPreferences } from "@/components/providers/app-preferences-provider";
import { McpServerDialog } from "@/components/chat/mcp-server-dialog";
import { MessageComposer } from "@/components/chat/message-composer";
import { SidebarDrawer } from "@/components/chat/sidebar-drawer";
import { SidebarTools } from "@/components/chat/sidebar-tools";
import type { SystemPrompt } from "@/components/chat/system-prompt-section";
import { Topbar } from "@/components/chat/topbar";
import { cn } from "@/lib/utils";
import { parseStreamChunks } from "@/lib/chat-stream";
import type { ChatStreamEvent, Message, ToolEvent } from "@/types/chat";
import type { McpInspectResponse, McpServerConfig } from "@/types/mcp";
import type { LLMConfig } from "@/types/llm-config";
import { LLM_CONFIG_STORAGE_KEY } from "@/types/llm-config";

const MESSAGE_STORAGE_KEY = "ai-chat-messages";
const TOOL_EVENT_STORAGE_KEY = "ai-chat-tool-events";
const MCP_STORAGE_KEY = "ai-chat-mcp-servers";
const CUSTOM_PROMPT_KEY = "ai-chat-custom-prompt";
const STORAGE_VERSION_KEY = "ai-chat-ui-version";
const STORAGE_BACKUP_PREFIX = "ai-chat-storage-backup";
const STORAGE_VERSION = "2026-03-30-ui-refresh-5";

type ThreadItem =
  | { id: string; type: "message"; value: Message }
  | { id: string; type: "tool"; value: ToolEvent };

function buildInitialAssistantMessage(content: string): Message {
  return {
    id: "assistant-welcome",
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
    status: "complete",
  };
}

function normalizeStoredServer(server: Partial<McpServerConfig>): McpServerConfig | null {
  if (!server.id || !server.name || !server.transport) {
    return null;
  }

  return {
    approvalMode: server.approvalMode ?? "never",
    approvedToolNames: Array.isArray(server.approvedToolNames) ? server.approvedToolNames : [],
    args: Array.isArray(server.args) ? server.args : [],
    command: server.command,
    connectionStatus: server.connectionStatus ?? "pending",
    description: server.description,
    env: server.env ?? {},
    errorMessage: server.errorMessage,
    headers: server.headers ?? {},
    id: server.id,
    lastCheckedAt: server.lastCheckedAt,
    name: server.name,
    tools: Array.isArray(server.tools) ? server.tools : [],
    transport: server.transport,
    url: server.url,
  };
}

function normalizeStoredMessage(message: Partial<Message>): Message | null {
  if (!message.id || !message.role || !message.createdAt) {
    return null;
  }

  return {
    content: message.content ?? "",
    createdAt: message.createdAt,
    feedback: message.feedback,
    id: message.id,
    requestId: message.requestId,
    role: message.role,
    status: message.status ?? "complete",
    usage: message.usage,
  };
}

function normalizeStoredToolEvent(event: Partial<ToolEvent>): ToolEvent | null {
  if (!event.id || !event.tool || !event.title || !event.reason || !event.createdAt || !event.status) {
    return null;
  }

  return {
    createdAt: event.createdAt,
    detailKind: event.detailKind ?? "tool",
    id: event.id,
    reason: event.reason,
    requestId: event.requestId,
    serverName: event.serverName,
    status: event.status,
    summary: event.summary,
    title: event.title,
    tool: event.tool,
    argsText: event.argsText,
  };
}

export function ChatShell() {
  const { t } = useAppPreferences();
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>([]);
  const initialAssistantMessage = useMemo(
    () => buildInitialAssistantMessage(t("chat.welcome")),
    [t],
  );
  const [messages, setMessages] = useState<Message[]>(() => [buildInitialAssistantMessage(t("chat.welcome"))]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMcpDialogOpen, setIsMcpDialogOpen] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [retestingServerIds, setRetestingServerIds] = useState<string[]>([]);
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [llmConfig, setLlmConfig] = useState<LLMConfig | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [scrollRequest, setScrollRequest] = useState(0);
  const currentAssistantIdRef = useRef<string | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasRevalidatedStoredServersRef = useRef(false);

  useEffect(() => {
    try {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      if (storedVersion !== STORAGE_VERSION) {
        const storedMessagesSnapshot = localStorage.getItem(MESSAGE_STORAGE_KEY);
        const storedToolsSnapshot = localStorage.getItem(TOOL_EVENT_STORAGE_KEY);
        if (storedMessagesSnapshot || storedToolsSnapshot) {
          const backupKey = `${STORAGE_BACKUP_PREFIX}-${Date.now()}`;
          localStorage.setItem(
            backupKey,
            JSON.stringify({
              messages: storedMessagesSnapshot ? JSON.parse(storedMessagesSnapshot) : [],
              toolEvents: storedToolsSnapshot ? JSON.parse(storedToolsSnapshot) : [],
              previousVersion: storedVersion,
            }),
          );
          setStorageNotice(
            "Seu historico local foi reiniciado por uma atualizacao da interface. Uma copia de seguranca foi salva no navegador.",
          );
        }
        localStorage.removeItem(MESSAGE_STORAGE_KEY);
        localStorage.removeItem(TOOL_EVENT_STORAGE_KEY);
        localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
      }

      try {
        const storedMessages = localStorage.getItem(MESSAGE_STORAGE_KEY);
        if (storedMessages) {
          const parsed = JSON.parse(storedMessages) as Array<Partial<Message>>;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed.map(normalizeStoredMessage).filter(Boolean) as Message[]);
          }
        }
      } catch {
        // Ignore corrupted messages.
      }

      try {
        const storedToolEvents = localStorage.getItem(TOOL_EVENT_STORAGE_KEY);
        if (storedToolEvents) {
          const parsed = JSON.parse(storedToolEvents) as Array<Partial<ToolEvent>>;
          if (Array.isArray(parsed)) {
            setToolEvents(parsed.map(normalizeStoredToolEvent).filter(Boolean) as ToolEvent[]);
          }
        }
      } catch {
        // Ignore corrupted tool events.
      }

      try {
        const storedServers = localStorage.getItem(MCP_STORAGE_KEY);
        if (storedServers) {
          const parsed = JSON.parse(storedServers) as Array<Partial<McpServerConfig>>;
          if (Array.isArray(parsed)) {
            setMcpServers(parsed.map(normalizeStoredServer).filter(Boolean) as McpServerConfig[]);
          }
        }
      } catch {
        // Ignore corrupted server config.
      }

      try {
        const storedPrompts = localStorage.getItem(CUSTOM_PROMPT_KEY);
        if (storedPrompts) {
          const parsed = JSON.parse(storedPrompts) as { prompts: SystemPrompt[]; activeId: string | null };
          if (parsed.prompts) setSystemPrompts(parsed.prompts);
          if (parsed.activeId !== undefined) setActivePromptId(parsed.activeId);
        }
      } catch {
        // Ignore corrupted prompts.
      }
    } catch {
      // Ignore corrupted local state.
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LLM_CONFIG_STORAGE_KEY);
      if (stored) {
        setLlmConfig(JSON.parse(stored) as LLMConfig);
      }
    } catch {
      // Corrupted config — ignore, user will reconfigure.
    }
  }, []);

  useEffect(() => {
    if (!storageNotice) {
      return;
    }

    setMessages((current) => {
      if (current.some((message) => message.id === "storage-version-notice")) {
        return current;
      }

      return [
        {
          id: "storage-version-notice",
          role: "assistant",
          content: storageNotice,
          createdAt: new Date().toISOString(),
          status: "complete",
        },
        ...current,
      ];
    });
  }, [storageNotice]);

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0]?.id !== "assistant-welcome") {
        return current;
      }

      return [initialAssistantMessage];
    });
  }, [initialAssistantMessage]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Quota exceeded — skip persistence silently.
    }
  }, [messages, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(TOOL_EVENT_STORAGE_KEY, JSON.stringify(toolEvents));
    } catch {
      // Quota exceeded — skip persistence silently.
    }
  }, [isHydrated, toolEvents]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(MCP_STORAGE_KEY, JSON.stringify(mcpServers));
    } catch {
      // Quota exceeded — skip persistence silently.
    }
  }, [isHydrated, mcpServers]);

  const items = useMemo<ThreadItem[]>(() => {
    const renderedToolIds = new Set<string>();
    const grouped: ThreadItem[] = [];
    const sortedMessages = [...messages].sort((a, b) => {
      const aTime = Date.parse(a.createdAt);
      const bTime = Date.parse(b.createdAt);
      if (aTime !== bTime) return aTime - bTime;
      return a.id.localeCompare(b.id);
    });

    for (const message of sortedMessages) {
      if (message.role === "assistant" && message.requestId) {
        const relatedTools = toolEvents
          .filter((tool) =>
            tool.requestId === message.requestId &&
            !renderedToolIds.has(tool.id) &&
            (tool.detailKind === "tool" || tool.detailKind === "context")
          )
          .sort((a, b) => {
            const aTime = Date.parse(a.createdAt);
            const bTime = Date.parse(b.createdAt);
            if (aTime !== bTime) return aTime - bTime;
            return a.id.localeCompare(b.id);
          });

        for (const tool of relatedTools) {
          renderedToolIds.add(tool.id);
          grouped.push({ id: tool.id, type: "tool", value: tool });
        }
      }

      grouped.push({ id: message.id, type: "message", value: message });
    }

    return grouped;
  }, [messages, toolEvents]);

  function handleStop() {
    abortControllerRef.current?.abort();
    markCurrentAssistantStopped();
  }

  function handleNewConversation() {
    abortControllerRef.current?.abort();
    setMessages([initialAssistantMessage]);
    setToolEvents([]);
    setScrollRequest((current) => current + 1);
    currentAssistantIdRef.current = null;
    currentRequestIdRef.current = null;
  }

  async function handleCopySession() {
    let sessionText = `${t("chat.sessionLogTitle")}\n==============================\n\n`;

    for (const item of items) {
      if (item.type === "message") {
        const role = item.value.role === "assistant" ? t("chat.assistant") : t("chat.you");
        const date = new Date(item.value.createdAt).toLocaleString();
        sessionText += `[${role}] (${date}):\n${item.value.content || t("chat.emptyContent")}\n\n`;
      } else {
        const date = new Date(item.value.createdAt).toLocaleString();
        sessionText += `[TOOL] ${item.value.tool} (${date})\nStatus: ${item.value.status}\n`;
        if (item.value.argsText) {
          sessionText += `Argumentos:\n${item.value.argsText}\n`;
        }
        if (item.value.summary) {
          let summaryToPrint = item.value.summary;
          try {
            summaryToPrint = JSON.stringify(JSON.parse(item.value.summary), null, 2);
          } catch { }
          sessionText += `Resultado:\n${summaryToPrint}\n`;
        }
        sessionText += "\n";
      }
    }

    try {
      await navigator.clipboard.writeText(sessionText);
    } catch (err) {
      console.error(t("chat.copySessionError"), err);
    }
  }

  const inspectServer = useCallback(async (server: McpServerConfig) => {
    const response = await fetch("/api/mcp/inspect", {
      body: JSON.stringify({ server }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const payload = (await response.json()) as McpInspectResponse | { error?: string };

    if (!("server" in payload)) {
      const errorMessage = "error" in payload ? payload.error : undefined;
      throw new Error(errorMessage ?? "Não foi possível validar o servidor MCP.");
    }

    return {
      ok: response.ok && payload.server.connectionStatus === "connected",
      server: payload.server,
    };
  }, []);

  async function handleSaveServer(server: McpServerConfig) {
    const result = await inspectServer(server);
    if (!result.ok) {
      throw new Error(result.server.errorMessage ?? "Falha ao conectar ao MCP.");
    }
    const inspectedServer = result.server;

    setMcpServers((current) => {
      const existingIndex = current.findIndex((item) => item.id === inspectedServer.id);
      if (existingIndex === -1) {
        return [...current, inspectedServer];
      }

      return current.map((item) => (item.id === inspectedServer.id ? inspectedServer : item));
    });

    setEditingServerId(null);
  }

  async function handleRetestServer(serverId: string) {
    const target = mcpServers.find((server) => server.id === serverId);
    if (!target) return;

    setRetestingServerIds((current) => [...current, serverId]);

    try {
      const result = await inspectServer(target);
      const inspectedServer = result.server;
      setMcpServers((current) =>
        current.map((server) => (server.id === serverId ? inspectedServer : server)),
      );
    } finally {
      setRetestingServerIds((current) => current.filter((id) => id !== serverId));
    }
  }

  useEffect(() => {
    if (!isHydrated || hasRevalidatedStoredServersRef.current || mcpServers.length === 0) {
      return;
    }

    hasRevalidatedStoredServersRef.current = true;
    const serverIds = mcpServers.map((server) => server.id);
    setRetestingServerIds((current) => [...new Set([...current, ...serverIds])]);

    void Promise.all(mcpServers.map((server) => inspectServer(server)))
      .then((results) => {
        const byId = new Map(results.map((result) => [result.server.id, result.server]));
        setMcpServers((current) =>
          current.map((server) => byId.get(server.id) ?? server),
        );
      })
      .finally(() => {
        setRetestingServerIds((current) => current.filter((id) => !serverIds.includes(id)));
      });
  }, [inspectServer, isHydrated, mcpServers]);

  function handleRemoveServer(serverId: string) {
    setMcpServers((current) => current.filter((server) => server.id !== serverId));
  }

  async function handleSubmit(content: string) {
    if (abortControllerRef.current || isStreaming) {
      return false;
    }

    const requestId = `request-${crypto.randomUUID()}`;
    currentRequestIdRef.current = requestId;

    const userMessage: Message = {
      id: `message-${crypto.randomUUID()}`,
      requestId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
      status: "complete",
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setScrollRequest((current) => current + 1);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        body: JSON.stringify({
          customPrompt: systemPrompts.find((p) => p.id === activePromptId)?.content || undefined,
          llmConfig: llmConfig ?? undefined,
          mcpServers,
          message: content,
          messages: nextMessages.map((message) => ({
            content: message.content,
            role: message.role,
          })),
          requestId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        applyStreamEvent({
          type: "error",
          message: errorText || `Falha HTTP ${response.status}.`,
        });
        return false;
      }

      if (!response.body) {
        applyStreamEvent({
          type: "error",
          message: "O backend nao retornou conteudo de resposta.",
        });
        return false;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parsed = parseStreamChunks(buffer);
        buffer = parsed.nextBuffer;

        for (const event of parsed.events) {
          applyStreamEvent(event);
        }
      }

      return true;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        markCurrentAssistantStopped();
      } else {
        applyStreamEvent({
          type: "error",
          message:
            error instanceof Error ? error.message : "Falha ao consumir o stream de resposta.",
        });
      }

      return false;
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }

  function applyStreamEvent(event: ChatStreamEvent) {
    switch (event.type) {
      case "message_start":
        currentAssistantIdRef.current = event.id;
        currentRequestIdRef.current = event.requestId ?? currentRequestIdRef.current;
        setScrollRequest((current) => current + 1);
        setMessages((current) => [
          ...current,
          {
            id: event.id,
            requestId: event.requestId,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString(),
            status: "streaming",
          },
        ]);
        break;
      case "message_delta":
        ensureAssistantMessage(event.id, event.requestId);
        setMessages((current) =>
          current.map((message) =>
            message.id === resolveAssistantId(event.id)
              ? {
                ...message,
                content: `${message.content}${event.delta}`,
                status: "streaming",
              }
              : message,
          ),
        );
        break;
      case "tool_start":
        setScrollRequest((current) => current + 1);
        setToolEvents((current) => [
          ...current,
          {
            id: event.id,
            requestId: event.requestId ?? currentRequestIdRef.current ?? undefined,
            tool: event.tool,
            title: event.title,
            reason: event.reason,
            argsText: event.argsText,
            detailKind: event.title.toLowerCase().includes("contexto") ? "context" : "tool",
            status: "running",
            createdAt: new Date().toISOString(),
          },
        ]);
        break;
      case "tool_end":
        setToolEvents((current) =>
          current.map((tool) =>
            tool.id === event.id
              ? {
                ...tool,
                requestId: event.requestId ?? tool.requestId,
                status: event.status,
                summary: event.summary,
              }
              : tool,
          ),
        );
        break;
      case "message_end":
        currentAssistantIdRef.current = null;
        currentRequestIdRef.current = null;
        setScrollRequest((current) => current + 1);
        setMessages((current) =>
          current.map((message) =>
            message.id === resolveAssistantId(event.id)
              ? {
                ...message,
                status: message.status === "stopped" ? "stopped" : "complete",
                usage: event.usage ?? message.usage,
              }
              : message,
          ),
        );
        break;
      case "trace":
        setToolEvents((current) => [
          ...current,
          {
            id: event.id,
            requestId: event.requestId ?? currentRequestIdRef.current ?? undefined,
            tool: event.kind === "assistant" ? "ASSISTANT_RESPONSE" : event.kind === "system" ? "SYSTEM_PROMPT" : "USER_PROMPT",
            title: event.kind === "assistant" ? "Assistant Completion" : event.kind === "system" ? "System Instructions" : "User Input Context",
            reason: event.kind === "assistant" ? "Final LLM Output" : event.kind === "system" ? "Azure LLM Configuration" : "Frontend Request Payload",
            status: "success",
            createdAt: new Date().toISOString(),
            summary: event.content,
            detailKind: event.kind,
          },
        ]);
        break;
      case "error":
        const pendingAssistantId = currentAssistantIdRef.current;
        const errorMessage = `Falha ao processar a solicitacao: ${event.message}`;
        currentAssistantIdRef.current = null;
        currentRequestIdRef.current = null;
        setMessages((current) => {
          if (pendingAssistantId && current.some((message) => message.id === pendingAssistantId)) {
            return current.map((message) =>
              message.id === pendingAssistantId
                ? {
                  ...message,
                  content: message.content.trim() || errorMessage,
                  status: "error",
                }
                : message,
            );
          }

          return [
            ...current,
            {
              id: `error-${crypto.randomUUID()}`,
              role: "assistant",
              content: errorMessage,
              createdAt: new Date().toISOString(),
              status: "error",
            },
          ];
        });
        break;
    }
  }

  async function handleFeedback(messageId: string, value: "up" | "down") {
    const messageContent = messages.find((message) => message.id === messageId)?.content;
    const previousFeedback = messages.find((message) => message.id === messageId)?.feedback;

    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, feedback: value } : message,
      ),
    );

    try {
      const response = await fetch("/api/feedback", {
        body: JSON.stringify({ messageId, feedback: value, content: messageContent }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Falha HTTP ${response.status}`);
      }
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId ? { ...message, feedback: previousFeedback } : message,
        ),
      );
      setFeedbackError("Não foi possível registrar seu feedback. Tente novamente.");
      window.setTimeout(() => setFeedbackError(null), 4000);
    }
  }

  function ensureAssistantMessage(id: string, requestId?: string) {
    const resolvedId = resolveAssistantId(id);
    currentAssistantIdRef.current = resolvedId;

    setMessages((current) => {
      if (current.some((message) => message.id === resolvedId)) return current;
      return [
        ...current,
        {
          id: resolvedId,
          requestId: requestId ?? currentRequestIdRef.current ?? undefined,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
          status: "streaming",
        },
      ];
    });
  }

  function markCurrentAssistantStopped() {
    const assistantId = currentAssistantIdRef.current;
    if (!assistantId) {
      return;
    }

    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId
          ? {
            ...message,
            content:
              message.content.trim() || "Geração interrompida antes de produzir conteúdo.",
            status: "stopped",
          }
          : message,
      ),
    );
  }

  function resolveAssistantId(id: string) {
    if (id === "assistant-current") {
      return currentAssistantIdRef.current ?? `assistant-${crypto.randomUUID()}`;
    }
    return id;
  }

  const editingServer =
    editingServerId === null
      ? null
      : mcpServers.find((server) => server.id === editingServerId) ?? null;

  function savePrompts(prompts: SystemPrompt[], activeId: string | null) {
    localStorage.setItem(CUSTOM_PROMPT_KEY, JSON.stringify({ prompts, activeId }));
  }

  function handleAddPrompt(prompt: SystemPrompt) {
    const next = [...systemPrompts, prompt];
    setSystemPrompts(next);
    setActivePromptId(prompt.id);
    savePrompts(next, prompt.id);
  }

  function handleEditPrompt(prompt: SystemPrompt) {
    const next = systemPrompts.map((p) => (p.id === prompt.id ? prompt : p));
    setSystemPrompts(next);
    const nextActive = activePromptId ?? prompt.id;
    if (!activePromptId) {
      setActivePromptId(prompt.id);
    }
    savePrompts(next, nextActive);
  }

  function handleDeletePrompt(id: string) {
    const next = systemPrompts.filter((p) => p.id !== id);
    const nextActive = activePromptId === id ? null : activePromptId;
    setSystemPrompts(next);
    setActivePromptId(nextActive);
    savePrompts(next, nextActive);
  }

  function handleSelectPrompt(id: string | null) {
    setActivePromptId(id);
    savePrompts(systemPrompts, id);
  }

  const connectedCount = mcpServers.filter((server) => server.connectionStatus === "connected").length;
  const tokenTotals = useMemo(
    () =>
      messages.reduce(
        (totals, message) => ({
          inputTokens: (totals.inputTokens ?? 0) + (message.usage?.inputTokens ?? 0),
          outputTokens: (totals.outputTokens ?? 0) + (message.usage?.outputTokens ?? 0),
          totalTokens: (totals.totalTokens ?? 0) + (message.usage?.totalTokens ?? 0),
        }),
        { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      ),
    [messages],
  );
  const tokenUsageState = useMemo(() => {
    const assistantResponses = messages.filter(
      (message) =>
        message.role === "assistant" &&
        message.id !== "assistant-welcome" &&
        message.id !== "storage-version-notice" &&
        message.status !== "streaming",
    );

    if (assistantResponses.length === 0) {
      return "idle" as const;
    }

    return assistantResponses.some(
      (message) =>
        (message.usage?.inputTokens ?? message.usage?.outputTokens ?? message.usage?.totalTokens) != null,
    )
      ? ("available" as const)
      : ("unavailable" as const);
  }, [messages]);
  const promptProps = {
    systemPrompts,
    activePromptId,
    onAddPrompt: handleAddPrompt,
    onEditPrompt: handleEditPrompt,
    onDeletePrompt: handleDeletePrompt,
    onSelectPrompt: handleSelectPrompt,
  };
  const llmProps = {
    llmConfig,
    onChangeLlmConfig: setLlmConfig,
    usageTotals: tokenTotals,
    usageState: tokenUsageState,
  };
  const showStarters =
    messages.length === 1 &&
    messages[0]?.id === "assistant-welcome" &&
    toolEvents.length === 0 &&
    !isStreaming;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-transparent">
      <SidebarDrawer
        isOpen={isSidebarOpen}
        {...promptProps}
        {...llmProps}
        onAddServer={() => {
          setEditingServerId(null);
          setIsSidebarOpen(false);
          setIsMcpDialogOpen(true);
        }}
        onClose={() => setIsSidebarOpen(false)}
        onEditServer={(serverId) => {
          setEditingServerId(serverId);
          setIsSidebarOpen(false);
          setIsMcpDialogOpen(true);
        }}
        onRemoveServer={handleRemoveServer}
        onRetestServer={handleRetestServer}
        retestingServerIds={retestingServerIds}
        servers={mcpServers}
      />
      <McpServerDialog
        key={`${editingServer?.id ?? "new"}-${isMcpDialogOpen ? "open" : "closed"}`}
        initialServer={editingServer}
        isOpen={isMcpDialogOpen}
        onClose={() => {
          setIsMcpDialogOpen(false);
          setEditingServerId(null);
        }}
        onSave={handleSaveServer}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
        <Topbar
          connectedCount={connectedCount}
          totalCount={mcpServers.length}
          onNewConversation={handleNewConversation}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onCopySession={handleCopySession}
        />
        <div
          className="mx-auto flex min-h-0 w-full max-w-[1380px] justify-center gap-8 px-6 pb-4 pt-4 relative transition-all duration-300"
          style={{ height: "calc(100dvh - 52px)" }}
        >
          <aside className="hidden w-[340px] shrink-0 xl:block">
            <SidebarTools
              {...promptProps}
              {...llmProps}
              onAddServer={() => {
                setEditingServerId(null);
                setIsMcpDialogOpen(true);
              }}
              onEditServer={(serverId) => {
                setEditingServerId(serverId);
                setIsMcpDialogOpen(true);
              }}
              onRemoveServer={handleRemoveServer}
              onRetestServer={handleRetestServer}
              retestingServerIds={retestingServerIds}
              servers={mcpServers}
            />
          </aside>
          <div className="flex h-full min-h-0 flex-1 max-w-[920px] flex-col overflow-hidden">
            <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
              <ChatThread
                isStreaming={isStreaming}
                items={items}
                onFeedback={handleFeedback}
                scrollRequest={scrollRequest}
              />
            </main>
            {feedbackError ? (
              <div
                role="alert"
                aria-live="polite"
                className="mx-4 mb-2 rounded-lg border border-[var(--color-error-soft)] bg-[var(--color-error-soft)]/40 px-3 py-2 text-[12px] text-[var(--color-error)] sm:mx-6"
              >
                {feedbackError}
              </div>
            ) : null}
            <div className="shrink-0 px-3 pb-4 pt-2 sm:px-5">
              <MessageComposer
                isSubmitting={isStreaming}
                onStop={handleStop}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
