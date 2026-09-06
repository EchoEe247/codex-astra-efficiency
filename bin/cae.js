#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  CODEX_VERSION_TIMEOUT_MS,
  probeCodexVersion,
  readAccountRateLimits,
  readModelList,
  resolveCodexCommand
} from "../src/app-server.js";
import { loadConfig, parseModelIds, writeConfig } from "../src/config.js";
import { runHook } from "../src/hook.js";
import { checkHookCommand } from "../src/hook-command.js";
import { CAE_HOOK_COMMAND } from "../src/hooks-config.js";
import { summarizeAstraDiscovery } from "../src/model-discovery.js";
import { normalizeRateLimitResponse } from "../src/rate-limits.js";
import { summarizeAstraReadiness } from "../src/readiness.js";
import { applyHookSetup, planHookSetup } from "../src/setup.js";
import { formatTurnMeasurement, readLastTurnMeasurement } from "../src/token-usage.js";

async function readStdin() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

function codexVersionProbe(command = resolveCodexCommand()) {
  return probeCodexVersion(command);
}

function codexVersion(command = resolveCodexCommand()) {
  return probeCodexVersion(command).version;
}

function setupSummary(result) {
  return {
    action: result.action,
    hooksFile: result.hooksFile,
    changed: result.changed,
    applied: result.applied,
    dryRun: Boolean(result.dryRun)
  };
}

function hookReadiness() {
  try {
    const plan = planHookSetup({ action: "install" });
    return {
      readable: true,
      hooksFile: plan.hooksFile,
      installed: !plan.changed,
      fileExists: plan.fileExists,
      error: null
    };
  } catch (error) {
    return {
      readable: false,
      hooksFile: null,
      installed: false,
      fileExists: null,
      error: error.message
    };
  }
}

async function integrationProbe() {
  const codexCommand = resolveCodexCommand();
  const versionProbe = codexVersionProbe(codexCommand);
  const [quotaResult, modelResult] = await Promise.allSettled([
    readAccountRateLimits({ codexCommand }),
    readModelList({ codexCommand })
  ]);

  return {
    codexCommand,
    codex: versionProbe.version,
    codexVersionStatus: versionProbe.status,
    nativeHooks: hookReadiness(),
    quota:
      quotaResult.status === "fulfilled"
        ? {
            available: true,
            source: "codex_app_server",
            value: normalizeRateLimitResponse(quotaResult.value.result)
          }
        : {
            available: false,
            source: "codex_app_server",
            error: quotaResult.reason?.message ?? String(quotaResult.reason),
            meaning: "quota_visibility_unavailable_not_zero"
          },
    modelCatalog:
      modelResult.status === "fulfilled"
        ? {
            available: true,
            source: "codex_app_server",
            astraDiscovery: summarizeAstraDiscovery(modelResult.value.result)
          }
        : {
            available: false,
            source: "codex_app_server",
            error: modelResult.reason?.message ?? String(modelResult.reason)
          }
  };
}

async function readinessProbe() {
  const codexCommand = resolveCodexCommand();
  const versionProbe = codexVersionProbe(codexCommand);
  const config = loadConfig();
  const hookCommand = checkHookCommand({ command: CAE_HOOK_COMMAND });
  const nativeHooks = hookReadiness();
  const [quotaResult, modelResult] = await Promise.allSettled([
    readAccountRateLimits({ codexCommand }),
    readModelList({ codexCommand })
  ]);

  const failures = {};
  if (quotaResult.status !== "fulfilled") {
    failures.quota = quotaResult.reason?.message ?? String(quotaResult.reason);
  }
  if (modelResult.status !== "fulfilled") {
    failures.modelCatalog = modelResult.reason?.message ?? String(modelResult.reason);
  }

  if (Object.keys(failures).length > 0) {
    return {
      status: "native_read_unavailable",
      codexCommand,
      codex: versionProbe.version,
      codexVersionStatus: versionProbe.status,
      nativeHooks,
      hookCommand,
      configReadable: config.warning === null,
      failures,
      meaning: "do_not_spend_astra_until_zero_inference_reads_are_understood"
    };
  }

  return {
    codexCommand,
    codex: versionProbe.version,
    codexVersionStatus: versionProbe.status,
    nativeHooks,
    configReadable: config.warning === null,
    ...summarizeAstraReadiness({
      modelPayload: modelResult.value.result,
      rateLimitPayload: quotaResult.value.result,
      configuredModelIds: config.astraModelIds,
      hookCommand,
      nativeHooks
    })
  };
}

