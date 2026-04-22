#!/usr/bin/env node
// bin/mcp-portal.mjs
import { createServer } from "net";
import { dirname, join } from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import open from "open";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "..", ".next", "standalone", "server.js");

const args = process.argv.slice(2);
const portFlagIndex = args.indexOf("--port");
const requestedPort =
  portFlagIndex !== -1 && args[portFlagIndex + 1]
    ? parseInt(args[portFlagIndex + 1], 10)
    : 3000;

async function findFreePort(startPort) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(startPort, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on("error", () => resolve(findFreePort(startPort + 1)));
  });
}

async function waitForServer(url, maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

const port = await findFreePort(requestedPort);
const url = `http://localhost:${port}`;

console.log(`\n  mcp-hub-ui starting on ${url} ...\n`);

const child = spawn("node", [serverPath], {
  env: {
    ...process.env,
    PORT: String(port),
    HOSTNAME: "0.0.0.0",
    NODE_ENV: "production",
  },
  stdio: "inherit",
});

child.on("error", (err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

child.on("close", (code) => process.exit(code ?? 0));

const ready = await waitForServer(url);
if (ready) {
  console.log(`  Ready — opening ${url}\n`);
  await open(url);
} else {
  console.error("  Server did not respond in time. Open manually:", url);
}
