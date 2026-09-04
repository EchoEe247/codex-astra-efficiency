#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { readAccountRateLimits } from "../src/app-server.js";
import { loadConfig } from "../src/config.js";
import { runHook } from "../src/hook.js";
import { normalizeRateLimitResponse } from "../src/rate-limits.js";

async function readStdin() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

function codexVersion() {
  const command = process.platform === "win32" ? "codex.cmd" : "codex";
  const result = spawnSync(command, ["--version"], { encoding: "utf8" });
  if (result.error || result.status !== 0) return null;
  return (result.stdout || result.stderr || "").trim() || null;
}

async function main() {
  const command = process.argv[2] ?? "help";

  if (command === "hook") {
    try {
      const raw = await readStdin();
      const response = runHook(raw);
      process.stdout.write(`${JSON.stringify(response)}\n`);
      return;
    } catch (error) {
      // A CAE observation failure must not block the user's Codex turn.
      process.stderr.write(`cae hook error: ${error.message}\n`);
      process.stdout.write(`${JSON.stringify({ continue: true, suppressOutput: true })}\n`);
      process.exitCode = 0;
      return;
    }
  }

  if (command === "doctor") {
    const config = loadConfig();
    const report = {
      node: process.version,
      codex: codexVersion(),
      stateDir: config.dir,
      configReadable: config.warning === null,
      astraTargetConfigured: config.astraModelIds.length > 0,
      astraModelIds: config.astraModelIds
    };
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  if (command === "quota") {
    try {
      const response = await readAccountRateLimits();
      const normalized = normalizeRateLimitResponse(response.result);
      process.stdout.write(
        `${JSON.stringify(
          {
            available: true,
            codex: codexVersion(),
            source: "codex_app_server",
            quota: normalized
          },
          null,
          2
        )}\n`
      );
    } catch (error) {
      process.stdout.write(
        `${JSON.stringify(
          {
            available: false,
            codex: codexVersion(),
            source: "codex_app_server",
            error: error.message,
            meaning: "quota_visibility_unavailable_not_zero"
          },
          null,
          2
        )}\n`
      );
      process.exitCode = 1;
    }
    return;
  }

  if (command === "events") {
    const config = loadConfig();
    const file = path.join(config.dir, "events.jsonl");
    if (!fs.existsSync(file)) {
      process.stdout.write("No Astra observations recorded.\n");
      return;
    }
    process.stdout.write(fs.readFileSync(file, "utf8"));
    return;
  }

  process.stdout.write(
    "Codex Astra Efficiency\n\nUsage:\n  cae doctor\n  cae quota  # read local Codex Plus rate-limit windows\n  cae hook   # internal Codex hook handler\n  cae events\n"
  );
}

await main();
