# @thiagorufino/mcp-hub-ui

`@thiagorufino/mcp-hub-ui` is a local web UI for testing LLMs and MCP servers.

## Requirements

- Node.js 20+

## Quick Start

Run directly with `npx`:

```bash
npx @thiagorufino/mcp-hub-ui
```

The app starts locally and tries to open your browser automatically.

Default URL:

- `http://localhost:3000`

Use a different port:

```bash
npx @thiagorufino/mcp-hub-ui --port 4010
```

## What It Does

- connects to LLM providers through the UI
- connects to MCP servers over `stdio`, `sse`, and `streamable-http`
- streams chat responses
- inspects and executes MCP tools

## Local Development

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run build:package
```

## Security Considerations

This app runs locally and can connect to local processes and remote MCP endpoints. Do not expose it to untrusted networks, and do not paste real secrets into screenshots, issues, or documentation.

## Repository

- GitHub: `https://github.com/thiagorufino1/mcp-hub-ui`
- Issues: `https://github.com/thiagorufino1/mcp-hub-ui/issues`
