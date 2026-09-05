import { spawn, spawnSync } from "node:child_process";
import readline from "node:readline";

export const APP_SERVER_CLIENT_NAME = "codex-astra-efficiency";
export const APP_SERVER_CLIENT_VERSION = "0.1.0";
export const CODEX_COMMAND_ENV = "CAE_CODEX_COMMAND";
export const CODEX_VERSION_TIMEOUT_MS = 4000;

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

export function isWindowsBatch(command, platform = process.platform) {
  if (platform !== "win32" || typeof command !== "string") return false;
  let text = command.trim().toLowerCase();
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1).trim();
  }
  return text.endsWith(".cmd") || text.endsWith(".bat");
}

export function prepareProcessInvocation(
  command,
  args = [],
  { env = process.env, platform = process.platform } = {}
) {
  const safeArgs = Array.isArray(args) ? [...args] : [];
  if (isWindowsBatch(command, platform)) {
    const comspec = env?.ComSpec || env?.COMSPEC || "cmd.exe";
    return {
      file: comspec,
      args: ["/d", "/c", command, ...safeArgs]
    };
  }
  return {
    file: command,
    args: safeArgs
  };
}

export function probeCodexVersion(
  command = resolveCodexCommand(),
  {
    timeoutMs = CODEX_VERSION_TIMEOUT_MS,
    spawnSyncImpl = spawnSync,
    env = process.env,
    platform = process.platform
  } = {}
) {
  const invocation = prepareProcessInvocation(command, ["--version"], {
    env,
    platform
  });

  let result;
  try {
    result = spawnSyncImpl(invocation.file, invocation.args, {
      encoding: "utf8",
      timeout: timeoutMs,
      windowsHide: true
    });
  } catch (err) {
    return {
      version: null,
      status: "spawn_error",
      error: err.message
    };
  }

  if (result?.error) {
    const isTimeout =
      result.error.code === "ETIMEDOUT" ||
      result.error.message?.includes("timed out");
    return {
      version: null,
      status: isTimeout ? "timeout" : "spawn_error",
      error: result.error.message
    };
  }

  if (result?.signal) {
    return {
      version: null,
      status: "signal",
      signal: result.signal
    };
  }

  if (typeof result?.status === "number" && result.status !== 0) {
    return {
      version: null,
      status: "nonzero_exit",
      exitCode: result.status
    };
  }

  const output = (result?.stdout || result?.stderr || "").trim();
  return {
    version: output || null,
    status: output ? "ok" : "empty_output"
  };
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

function streamErrorCode(err) {
  if (err?.code && typeof err.code === "string") return err.code;
  if (err?.message && typeof err.message === "string") {
    return err.message.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || "error";
  }
  return "unknown";
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
  const invocation = prepareProcessInvocation(
    command,
    ["app-server", "--listen", "stdio://"],
    { env, platform }
  );

  let child;
  try {
    child = spawnImpl(invocation.file, invocation.args, {
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
        if (!child.stdin.destroyed) {
          child.stdin.end();
        }
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

    child.stdin.on?.("error", (err) => {
      settle(new Error(`codex_app_server_stream_failed:stdin:${streamErrorCode(err)}`));
    });

    child.stdout.on?.("error", (err) => {
      settle(new Error(`codex_app_server_stream_failed:stdout:${streamErrorCode(err)}`));
    });

    child.stderr.on?.("error", (err) => {
      settle(new Error(`codex_app_server_stream_failed:stderr:${streamErrorCode(err)}`));
    });

    let stderrBuffer = "";
    child.stderr.setEncoding?.("utf8");
    child.stderr.on?.("data", (chunk) => {
      stderrBuffer += String(chunk);
      if (stderrBuffer.length > 8192) stderrBuffer = stderrBuffer.slice(-8192);
      stderr = stderrBuffer;
    });

    lines = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
    lines.on("error", (err) => {
      settle(new Error(`codex_app_server_stream_failed:stdout:${streamErrorCode(err)}`));
    });
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
