import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function stateDir(env = process.env) {
  if (env.CAE_STATE_DIR) return path.resolve(env.CAE_STATE_DIR);
  if (process.platform === "win32" && env.LOCALAPPDATA) {
    return path.join(env.LOCALAPPDATA, "codex-astra-efficiency");
  }
  if (env.XDG_STATE_HOME) {
    return path.join(env.XDG_STATE_HOME, "codex-astra-efficiency");
  }
  return path.join(os.homedir(), ".local", "state", "codex-astra-efficiency");
}

export function parseModelIds(value) {
  if (!value) return [];
  const source = Array.isArray(value) ? value : String(value).split(",");
  return [...new Set(source.map((item) => String(item).trim()).filter(Boolean))];
}

export function loadConfig(env = process.env) {
  const dir = stateDir(env);
  const configPath = path.join(dir, "config.json");
  let fileConfig = {};

  try {
    fileConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") {
      return {
        dir,
        configPath,
        astraModelIds: parseModelIds(env.CAE_ASTRA_MODEL_IDS),
        warning: `config_unreadable:${error.message}`
      };
    }
  }

  const envIds = parseModelIds(env.CAE_ASTRA_MODEL_IDS);
  const fileIds = parseModelIds(fileConfig.astraModelIds);

  return {
    dir,
    configPath,
    astraModelIds: envIds.length > 0 ? envIds : fileIds,
    warning: null
  };
}

function atomicWrite(file, content) {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const temp = path.join(dir, `.config.json.cae-${process.pid}-${crypto.randomUUID()}.tmp`);
  try {
    fs.writeFileSync(temp, content, { encoding: "utf8", flag: "wx", mode: 0o600 });
    fs.renameSync(temp, file);
  } finally {
    try {
      fs.unlinkSync(temp);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
}

export function writeConfig({ astraModelIds }, env = process.env) {
  const ids = parseModelIds(astraModelIds);
  const dir = stateDir(env);
  const configPath = path.join(dir, "config.json");
  atomicWrite(
    configPath,
    `${JSON.stringify({ schemaVersion: 1, astraModelIds: ids }, null, 2)}\n`
  );
  return {
    dir,
    configPath,
    astraModelIds: ids,
    warning: null
  };
}

export function isAstraModel(model, astraModelIds) {
  if (typeof model !== "string" || !model.trim()) return false;
  const target = model.trim().toLowerCase();
  return parseModelIds(astraModelIds).some((id) => id.toLowerCase() === target);
}
