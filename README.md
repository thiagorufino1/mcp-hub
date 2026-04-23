# mcp-hub

Local web UI for testing LLMs, MCP servers, tools, and chat workflows - runs entirely on your machine via `npx`.

## Quick Start

```bash
npx @thiagorufino/mcp-hub
```

Starts on `http://127.0.0.1:3000` by default and opens the browser automatically. If the port is already taken, the CLI picks the next free local port.

No account. No cloud backend. Local-first runtime.

```bash
# Custom port
npx @thiagorufino/mcp-hub --port 4010

# Bind explicitly to localhost without auto-opening the browser
npx @thiagorufino/mcp-hub --host localhost --port 3000 --no-open

# IPv6 loopback is also allowed
npx @thiagorufino/mcp-hub --host ::1

# Show all options
npx @thiagorufino/mcp-hub --help
```

**Requires Node.js 20+**

The public CLI refuses non-local host binding. Allowed hosts are `127.0.0.1`, `localhost`, and `::1`.

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

### Packaging

- Distributed as a public npm CLI: `@thiagorufino/mcp-hub`
- Ships a standalone Next.js production bundle for `npx` execution
- Includes verification scripts for package layout, CLI behavior, and smoke testing before publish

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
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run test` | Unit and manifest checks |
| `npm run test:smoke` | Start the packaged CLI and verify HTTP boot |
| `npm run prepare:publish-dir` | Build the publish-ready directory |
| `npm run pack:check` | Validate the tarball produced for publish |
| `npm run publish:package-dir` | Alias for preparing the publish-ready directory |

### Publish Checklist

```bash
npm run typecheck
npm run test
npm run build:package
npm run pack:check
```

If all four pass, the package is ready to commit and publish.

---

## Stack

- **Next.js 16** (App Router, standalone output)
- **Vercel AI SDK 6** - unified streaming across all providers
- **@modelcontextprotocol/sdk** - MCP client
- **Tailwind CSS 4** + **Radix UI** + **shadcn/ui**
- **@lobehub/icons** - official AI provider brand icons

---

## Security

Runs locally on loopback interfaces only. Credentials are sent only to providers you configure and are not stored in any remote backend owned by this project.

- Sensitive LLM credentials and MCP auth headers/env are stored only in browser `sessionStorage`
- Existing legacy local credentials are migrated into `sessionStorage` and removed from `localStorage`
- Closing the browser tab/session clears sensitive config unless you re-enter it
- Chat history and non-sensitive UI preferences may still persist locally for DX
- MCP `stdio` servers are spawned as child processes, so only connect to servers you trust
- The public CLI intentionally refuses non-local host binding to avoid exposing local process execution primitives over the network
- See [SECURITY.md](./SECURITY.md) for the security model

## Limitations

- This package is a CLI app distributed through npm, not a library API
- First launch may be heavier because the standalone Next.js app is shipped in the tarball
- Provider credentials are session-scoped by design, so you must re-enter them in a new browser session
- Remote multi-user deployment is out of scope for the public package

---

## Links

- GitHub: https://github.com/thiagorufino1/mcp-hub-ui
- Issues: https://github.com/thiagorufino1/mcp-hub-ui/issues
- npm: https://www.npmjs.com/package/@thiagorufino/mcp-hub
