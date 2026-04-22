# mcp-hub-ui

UI local em Next.js para conectar LLMs e servidores MCP em uma unica interface, com suporte a chat, chamadas de tools MCP e empacotamento standalone para distribuicao via npm.

## Recursos

- chat com streaming
- configuracao de LLMs no navegador
- conexao com servidores MCP via `stdio`, `sse` e `streamable-http`
- inspecao e execucao de tools MCP
- build standalone para distribuicao local

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Vercel AI SDK
- Model Context Protocol SDK

## Desenvolvimento local

Requisitos:

- Node.js 20+
- npm

Instalacao:

```powershell
npm install
npm run dev
```

App local:

- `http://localhost:3000`

## Variaveis de ambiente

Este repositorio nao inclui nenhum arquivo `.env`.

Modos principais:

- `NEXT_PUBLIC_AUTH_MODE=preview` para rodar sem login Entra
- `NEXT_PUBLIC_CHAT_BACKEND_MODE=mock` e `AI_CHAT_PROVIDER=mock` para usar modo demonstracao
- `NEXT_PUBLIC_CHAT_BACKEND_MODE=azure` e `AI_CHAT_PROVIDER=azure` para usar Azure OpenAI
- `NEXT_PUBLIC_CHAT_BACKEND_MODE=proxy` e `AI_CHAT_PROVIDER=proxy` para usar backend intermediario

Observacao:

- `NEXT_PUBLIC_CHAT_BACKEND_MODE` controla expectativa da UI
- `AI_CHAT_PROVIDER` controla o provider usado pela rota `/api/chat`
- mantenha os dois alinhados

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run build:package
```

## Publicacao

O projeto esta preparado para publicacao sem arquivos locais sensiveis:

- `.env*` ficam ignorados
- artefatos locais como `.next/`, `node_modules/`, logs e traces ficam ignorados
- o script de empacotamento remove `.env` do bundle standalone

Arquivos publicados pelo pacote:

- `bin/mcp-portal.mjs`
- `.next/standalone`
- `.next/static`
- `scripts/copy-standalone.mjs`

## Seguranca antes de subir para GitHub

- nao commitar `.env`
- nao colocar chaves reais em `README`, issues ou screenshots
- se algum segredo ja foi exposto localmente, rotacionar antes do push

## Estrutura

```text
src/
  app/           rotas App Router e APIs
  components/    UI e fluxos de chat/configuracao
  lib/           integracoes, utilitarios e cliente MCP
bin/             entrypoint do pacote
scripts/         suporte ao empacotamento standalone
```
