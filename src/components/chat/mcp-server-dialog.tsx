"use client";

import { CheckCircle2, LoaderCircle, PencilLine, Plus, Trash2 } from "@/components/ui/icons";
import { useEffect, useRef, useState } from "react";

import { useAppPreferences } from "@/components/providers/app-preferences-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { McpApprovalMode, McpServerConfig, McpTransport } from "@/types/mcp";

type Props = {
  initialServer?: McpServerConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (server: McpServerConfig) => Promise<void>;
};

type ArgItem = { id: string; value: string };
type KVItem = { id: string; key: string; value: string };

function createDraft(server?: McpServerConfig | null) {
  return {
    approvalMode: server?.approvalMode ?? ("always" satisfies McpApprovalMode),
    args: (server?.args ?? []).map((v) => ({ id: crypto.randomUUID(), value: v })),
    approvedToolNames: server?.approvedToolNames ?? [],
    command: server?.command ?? "",
    env: Object.entries(server?.env ?? {}).map(([k, v]) => ({ id: crypto.randomUUID(), key: k, value: v })),
    headers: Object.entries(server?.headers ?? {}).map(([k, v]) => ({ id: crypto.randomUUID(), key: k, value: v })),
    name: server?.name ?? "",
    transport: server?.transport ?? ("streamable-http" satisfies McpTransport),
    url: server?.url ?? "",
  };
}

