export type AppLocale = "pt-BR" | "en";

export type TranslationKey =
  | "app.name"
  | "app.version"
  | "theme.label"
  | "theme.light"
  | "theme.dark"
  | "theme.system"
  | "language.label"
  | "language.pt"
  | "language.en"
  | "topbar.newConversation"
  | "topbar.copySession"
  | "topbar.sessionCopied"
  | "topbar.configureLlm"
  | "topbar.mcpCount"
  | "sidebar.closeMenu"
  | "sidebar.validating"
  | "sidebar.connected"
  | "sidebar.disconnected"
  | "sidebar.failed"
  | "sidebar.pending"
  | "sidebar.localCommand"
  | "sidebar.remoteEndpoint"
  | "sidebar.connectionFailed"
  | "sidebar.noTools"
  | "sidebar.hideTools"
  | "sidebar.showTools"
  | "sidebar.promptTitle"
  | "sidebar.addPrompt"
  | "sidebar.promptActive"
  | "sidebar.promptHint"
  | "sidebar.editPrompt"
  | "sidebar.removePrompt"
  | "sidebar.promptDialogTitle"
  | "sidebar.promptDialogDescription"
  | "sidebar.promptField"
  | "sidebar.promptPlaceholder"
  | "sidebar.cancel"
  | "sidebar.save"
  | "sidebar.add"
  | "sidebar.llmConfigTitle"
  | "sidebar.noConnection"
  | "sidebar.ready"
  | "sidebar.llmHint"
  | "sidebar.selectProvider"
  | "sidebar.chooseProvider"
  | "sidebar.testConnection"
  | "sidebar.editConnection"
  | "sidebar.removeConnection"
  | "sidebar.test"
  | "sidebar.testing"
  | "sidebar.saving"
  | "sidebar.saved"
  | "sidebar.saveBrowser"
  | "sidebar.fillBeforeTest"
  | "sidebar.fillBeforeSave"
  | "sidebar.testSuccess"
  | "sidebar.testFailed"
  | "sidebar.networkError"
  | "sidebar.saveFailed"
  | "sidebar.tokens"
  | "sidebar.input"
  | "sidebar.output"
  | "sidebar.total"
  | "sidebar.tokensUnavailable"
  | "sidebar.mcpTitle"
  | "sidebar.addMcp"
  | "sidebar.emptyServers"
  | "chat.welcome"
  | "chat.sessionLogTitle"
  | "chat.assistant"
  | "chat.you"
  | "chat.emptyContent"
  | "chat.copySessionError"
  | "composer.label"
  | "composer.placeholder"
  | "composer.streamingHelp"
  | "composer.idleHelp"
  | "composer.stop"
  | "composer.send"
  | "message.you"
  | "message.assistant"
  | "message.stopped"
  | "message.error"
  | "message.copy"
  | "message.copied"
  | "message.copyResponse"
  | "message.thinking"
  | "message.helpful"
  | "message.notHelpful"
  | "message.responseCopied"
  | "starters.eyebrow"
  | "starters.title"
  | "starters.description"
  | "starters.workspace.label"
  | "starters.workspace.prompt"
  | "starters.flow.label"
  | "starters.flow.prompt"
  | "starters.diagnostics.label"
  | "starters.diagnostics.prompt"
  | "starters.example.label"
  | "starters.example.prompt"
  | "audio.unavailable"
  | "audio.autoFailed"
  | "audio.permissionDenied"
  | "audio.noTranscript"
  | "audio.stopRecording"
  | "audio.discardRecording"
  | "audio.retry"
  | "audio.startRecording"
  | "audio.unsupported"
  | "audio.speakToTranscribe"
  | "tool.running"
  | "tool.completed"
  | "tool.failed"
  | "tool.attachedMcp"
  | "tool.doneClickDetails"
  | "tool.imagesDetected"
  | "tool.arguments"
  | "tool.result"
  | "tool.remoteImage"
  | "tool.previewFailed"
  | "tool.openImage"
  | "tool.imageAlt";

type TranslationTable = Record<TranslationKey, string>;

