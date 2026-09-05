import { spawn } from "node:child_process";
import readline from "node:readline";

export const APP_SERVER_CLIENT_NAME = "codex-astra-efficiency";
export const APP_SERVER_CLIENT_VERSION = "0.0.0-dev";
export const CODEX_COMMAND_ENV = "CAE_CODEX_COMMAND";

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

export function appServerRequest(id, method, params) {
  const request = { id, method };
  if (params !== undefined) request.params = params;
  return request;
}

export function rateLimitsRequest(id = 2) {
  return appServerRequest(id, "account/rateLimits/read");
}

export function modelListRequest(id = 2, params = {}) {
  return appServerRequest(id, "model/list", {
    cursor: params.cursor ?? null,
    limit: params.limit ?? 100,
    includeHidden: params.includeHidden ?? false
  });
}

export function resolveCodexCommand({
  codexCommand = null,
  env = process.env,
  platform = process.platform
} = {}) {
  if (typeof codexCommand === "string" && codexCommand.trim()) return codexCommand.trim();

  const configured = env?.[CODEX_COMMAND_ENV];
  if (typeof configured === "string" && configured.trim()) return configured.trim();

  return platform === "win32" ? "codex.cmd" : "codex";
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

async function requestLocalCodex({
  method,
  params,
  codexCommand = null,
  env = process.env,
  platform = process.platform,
  timeoutMs = 8000,
  spawnImpl = spawn
}) {
  const command = resolveCodexCommand({ codexCommand, env, platform });

  let child;
  try {
    child = spawnImpl(command, ["app-server", "--listen", "stdio://"], {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });
  } catch (err) {
    throw new Error(`codex_app_server_spawn_failed:${err.message}`);
  }

  if (!child?.stdin || !child?.stdout || !child?.stderr) {
    safeKill(child);
    throw new Error("codex_app_server_stdio_unavailable");
  }

  return new Promise((resolve, reject) => {
    let stderr = "";
    let initialized = false;
    let settled = false;
    let lines;

    const timer = setTimeout(() => {
      settle(new Error(`codex_app_server_timeout:${method}`));
    }, timeoutMs);

    function settle(err, result) {
      if (settled) return;
      settled = true;

      clearTimeout(timer);
      if (lines) {
        try {
          lines.close();
        } catch {
          // Best-effort cleanup only.
        }
      }
      try {
        child.stdin.end();
      } catch {
        // Best-effort cleanup only.
      }
      safeKill(child);

      if (err) reject(err);
      else resolve(result);
    }

    child.on?.("error", (err) => {
      settle(new Error(`codex_app_server_spawn_failed:${err.message}`));
    });

    let stderrBuffer = "";
    child.stderr.setEncoding?.("utf8");
    child.stderr.on?.("data", (chunk) => {
      stderrBuffer += String(chunk);
      if (stderrBuffer.length > 8192) stderrBuffer = stderrBuffer.slice(-8192);
      stderr = stderrBuffer;
    });

    lines = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
    const initId = 1;
    const requestId = 2;

    lines.on("line", (line) => {
      if (settled || !line.trim()) return;

      let message;
      try {
        message = JSON.parse(line);
      } catch {
        return;
      }

      try {
        if (message?.id === initId) {
          if (message.error) {
            throw new Error(`codex_app_server_initialize_failed:${message.error.message ?? "unknown"}`);
          }
          if (!Object.prototype.hasOwnProperty.call(message, "result")) return;
          initialized = true;
          writeMessage(child.stdin, initializedNotification());
          writeMessage(child.stdin, appServerRequest(requestId, method, params));
          return;
        }

        if (message?.id === requestId) {
          if (message.error) {
            throw new Error(
              `codex_app_server_request_failed:${method}:${message.error.message ?? "unknown"}`
            );
          }
          if (!Object.prototype.hasOwnProperty.call(message, "result")) return;
          settle(null, {
            result: message.result,
            initialized,
            command,
            stderr: stderr.trim() || null
          });
        }
      } catch (err) {
        settle(err);
      }
    });

    lines.on("close", () => {
      if (settled) return;
      const suffix = stderr.trim() ? `:${stderr.trim()}` : "";
      settle(new Error(`codex_app_server_closed_before_response:${method}${suffix}`));
    });

    try {
      writeMessage(child.stdin, initializeRequest(initId));
    } catch (err) {
      settle(err);
    }
  });
}

/**
 * Read one authoritative account-rate-limit snapshot from a short-lived local
 * Codex app-server process. This does not read browser cookies or copy auth.
 *
 * `CAE_CODEX_COMMAND` can point CAE at the same executable/wrapper the user
 * normally launches. This is useful on platforms where the wrapper provides
 * required environment setup that a direct underlying binary invocation lacks.
 * The value is treated as one executable path/name, not as a shell command.
 *
 * Runtime compatibility must still be proven against installed Codex builds;
 * callers should treat failures as unavailable visibility, never as zero quota.
 */
export function readAccountRateLimits(options = {}) {
  return requestLocalCodex({ ...options, method: "account/rateLimits/read" });
}

/**
 * Read the native Codex picker catalog. CAE uses this for exact model discovery;
 * it never guesses an Astra production slug from a display name alone.
 */
export function readModelList({ cursor = null, limit = 100, includeHidden = false, ...options } = {}) {
  return requestLocalCodex({
    ...options,
    method: "model/list",
    params: { cursor, limit, includeHidden }
  });
}
