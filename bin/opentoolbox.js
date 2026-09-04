#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerEntry = path.join(
  root,
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);

if (!existsSync(wranglerEntry)) {
  console.error(
    "opentoolbox: wrangler is missing. From the package root run: npm install",
  );
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [wranglerEntry, "dev", ...process.argv.slice(2)],
  {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
