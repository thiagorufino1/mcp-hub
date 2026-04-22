"use client";

import { CheckCircle2, LoaderCircle, PencilLine, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

import { useAppPreferences } from "@/components/providers/app-preferences-provider";
import { ProviderForm, buildLLMConfig } from "@/components/setup/provider-form";
import { PROVIDERS } from "@/components/setup/provider-selector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LLMConfig } from "@/types/llm-config";

type Props = {
  initialConfig?: LLMConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: LLMConfig) => Promise<void>;
};

export function LlmConfigDialog({ initialConfig, isOpen, onClose, onSave }: Props) {
  const { t } = useAppPreferences();
  const [selectedProvider, setSelectedProvider] = useState<LLMConfig["provider"] | null>(
    initialConfig?.provider ?? null,
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    (initialConfig as unknown as Record<string, string>) ?? {},
  );
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedProvider(initialConfig?.provider ?? null);
      setFieldValues((initialConfig as unknown as Record<string, string>) ?? {});
      setError(null);
      setTestSuccess(false);
    }
  }, [isOpen, initialConfig]);

  function handleProviderSelect(provider: LLMConfig["provider"]) {
    setSelectedProvider(provider);
    setFieldValues((current) => (current.provider === provider ? current : {}));
    setError(null);
    setTestSuccess(false);
  }

  function handleFieldChange(key: string, value: string) {
    setFieldValues((current) => ({ ...current, [key]: value }));
    setError(null);
    setTestSuccess(false);
  }

  async function handleTest() {
    if (!selectedProvider) return;
    const llmConfig = buildLLMConfig(selectedProvider, fieldValues);
    if (!llmConfig) {
      setError(t("sidebar.fillBeforeTest"));
      return;
    }

    setIsTesting(true);
    setError(null);
    setTestSuccess(false);

    try {
      const response = await fetch("/api/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ llmConfig }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setTestSuccess(true);
      } else {
        setError(data.error ?? t("sidebar.testFailed"));
      }
    } catch {
      setError(t("sidebar.networkError"));
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedProvider) return;
    const llmConfig = buildLLMConfig(selectedProvider, fieldValues);
    if (!llmConfig) {
      setError(t("sidebar.fillBeforeSave"));
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(llmConfig);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("sidebar.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  const canSave = selectedProvider && buildLLMConfig(selectedProvider, fieldValues) !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSaving) onClose(); }}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-2xl border border-[#dbe4f1] bg-[var(--color-surface)] p-0 shadow-[0_20px_48px_rgba(15,23,42,0.10)]">
        <DialogHeader className="border-b border-[#dbe4f1] bg-[var(--color-surface)] px-6 py-4">
          <DialogTitle className="text-base font-semibold text-foreground">
            {initialConfig ? "Editar Configuração LLM" : "Adicionar LLM"}
          </DialogTitle>
          <DialogDescription className="pt-1 text-[13px] text-[var(--color-text-secondary)]">
            Escolha provedor, informe credenciais e teste conexao antes de salvar.
          </DialogDescription>
        </DialogHeader>

        <form className="app-scroll flex max-h-[calc(90vh-160px)] flex-col gap-5 overflow-y-auto bg-[var(--color-bg)] px-6 py-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Provedor</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 rounded-2xl border border-[#dbe4f1] bg-[var(--color-surface-muted)] p-1">
              {PROVIDERS.map((provider) => {
                const isSelected = selectedProvider === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderSelect(provider.id)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl py-2 px-1 text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "bg-[var(--color-surface)] shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
                        : "hover:bg-[var(--color-surface)]/60",
                    )}
                  >
                    <span className={cn("flex size-7 items-center justify-center rounded-full text-[10px] font-bold mb-1", provider.markClassName)}>
                      {provider.icon || provider.mark}
                    </span>
                    <span className={cn("text-[11px] font-semibold truncate w-full", isSelected ? "text-foreground" : "text-muted-foreground")}>
                      {provider.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedProvider && (
            <div className="space-y-4">
               <ProviderForm provider={selectedProvider} values={fieldValues} onChange={handleFieldChange} />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[var(--color-error-soft)] bg-[var(--color-error-soft)] p-3 text-[13px] text-[var(--color-error)]">
              <span className="mt-1.5 flex-none size-1.5 shrink-0 rounded-full bg-[var(--color-error)]" />
              <div className="app-scroll max-h-[120px] flex-1 overflow-y-auto break-all font-mono text-[11px] leading-5">
                {error}
              </div>
            </div>
          )}

          {testSuccess && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-success-soft)] bg-[var(--color-success-soft)]/40 p-3 text-[13px] text-[var(--color-success)]">
              <CheckCircle2 className="size-4" />
              <span>{t("sidebar.testSuccess")}</span>
            </div>
          )}

          <DialogFooter className="items-center justify-end gap-3 border-t border-[#dbe4f1] pt-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => void handleTest()}
                disabled={isTesting || !canSave}
                className="rounded-lg text-muted-foreground hover:text-foreground"
              >
                {isTesting ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {t("sidebar.test")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-lg text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !canSave}
                className="rounded-lg bg-[var(--color-primary)] text-white shadow-none hover:bg-[var(--color-primary-hover)]"
              >
                {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : initialConfig ? <PencilLine className="size-4" /> : <CheckCircle2 className="size-4" />}
                {isSaving ? t("sidebar.saving") : initialConfig ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