export const translations: Record<AppLocale, TranslationTable> = {
  "pt-BR": {
    "app.name": "mcp-hub-ui",
    "app.version": "v1.0.0",
    "theme.label": "Tema",
    "theme.light": "Claro",
    "theme.dark": "Escuro",
    "theme.system": "Sistema",
    "language.label": "Idioma",
    "language.pt": "Português",
    "language.en": "Inglês",
    "topbar.newConversation": "Nova conversa",
    "topbar.copySession": "Copiar sessão",
    "topbar.sessionCopied": "Sessão copiada",
    "topbar.configureLlm": "Configurar LLM",
    "topbar.mcpCount": "MCPs",
    "sidebar.closeMenu": "Fechar menu",
    "sidebar.validating": "Validando",
    "sidebar.connected": "Conectado",
    "sidebar.disconnected": "Desconectado",
    "sidebar.failed": "Falha",
    "sidebar.pending": "Pendente",
    "sidebar.localCommand": "Comando local",
    "sidebar.remoteEndpoint": "Endpoint remoto",
    "sidebar.connectionFailed": "Falha de conexão com o endpoint.",
    "sidebar.noTools": "O servidor não expôs nenhuma ferramenta.",
    "sidebar.hideTools": "Ocultar tools",
    "sidebar.showTools": "Ver tools",
    "sidebar.promptTitle": "Instruções",
    "sidebar.addPrompt": "Adicionar instruções",
    "sidebar.promptActive": "Ativa",
    "sidebar.promptHint": "Edite esse bloco para ajustar o comportamento base do agente sem mudar a cor do app.",
    "sidebar.editPrompt": "Editar prompt",
    "sidebar.removePrompt": "Remover prompt",
    "sidebar.promptDialogTitle": "Instruções",
    "sidebar.promptDialogDescription": "Defina o comportamento base enviado ao modelo antes da conversa.",
    "sidebar.promptField": "Instruções",
    "sidebar.promptPlaceholder": "Ex.: mostre os dados de forma estruturada e priorize contexto de rede antes de diagnóstico individual.",
    "sidebar.cancel": "Cancelar",
    "sidebar.save": "Salvar",
    "sidebar.add": "Adicionar",
    "sidebar.llmConfigTitle": "Configuração LLM",
    "sidebar.noConnection": "Sem conexão",
    "sidebar.ready": "Pronta",
    "sidebar.llmHint": "Clique no lápis para editar ou no refresh para validar.",
    "sidebar.selectProvider": "Selecionar provedor",
    "sidebar.chooseProvider": "Escolha um provider para configurar a conexão",
    "sidebar.testConnection": "Testar conexão LLM",
    "sidebar.editConnection": "Editar conexão LLM",
    "sidebar.removeConnection": "Remover conexão LLM",
    "sidebar.test": "Testar",
    "sidebar.testing": "Testando",
    "sidebar.saving": "Salvando",
    "sidebar.saved": "Configuração salva neste navegador.",
    "sidebar.saveBrowser": "Tudo fica salvo apenas neste navegador.",
    "sidebar.fillBeforeTest": "Preencha todos os campos antes de testar.",
    "sidebar.fillBeforeSave": "Preencha todos os campos antes de salvar.",
    "sidebar.testSuccess": "Conexão validada com sucesso.",
    "sidebar.testFailed": "Falha ao conectar.",
    "sidebar.networkError": "Erro de rede ao testar a conexão.",
    "sidebar.saveFailed": "Não foi possível salvar a configuração.",
    "sidebar.tokens": "Tokens acumulados",
    "sidebar.input": "Entrada",
    "sidebar.output": "Saída",
    "sidebar.total": "Total",
    "sidebar.tokensUnavailable": "Tokens indisponíveis para este provider/modelo.",
    "sidebar.mcpTitle": "MCP Server",
    "sidebar.addMcp": "Adicionar MCP",
    "sidebar.emptyServers": "Adicione um MCP via STDIO, SSE ou Streamable HTTP.",
    "chat.welcome": "Olá! Em que posso ajudá-lo hoje? :)",
    "chat.sessionLogTitle": "Portal MCP Dev - Log de Sessão",
    "chat.assistant": "Assistente",
    "chat.you": "Você",
    "chat.emptyContent": "(Conteúdo vazio / Erro)",
    "chat.copySessionError": "Falha ao copiar a sessão",
    "composer.label": "Mensagem para o assistente",
    "composer.placeholder": "Pergunte algo, cole contexto ou use um starter acima…",
    "composer.streamingHelp": "Gerando resposta. Clique em parar para interromper.",
    "composer.idleHelp": "Composer do chat",
    "composer.stop": "Parar geração",
    "composer.send": "Enviar mensagem",
    "message.you": "Você",
    "message.assistant": "Assistente",
    "message.stopped": "Interrompida",
    "message.error": "Erro",
    "message.copy": "Copiar",
    "message.copied": "Copiado",
    "message.copyResponse": "Copiar resposta",
    "message.thinking": "Pensando…",
    "message.helpful": "Útil",
    "message.notHelpful": "Não útil",
    "message.responseCopied": "Resposta copiada.",
    "starters.eyebrow": "Empty state",
    "starters.title": "Comece com fluxo real, não com tela vazia.",
    "starters.description": "Dispare perguntas úteis para validar conexão, ferramentas e comportamento base do agente logo no primeiro minuto.",
    "starters.workspace.label": "Panorama do workspace",
    "starters.workspace.prompt": "Me dê um panorama do workspace MCP, dos servidores conectados e do que já posso testar.",
    "starters.flow.label": "Configurar primeiro fluxo",
    "starters.flow.prompt": "Monte um primeiro fluxo para validar chat, MCPs e instruções de sistema neste portal.",
    "starters.diagnostics.label": "Diagnóstico rápido",
    "starters.diagnostics.prompt": "Quais checks devo fazer se um MCP conectar mas não expor ferramentas?",
    "starters.example.label": "Exemplo real",
    "starters.example.prompt": "Simule uma pergunta real usando ferramentas MCP e explique o passo a passo.",
    "audio.unavailable": "Transcrição por voz indisponível neste navegador.",
    "audio.autoFailed": "Falha na transcrição automática.",
    "audio.permissionDenied": "Permissão de microfone negada ou indisponível.",
    "audio.noTranscript": "Não foi possível transcrever o áudio. Tente novamente ou digite manualmente.",
    "audio.stopRecording": "Parar gravação",
    "audio.discardRecording": "Descartar gravação",
    "audio.retry": "Tentar novamente",
    "audio.startRecording": "Iniciar gravação por voz",
    "audio.unsupported": "Transcrição por voz indisponível",
    "audio.speakToTranscribe": "Falar para transcrever no campo",
    "tool.running": "Executando",
    "tool.completed": "Concluída",
    "tool.failed": "Falha",
    "tool.attachedMcp": "MCP anexado",
    "tool.doneClickDetails": "Execução concluída. Clique para detalhes.",
    "tool.imagesDetected": "Imagens detectadas",
    "tool.arguments": "Argumentos",
    "tool.result": "Resultado",
    "tool.remoteImage": "Imagem remota",
    "tool.previewFailed": "Não foi possível carregar preview.",
    "tool.openImage": "Abrir imagem",
    "tool.imageAlt": "Preview da imagem retornada pela tool",
  },
  en: {
    "app.name": "mcp-hub-ui",
    "app.version": "v1.0.0",
    "theme.label": "Theme",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
    "language.label": "Language",
    "language.pt": "Portuguese",
    "language.en": "English",
    "topbar.newConversation": "New chat",
    "topbar.copySession": "Copy session",
    "topbar.sessionCopied": "Session copied",
    "topbar.configureLlm": "Configure LLM",
    "topbar.mcpCount": "MCPs",
    "sidebar.closeMenu": "Close menu",
    "sidebar.validating": "Validating",
    "sidebar.connected": "Connected",
    "sidebar.disconnected": "Disconnected",
    "sidebar.failed": "Failed",
    "sidebar.pending": "Pending",
    "sidebar.localCommand": "Local command",
    "sidebar.remoteEndpoint": "Remote endpoint",
    "sidebar.connectionFailed": "Connection to endpoint failed.",
    "sidebar.noTools": "Server did not expose any tools.",
    "sidebar.hideTools": "Hide tools",
    "sidebar.showTools": "Show tools",
    "sidebar.promptTitle": "Instructions",
    "sidebar.addPrompt": "Add instructions",
    "sidebar.promptActive": "Active",
    "sidebar.promptHint": "Edit this block to adjust base agent behavior without changing app styling.",
    "sidebar.editPrompt": "Edit prompt",
    "sidebar.removePrompt": "Remove prompt",
    "sidebar.promptDialogTitle": "Instructions",
    "sidebar.promptDialogDescription": "Define base behavior sent to model before conversation starts.",
    "sidebar.promptField": "Instructions",
    "sidebar.promptPlaceholder": "Ex.: present data in structured form and prioritize network context before host-level diagnosis.",
    "sidebar.cancel": "Cancel",
    "sidebar.save": "Save",
    "sidebar.add": "Add",
    "sidebar.llmConfigTitle": "LLM Configuration",
    "sidebar.noConnection": "No connection",
    "sidebar.ready": "Ready",
    "sidebar.llmHint": "Click pencil to edit or refresh to validate.",
    "sidebar.selectProvider": "Select provider",
    "sidebar.chooseProvider": "Choose a provider to configure the connection",
    "sidebar.testConnection": "Test LLM connection",
    "sidebar.editConnection": "Edit LLM connection",
    "sidebar.removeConnection": "Remove LLM connection",
    "sidebar.test": "Test",
    "sidebar.testing": "Testing",
    "sidebar.saving": "Saving",
    "sidebar.saved": "Configuration saved in this browser.",
    "sidebar.saveBrowser": "Everything stays only in this browser.",
    "sidebar.fillBeforeTest": "Fill every field before testing.",
    "sidebar.fillBeforeSave": "Fill every field before saving.",
    "sidebar.testSuccess": "Connection validated successfully.",
    "sidebar.testFailed": "Connection failed.",
    "sidebar.networkError": "Network error while testing connection.",
    "sidebar.saveFailed": "Could not save configuration.",
    "sidebar.tokens": "Accumulated tokens",
    "sidebar.input": "Input",
    "sidebar.output": "Output",
    "sidebar.total": "Total",
    "sidebar.tokensUnavailable": "Token usage unavailable for this provider/model.",
    "sidebar.mcpTitle": "MCP Server",
    "sidebar.addMcp": "Add MCP",
    "sidebar.emptyServers": "Add an MCP via STDIO, SSE or Streamable HTTP.",
    "chat.welcome": "Hello! How can I help you today? :)",
    "chat.sessionLogTitle": "Portal MCP Dev - Session Log",
    "chat.assistant": "Assistant",
    "chat.you": "You",
    "chat.emptyContent": "(Empty content / Error)",
    "chat.copySessionError": "Failed to copy session",
    "composer.label": "Message to assistant",
    "composer.placeholder": "Ask something, paste context, or use a starter above…",
    "composer.streamingHelp": "Generating response. Click stop to interrupt.",
    "composer.idleHelp": "Chat composer",
    "composer.stop": "Stop generation",
    "composer.send": "Send message",
    "message.you": "You",
    "message.assistant": "Assistant",
    "message.stopped": "Stopped",
    "message.error": "Error",
    "message.copy": "Copy",
    "message.copied": "Copied",
    "message.copyResponse": "Copy response",
    "message.thinking": "Thinking…",
    "message.helpful": "Helpful",
    "message.notHelpful": "Not helpful",
    "message.responseCopied": "Response copied.",
    "starters.eyebrow": "Empty state",
    "starters.title": "Start with real flow, not empty screen.",
    "starters.description": "Launch useful prompts to validate connection, tools, and base agent behavior in first minute.",
    "starters.workspace.label": "Workspace overview",
    "starters.workspace.prompt": "Give me an overview of this MCP workspace, connected servers, and what I can already test.",
    "starters.flow.label": "Set up first flow",
    "starters.flow.prompt": "Build a first flow to validate chat, MCPs, and system instructions in this portal.",
    "starters.diagnostics.label": "Quick diagnostics",
    "starters.diagnostics.prompt": "What checks should I run if an MCP connects but exposes no tools?",
    "starters.example.label": "Real example",
    "starters.example.prompt": "Simulate a real question using MCP tools and explain the step by step.",
    "audio.unavailable": "Voice transcription unavailable in this browser.",
    "audio.autoFailed": "Automatic transcription failed.",
    "audio.permissionDenied": "Microphone permission denied or unavailable.",
    "audio.noTranscript": "Could not transcribe audio. Try again or type manually.",
    "audio.stopRecording": "Stop recording",
    "audio.discardRecording": "Discard recording",
    "audio.retry": "Try again",
    "audio.startRecording": "Start voice recording",
    "audio.unsupported": "Voice transcription unavailable",
    "audio.speakToTranscribe": "Speak to transcribe into field",
    "tool.running": "Running",
    "tool.completed": "Completed",
    "tool.failed": "Failed",
    "tool.attachedMcp": "Attached MCP",
    "tool.doneClickDetails": "Run completed. Click for details.",
    "tool.imagesDetected": "Detected images",
    "tool.arguments": "Arguments",
    "tool.result": "Result",
    "tool.remoteImage": "Remote image",
    "tool.previewFailed": "Could not load preview.",
    "tool.openImage": "Open image",
    "tool.imageAlt": "Preview of image returned by tool",
  },
};

export function translate(locale: AppLocale, key: TranslationKey) {
  return translations[locale][key];
}