function targetCommand(args) {
  const action = args[0] ?? "show";
  if (action === "show") {
    const config = loadConfig();
    return {
      action: "show",
      astraModelIds: config.astraModelIds,
      configured: config.astraModelIds.length > 0,
      configPath: config.configPath
    };
  }

  if (action === "clear") {
    const config = writeConfig({ astraModelIds: [] });
    return {
      action: "clear",
      astraModelIds: config.astraModelIds,
      configPath: config.configPath
    };
  }

  if (action === "set") {
    const ids = parseModelIds(args.slice(1));
    if (ids.length === 0) throw new Error("target set requires at least one exact model id");
    const config = writeConfig({ astraModelIds: ids });
    return {
      action: "set",
      astraModelIds: config.astraModelIds,
      configPath: config.configPath
    };
  }

  throw new Error(`unsupported target action: ${action}`);
}

async function main() {
  const command = process.argv[2] ?? "help";
  const flags = new Set(process.argv.slice(3));

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
    const codexCommand = resolveCodexCommand();
    const versionProbe = codexVersionProbe(codexCommand);
    const hookCommand = checkHookCommand({ command: CAE_HOOK_COMMAND });
    const report = {
      node: process.version,
      codexCommand,
      codex: versionProbe.version,
      codexVersionStatus: versionProbe.status,
      stateDir: config.dir,
      configReadable: config.warning === null,
      astraTargetConfigured: config.astraModelIds.length > 0,
      astraModelIds: config.astraModelIds,
      nativeHooks: hookReadiness(),
      hookCommand
    };
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  if (command === "probe") {
    process.stdout.write(`${JSON.stringify(await integrationProbe(), null, 2)}\n`);
    return;
  }

  if (command === "readiness") {
    const result = await readinessProbe();
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.status === "native_read_unavailable") process.exitCode = 1;
    return;
  }

  if (command === "target") {
    try {
      process.stdout.write(`${JSON.stringify(targetCommand(process.argv.slice(3)), null, 2)}\n`);
    } catch (error) {
      process.stderr.write(`cae target error: ${error.message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "setup" || command === "uninstall") {
    try {
      const result = applyHookSetup({
        action: command === "setup" ? "install" : "uninstall",
        dryRun: flags.has("--dry-run")
      });
      process.stdout.write(`${JSON.stringify(setupSummary(result), null, 2)}\n`);
    } catch (error) {
      process.stderr.write(`cae ${command} error: ${error.message}\n`);
      process.exitCode = 1;
    }
    return;
  }

  if (command === "quota") {
    const codexCommand = resolveCodexCommand();
    const versionProbe = codexVersionProbe(codexCommand);
    try {
      const response = await readAccountRateLimits({ codexCommand });
      const normalized = normalizeRateLimitResponse(response.result);
      process.stdout.write(
        `${JSON.stringify(
          {
            available: true,
            codexCommand,
            codex: versionProbe.version,
            codexVersionStatus: versionProbe.status,
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
            codexCommand,
            codex: versionProbe.version,
            codexVersionStatus: versionProbe.status,
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

  if (command === "tokens") {
    const config = loadConfig();
    const record = readLastTurnMeasurement(config.dir);
    if (!record) {
      process.stdout.write("No turn measurement recorded.\n");
      return;
    }
    if (flags.has("--json")) {
      process.stdout.write(`${JSON.stringify(record, null, 2)}\n`);
      return;
    }
    process.stdout.write(formatTurnMeasurement(record));
    return;
  }

  if (command === "receipt") {
    const config = loadConfig();
    if (flags.has("--last-turn")) {
      const record = readLastTurnMeasurement(config.dir);
      if (!record) {
        process.stdout.write("No turn measurement recorded.\n");
        return;
      }
      if (flags.has("--json")) {
        process.stdout.write(`${JSON.stringify(record, null, 2)}\n`);
        return;
      }
      process.stdout.write(formatTurnMeasurement(record));
      return;
    }

    const file = path.join(config.dir, "receipts.jsonl");
    if (!fs.existsSync(file)) {
      process.stdout.write("No receipts recorded.\n");
      return;
    }
    const lines = fs.readFileSync(file, "utf8").trim().split("\n");
    if (lines.length === 0 || !lines[0].trim()) {
      process.stdout.write("No receipts recorded.\n");
      return;
    }
    const lastLine = lines[lines.length - 1];
    try {
      const parsed = JSON.parse(lastLine);
      process.stdout.write(`${JSON.stringify(parsed, null, 2)}\n`);
    } catch {
      process.stdout.write(`${lastLine}\n`);
    }
    return;
  }

  process.stdout.write(
    "Codex Astra Efficiency\n\nUsage:\n  cae doctor\n  cae probe  # read-only native Codex quota/model integration probe\n  cae readiness  # zero-inference Astra candidate/target/quota readiness summary\n  cae setup [--dry-run]\n  cae uninstall [--dry-run]\n  cae target show|set <exact-model-id>|clear  # validation/compatibility control\n  cae quota  # read local Codex Plus rate-limit windows\n  cae tokens [--last-turn] [--json]  # native per-turn token processing summary\n  cae receipt [--last-turn]  # run receipt or last-turn token measurement\n  cae hook   # internal Codex hook handler\n  cae events\n\nLauncher override:\n  CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae readiness\n"
  );
}

await main();
