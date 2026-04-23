# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2026-04-23

### Changed
- Default theme changed to light
- System Prompt terminology (previously "Instructions") in PT-BR and EN
- GitHub links corrected across all files
- App version in frontend now reflects npm package version automatically

### Fixed
- npm publish pipeline: OTP error resolved with Automation token
- npm publish: provenance requires public repository (repo made public)

---

## [1.0.0] - 2026-04-22

### Added
- Local web UI for testing LLMs, MCP servers, tools, and chat workflows
- Support for 10 LLM providers: Anthropic, AWS Bedrock, Microsoft Foundry, DeepSeek, Google Gemini, Groq, Mistral, Ollama, OpenAI, xAI
- MCP server connections over stdio, SSE, and Streamable HTTP transports
- Streaming chat with multi-turn history, System Prompt support, and tool activity trace
- Chart rendering via fenced `chart` code blocks
- Audio input support
- i18n support for English and Portuguese (pt-BR)
- `--port` and `--host` CLI flags
- `--help` / `-h` CLI flag
- Automatic browser launch on startup
- Public npm packaging for `@thiagorufino/mcp-hub`
- Package validation scripts for manifest checks, smoke tests, and tarball verification
- Loopback-only host enforcement for the public CLI
- Session-scoped storage for LLM credentials and MCP auth-sensitive configuration
