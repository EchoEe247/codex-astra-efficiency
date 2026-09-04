import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  CAE_HOOK_COMMAND,
  installCaeHooks,
  parseHooksConfig,
  uninstallCaeHooks
} from "./hooks-config.js";

export function resolveCodexHome(env = process.env, homeDir = os.homedir()) {
  const configured = typeof env.CODEX_HOME === "string" ? env.CODEX_HOME.trim() : "";
  if (configured) return path.resolve(configured);
  return path.join(homeDir, ".codex");
}

export function hooksFilePath(env = process.env, homeDir = os.homedir()) {
  return path.join(resolveCodexHome(env, homeDir), "hooks.json");
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function readExistingHooks(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    return { exists: true, raw, parsed: parseHooksConfig(raw) };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { exists: false, raw: "", parsed: {} };
    }
    throw error;
  }
}

function deepEqualJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function atomicWriteJson(file, value, existingMode = null) {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const temp = path.join(dir, `.hooks.json.cae-${process.pid}-${crypto.randomUUID()}.tmp`);
  const mode = existingMode ?? 0o600;

  try {
    fs.writeFileSync(temp, stableJson(value), { encoding: "utf8", flag: "wx", mode });
    fs.renameSync(temp, file);
    if (existingMode !== null && process.platform !== "win32") {
      fs.chmodSync(file, existingMode);
    }
  } finally {
    try {
      fs.unlinkSync(temp);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
}

function existingMode(file, exists) {
  if (!exists || process.platform === "win32") return null;
  return fs.statSync(file).mode & 0o777;
}

function meaningfulConfigKeys(config) {
  return Object.keys(config).filter((key) => {
    if (key !== "hooks") return true;
    return config.hooks && Object.keys(config.hooks).length > 0;
  });
}

export function planHookSetup({
  action = "install",
  env = process.env,
  homeDir = os.homedir(),
  command = CAE_HOOK_COMMAND
} = {}) {
  if (action !== "install" && action !== "uninstall") {
    throw new TypeError(`unsupported setup action: ${action}`);
  }

  const file = hooksFilePath(env, homeDir);
  const current = readExistingHooks(file);
  const next =
    action === "install"
      ? installCaeHooks(current.parsed, command)
      : uninstallCaeHooks(current.parsed, command);

  return {
    action,
    codexHome: path.dirname(file),
    hooksFile: file,
    fileExists: current.exists,
    changed: !deepEqualJson(current.parsed, next),
    removeEmptyCaeCreatedFile:
      action === "uninstall" &&
      current.exists &&
      meaningfulConfigKeys(next).length === 0 &&
      meaningfulConfigKeys(current.parsed).length === 1,
    current: current.parsed,
    next
  };
}

export function applyHookSetup(options = {}) {
  const plan = planHookSetup(options);
  if (!plan.changed) return { ...plan, applied: false };

  if (options.dryRun) return { ...plan, applied: false, dryRun: true };

  if (plan.action === "install") {
    const codexHome = plan.codexHome;
    if (options.env?.CODEX_HOME || process.env.CODEX_HOME) {
      if (!fs.existsSync(codexHome) || !fs.statSync(codexHome).isDirectory()) {
        throw new Error(`CODEX_HOME must already exist and be a directory: ${codexHome}`);
      }
    }
    atomicWriteJson(plan.hooksFile, plan.next, existingMode(plan.hooksFile, plan.fileExists));
    return { ...plan, applied: true };
  }

  // Uninstall only removes CAE-owned handlers. Keep the file even if that leaves
  // an empty hooks object; deleting a pre-existing user file would exceed CAE ownership.
  atomicWriteJson(plan.hooksFile, plan.next, existingMode(plan.hooksFile, plan.fileExists));
  return { ...plan, applied: true };
}
