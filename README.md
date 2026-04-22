# mcp-hub-ui

Local web UI for testing LLMs, MCP servers, tools, and chat workflows - runs entirely on your machine via `npx`.

## Quick Start

```bash
npx @thiagorufino/mcp-hub-ui
```

Opens automatically at `http://localhost:3000`. No account, no cloud, no setup.

```bash
# Custom port
npx @thiagorufino/mcp-hub-ui --port 4010
```

**Requires Node.js 20+**

---

## Features

### LLM Providers

Configure any of the 10 supported providers directly in the UI:

| Provider | Models |
|---|---|
| Anthropic | Claude 3.5 Sonnet, Claude Opus 4... |
| AWS Bedrock | Claude, Titan, Llama, Nova... |
| DeepSeek | DeepSeek V3, R1... |
| Google Gemini | Gemini 2.0 Flash, 1.5 Pro... |
| Groq | Llama 3.3, Mixtral (ultra-fast inference) |
| Microsoft Foundry | Azure OpenAI deployments |
| Mistral AI | Mistral Large, Codestral... |
| Ollama | Any local model |
| OpenAI | GPT-4o, o1, o3-mini... |
| xAI | Grok 2, Grok Vision... |

### MCP Servers

Connect to MCP servers over all three transports:

- **stdio** - local process spawned by the app
- **SSE** - remote server-sent events endpoint
- **Streamable HTTP** - modern MCP transport

Inspect tools, schemas, and execute calls directly from the sidebar.

- Automatic health revalidation - MCP status updates when a server goes offline or comes back
- Per-server recovery logic - one failing MCP does not block the others from being revalidated
- Manual retest controls - force validation whenever you want from the sidebar

### Chat

- Streaming responses with live token display
- Multi-turn conversation history
- Custom system prompt
- Tool activity trace - see every MCP tool call and result in real time
- Chart rendering - ask for charts, get interactive visualizations inline
- Audio input support
- MCP-aware chat requests - the app reuses a fresh validated MCP snapshot before exposing tools to the model

---

## Local Development

```bash
git clone https://github.com/thiagorufino1/mcp-hub-ui
cd mcp-hub-ui
npm install
npm run dev
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run build:package` | Build + bundle for npx distribution |
| `npm run lint` | ESLint |

---

## Stack

- **Next.js 16** (App Router, standalone output)
- **Vercel AI SDK 6** - unified streaming across all providers
- **@modelcontextprotocol/sdk** - MCP client
- **Tailwind CSS 4** + **Radix UI** + **shadcn/ui**
- **@lobehub/icons** - official AI provider brand icons

---

## Security

Runs 100% locally. Credentials are stored only in your browser's `localStorage` and never leave your machine.

- Do not expose the port to untrusted networks
- Do not paste real API keys into issues or screenshots
- MCP stdio servers are spawned as child processes - only connect to servers you trust

---

## Links

- GitHub: https://github.com/thiagorufino1/mcp-hub-ui
- Issues: https://github.com/thiagorufino1/mcp-hub-ui/issues
- npm: https://www.npmjs.com/package/@thiagorufino/mcp-hub-ui
