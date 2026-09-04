#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const wranglerPkg = require.resolve("wrangler/package.json");
const wranglerBin = path.join(path.dirname(wranglerPkg), "bin", "wrangler.js");

const child = spawn(
  process.execPath,
  [wranglerBin, "dev", "--ip", "127.0.0.1", "--port", "8787"],
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
