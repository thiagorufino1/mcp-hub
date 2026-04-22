// scripts/copy-standalone.mjs
import { cpSync, existsSync, readdirSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.error("Error: .next/standalone not found. Run `next build` first.");
  process.exit(1);
}

const publicDir = join(root, "public");
if (existsSync(publicDir)) {
  cpSync(publicDir, join(standalone, "public"), { recursive: true });
}
cpSync(
  join(root, ".next", "static"),
  join(standalone, ".next", "static"),
  { recursive: true },
);

for (const entry of readdirSync(standalone)) {
  if (entry === ".env" || entry.startsWith(".env.")) {
    rmSync(join(standalone, entry), { force: true });
  }
}

console.log("Standalone assets copied successfully.");
