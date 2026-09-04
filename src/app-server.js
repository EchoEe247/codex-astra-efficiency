import { spawn } from "node:child_process";
import readline from "node:readline";

export const APP_SERVER_CLIENT_NAME = "codex-astra-efficiency";
export const APP_SERVER_CLIENT_VERSION = "0.0.0-dev";

export function initializeRequest(id = 1) {
  return {
    id,
    method: "initialize",
    params: {
      clientInfo: {
        name: APP_SERVER_CLIENT_NAME,
        title: "Codex Astra Efficiency",
        version: APP_SERVER_CLIENT_VERSION
      },
      capabilities: null
    }
  };
}

export function initializedNotification() {
  return { method: "initialized" };
}

export function rateLimitsRequest(id = 2) {
  return { id, method: "account/rateLimits/read" };
}

function defaultCodexCommand() {
  return process.platform === "win32" ? "codex.cmd" : "codex";
}

function writeMessage(stream, message) {
  stream.write(`${JSON.stringify(message)}\n`);
}

function safeKill(child) {
  if (!child || child.killed) return;
  try {
    child.kill();
  } catch {
    // Best-effort cleanup only.
  }
}

/**
 * Read one authoritative account-rate-limit snapshot from a short-lived local
 * Codex app-server process. This does not read browser cookies or copy auth.
 *
 * Runtime compatibility must still be proven against installed Codex builds;
 * callers should treat failures as unavailable visibility, never as zero quota.
 */
export async function readAccountRateLimits({
  codexCommand = defaultCodexCommand(),
  timeoutMs = 8000,
  spawnImpl = spawn
} = {}) {
  const child = spawnImpl(codexCommand, ["app-server", "--listen", "stdio://"], {
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true
  });

  if (!child?.stdin || !child?.stdout || !child?.stderr) {
    safeKill(child);
    throw new Error("codex_app_server_stdio_unavailable");
  }

  let stderr = "";
  child.stderr.setEncoding?.("utf8");
  child.stderr.on?.("data", (chunk) => {
    stderr += String(chunk);
    if (stderr.length > 8192) stderr = stderr.slice(-8192);
  });

  const lines = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
  const initId = 1;
  const quotaId = 2;
  let initialized = false;

  const timer = setTimeout(() => safeKill(child), timeoutMs);

  try {
    writeMessage(child.stdin, initializeRequest(initId));

    for await (const line of lines) {
      if (!line.trim()) continue;

      let message;
      try {
        message = JSON.parse(line);
      } catch {
        continue;
      }

      if (message?.id === initId) {
        if (message.error) {
          throw new Error(`codex_app_server_initialize_failed:${message.error.message ?? "unknown"}`);
        }
        if (!Object.prototype.hasOwnProperty.call(message, "result")) continue;
        initialized = true;
        writeMessage(child.stdin, initializedNotification());
        writeMessage(child.stdin, rateLimitsRequest(quotaId));
        continue;
      }

      if (message?.id === quotaId) {
        if (message.error) {
          throw new Error(`codex_rate_limits_read_failed:${message.error.message ?? "unknown"}`);
        }
        if (!Object.prototype.hasOwnProperty.call(message, "result")) continue;
        return {
          result: message.result,
          initialized,
          stderr: stderr.trim() || null
        };
      }
    }

    const suffix = stderr.trim() ? `:${stderr.trim()}` : "";
    throw new Error(`codex_app_server_closed_before_rate_limits${suffix}`);
  } finally {
    clearTimeout(timer);
    lines.close();
    try {
      child.stdin.end();
    } catch {
      // Best-effort cleanup only.
    }
    safeKill(child);
  }
}