export function McpServerDialog({ initialServer, isOpen, onClose, onSave }: Props) {
  const { t } = useAppPreferences();
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const [draft] = useState(() => createDraft(initialServer));
  const [name, setName] = useState(draft.name);
  const [transport, setTransport] = useState<McpTransport>(draft.transport);
  const [approvalMode, setApprovalMode] = useState<McpApprovalMode>(draft.approvalMode);
  const [approvedToolNames, setApprovedToolNames] = useState<string[]>(draft.approvedToolNames);
  const [command, setCommand] = useState(draft.command);
  const [args, setArgs] = useState<ArgItem[]>(draft.args);
  const [url, setUrl] = useState(draft.url);
  const [envItems, setEnvItems] = useState<KVItem[]>(draft.env);
  const [headerItems, setHeaderItems] = useState<KVItem[]>(draft.headers);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const transportOptions: Array<{ value: McpTransport; label: string; hint: string }> = [
    { value: "stdio", label: "STDIO", hint: t("mcp.stdio.hint") },
    { value: "sse", label: "SSE", hint: t("mcp.sse.hint") },
    { value: "streamable-http", label: "HTTP", hint: t("mcp.http.hint") },
  ];
  const approvalOptions: Array<{ value: McpApprovalMode; label: string; hint: string; disabled?: boolean }> = [
    { value: "always", label: "All tools", hint: "Allow this server to expose all discovered tools to chat." },
    {
      value: "selected",
      label: "Selected tools",
      hint: "Expose only checked tools after first successful inspection.",
      disabled: !initialServer?.tools.length,
    },
    { value: "never", label: "Inspect only", hint: "Keep tool execution disabled for this server." },
  ];
  const availableTools = initialServer?.tools ?? [];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  function handleClose() {
    if (isSaving) {
      return;
    }

    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedCommand = command.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      setError(t("mcp.errorName"));
      return;
    }

    if (transport === "stdio" && !trimmedCommand) {
      setError(t("mcp.errorCommand"));
      return;
    }

    if (transport !== "stdio" && !trimmedUrl) {
      setError(t("mcp.errorUrl"));
      return;
    }

    setIsSaving(true);
    setError(null);

    const safeArgs = args.map(a => a.value.trim()).filter(Boolean);
    const safeEnv = envItems.reduce((acc, item) => {
      const k = item.key.trim();
      if (k) acc[k] = item.value.trim();
      return acc;
    }, {} as Record<string, string>);
    const safeHeaders = headerItems.reduce((acc, item) => {
      const k = item.key.trim();
      if (k) acc[k] = item.value.trim();
      return acc;
    }, {} as Record<string, string>);

    const normalizedApprovedToolNames =
      approvalMode === "selected"
        ? approvedToolNames.filter((toolName) =>
            availableTools.some((tool) => tool.name === toolName),
          )
        : [];

    try {
      await onSave({
        args: safeArgs,
        approvalMode,
        approvedToolNames: normalizedApprovedToolNames,
        command: transport === "stdio" ? trimmedCommand : undefined,
        connectionStatus: initialServer?.connectionStatus ?? "pending",
        enabled: initialServer?.enabled ?? true,
        env: transport === "stdio" ? safeEnv : {},
        errorMessage: initialServer?.errorMessage,
        headers: transport === "stdio" ? {} : safeHeaders,
        id: initialServer?.id ?? `mcp-${crypto.randomUUID()}`,
        lastCheckedAt: initialServer?.lastCheckedAt,
        name: trimmedName,
        tools: initialServer?.tools ?? [],
        transport,
        url: transport === "stdio" ? undefined : trimmedUrl,
      });
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : t("mcp.saveFailed"),
      );
      setIsSaving(false);
    }
  }

  const isEditing = Boolean(initialServer);

  function getUrlLabel() {
    return transport === "sse" ? t("mcp.sseUrlLabel") : "URL";
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-2xl border border-[#dbe4f1] bg-[var(--color-surface)] p-0 shadow-[0_20px_48px_rgba(15,23,42,0.10)]">
        <DialogHeader className="border-b border-[#dbe4f1] bg-[var(--color-surface)] px-6 py-4">
          <DialogTitle className="text-base font-semibold text-foreground">
            {isEditing ? t("mcp.editTitle") : t("mcp.addTitle")}
          </DialogTitle>
          <DialogDescription className="pt-1 text-[13px] text-[var(--color-text-secondary)]">
            {t("mcp.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          className="app-scroll flex max-h-[calc(90vh-160px)] flex-col gap-5 overflow-y-auto bg-[var(--color-bg)] px-6 py-5"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="space-y-1.5">
            <Label htmlFor="mcp-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("mcp.name")}</Label>
            <Input
              id="mcp-name"
              ref={firstFieldRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 text-[13px] rounded-xl border-[#dbe4f1] bg-[var(--color-surface)] shadow-[0_1px_4px_rgba(15,23,42,0.04)] focus-visible:border-[var(--color-primary)] focus-visible:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("mcp.transport")}</Label>
            <div className="flex rounded-2xl border border-[#dbe4f1] bg-[var(--color-surface-muted)] p-1 gap-1">
              {transportOptions.map((option) => {
                const isSelected = transport === option.value;
                return (
                  <button
                    key={option.value}
                    className={cn(
                      "flex-1 rounded-xl px-3 py-1.5 text-center text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "bg-[var(--color-surface)] shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
                        : "hover:bg-[var(--color-surface)]/60",
                    )}
                    onClick={() => setTransport(option.value)}
                    type="button"
                  >
                    <span className={cn("block font-semibold", isSelected ? "text-foreground" : "text-muted-foreground")}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tool approval</Label>
            <div className="grid gap-2">
              {approvalOptions.map((option) => {
                const isSelected = approvalMode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => setApprovalMode(option.value)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition-all duration-150",
                      option.disabled
                        ? "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-muted-foreground/60"
                        : isSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                          : "border-[#dbe4f1] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-foreground">{option.label}</span>
                      {isSelected ? <CheckCircle2 className="size-4 text-[var(--color-primary)]" /> : null}
                    </div>
                    <p className="mt-1 text-[12px] leading-5 text-[var(--color-text-secondary)]">{option.hint}</p>
                  </button>
                );
              })}
            </div>
            {approvalMode === "selected" ? (
              <div className="rounded-2xl border border-[#dbe4f1] bg-[var(--color-surface)] p-3">
                {availableTools.length > 0 ? (
                  <div className="space-y-2">
                    {availableTools.map((tool) => {
                      const checked = approvedToolNames.includes(tool.name);
                      return (
                        <label key={tool.name} className="flex cursor-pointer items-start gap-3 rounded-xl border border-transparent px-2 py-2 hover:border-[#dbe4f1]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              setApprovedToolNames((current) =>
                                event.target.checked
                                  ? [...new Set([...current, tool.name])]
                                  : current.filter((name) => name !== tool.name),
                              );
                            }}
                            className="mt-0.5"
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-foreground">{tool.name}</p>
                            {tool.description ? (
                              <p className="mt-0.5 text-[12px] leading-5 text-[var(--color-text-secondary)]">
                                {tool.description}
                              </p>
                            ) : null}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[12px] leading-5 text-[var(--color-text-secondary)]">
                    Save and validate server first. Then reopen dialog to choose specific tools.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          {transport === "stdio" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="mcp-command" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("mcp.command")}</Label>
                <Input
                  id="mcp-command"
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                  className="h-10 text-[13px] rounded-xl border-[#dbe4f1] bg-[var(--color-surface)] shadow-[0_1px_4px_rgba(15,23,42,0.04)] focus-visible:border-[var(--color-primary)] focus-visible:ring-0"
                />
              </div>

              {/* Args List */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("mcp.args")}</Label>
                <div className="space-y-2">
                  {args.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Input
                        value={item.value}
                        onChange={(e) => {
                          const newArgs = [...args];
                          newArgs[index].value = e.target.value;
                          setArgs(newArgs);
                        }}
                        className="h-10 rounded-xl border-[#dbe4f1] bg-[var(--color-surface)] shadow-[0_1px_4px_rgba(15,23,42,0.04)] focus-visible:border-[var(--color-primary)] focus-visible:ring-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-10 shrink-0 text-muted-foreground hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)] rounded-xl"
                        onClick={() => setArgs(args.filter(a => a.id !== item.id))}
                      >
                        <Trash2 className="size-[14px]" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setArgs([...args, { id: crypto.randomUUID(), value: "" }])}
                    className="w-full rounded-xl border-dashed border-[#dbe4f1] text-[12px] text-muted-foreground hover:bg-muted/50"
                  >
                    <Plus className="mr-1 size-3.5" /> {t("mcp.addArg")}
                  </Button>
                </div>
              </div>

              {/* Env Variables List */}
              <div className="space-y-2 pt-2 border-t border-[#dbe4f1]">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("mcp.env")}</Label>
                <div className="space-y-2">
                  {envItems.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-2">
                      <Input
                        value={item.key}
                        onChange={(e) => {
                          const newEnv = [...envItems];
                          newEnv[index].key = e.target.value;
                          setEnvItems(newEnv);
                        }}
                        className="h-10 font-mono text-[12px] sm:w-[160px] rounded-xl border-[#dbe4f1] bg-[var(--color-surface)] shadow-[0_1px_4px_rgba(15,23,42,0.04)] focus-visible:border-[var(--color-primary)] focus-visible:ring-0"
                      />
                      <span className="hidden sm:inline text-muted-foreground">=</span>
                      <Input
                        value={item.value}
                        onChange={(e) => {
                          const newEnv = [...envItems];
                          newEnv[index].value = e.target.value;
                          setEnvItems(newEnv);
                        }}
                        className="h-10 font-mono text-[12px] flex-1 rounded-xl border-[#dbe4f1] bg-[var(--color-surface)] shadow-[0_1px_4px_rgba(15,23,42,0.04)] focus-visible:border-[var(--color-primary)] focus-visible:ring-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-10 shrink-0 text-muted-foreground hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)] rounded-xl"
                        onClick={() => setEnvItems(envItems.filter(e => e.id !== item.id))}
                      >
                        <Trash2 className="size-[14px]" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEnvItems([...envItems, { id: crypto.randomUUID(), key: "", value: "" }])}
                    className="w-full rounded-xl border-dashed border-[#dbe4f1] text-[12px] text-muted-foreground hover:bg-muted/50"
                  >
                    <Plus className="mr-1 size-3.5" /> {t("mcp.addEnv")}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="mcp-url" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{getUrlLabel()}</Label>
                <Input
                  id="mcp-url"
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="h-10 text-[13px] rounded-xl border-[#dbe4f1] bg-[var(--color-surface)] shadow-[0_1px_4px_rgba(15,23,42,0.04)] focus-visible:border-[var(--color-primary)] focus-visible:ring-0"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-[#dbe4f1]">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("mcp.headers")}</Label>
                <div className="space-y-2">
                  {headerItems.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-2">
                      <Input
                        value={item.key}
                        onChange={(e) => {
                          const newHeaders = [...headerItems];
                          newHeaders[index].key = e.target.value;
                          setHeaderItems(newHeaders);
                        }}
                        className="h-10 font-mono text-[12px] sm:w-[200px] rounded-xl border-[#dbe4f1] bg-[var(--color-surface)] shadow-[0_1px_4px_rgba(15,23,42,0.04)] focus-visible:border-[var(--color-primary)] focus-visible:ring-0"
                      />
                      <span className="hidden sm:inline text-muted-foreground">=</span>
                      <Input
                        value={item.value}
                        onChange={(e) => {
                          const newHeaders = [...headerItems];
                          newHeaders[index].value = e.target.value;
                          setHeaderItems(newHeaders);
                        }}
                        className="h-10 font-mono text-[12px] flex-1 rounded-xl border-[#dbe4f1] bg-[var(--color-surface)] shadow-[0_1px_4px_rgba(15,23,42,0.04)] focus-visible:border-[var(--color-primary)] focus-visible:ring-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-10 shrink-0 text-muted-foreground hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)] rounded-xl"
                        onClick={() => setHeaderItems(headerItems.filter(h => h.id !== item.id))}
                      >
                        <Trash2 className="size-[14px]" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setHeaderItems([...headerItems, { id: crypto.randomUUID(), key: "", value: "" }])}
                    className="w-full rounded-xl border-dashed border-[#dbe4f1] text-[12px] text-muted-foreground hover:bg-muted/50"
                  >
                    <Plus className="mr-1 size-3.5" /> {t("mcp.addHeader")}
                  </Button>
                </div>
              </div>
            </>
          )}

          {error ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-[var(--color-error-soft)] bg-[var(--color-error-soft)] p-3 text-[13px] text-[var(--color-error)]">
              <span className="mt-1.5 flex-none size-1.5 shrink-0 rounded-full bg-[var(--color-error)]" />
              <div className="app-scroll max-h-[120px] flex-1 overflow-y-auto break-all font-mono text-[11px] leading-5">
                {error}
              </div>
            </div>
          ) : null}

          <DialogFooter className="items-center justify-end gap-3 border-t border-[#dbe4f1] pt-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSaving}
                className="rounded-lg text-muted-foreground hover:text-foreground"
              >
                {t("sidebar.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-lg text-white shadow-none hover:opacity-90"
                style={{ background: "var(--gradient-action)" }}
              >
                {isSaving ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : isEditing ? (
                  <PencilLine className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {isSaving
                  ? t("mcp.validating")
                  : isEditing
                    ? t("sidebar.save")
                    : t("sidebar.add")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
