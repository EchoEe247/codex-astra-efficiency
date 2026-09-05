import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CAE_HOOK_COMMAND } from "./hooks-config.js";

export const HOOK_COMMAND_UNAVAILABLE = "hook_command_unavailable";

/**
 * Extract the executable token from a configured hook command string such as
 * `cae hook --cae-owned`. Returns null when no binary can be determined.
 */
export function resolveHookBinary(command) {
  if (typeof command !== "string") return null;
  const text = command.trim();
  if (!text) return null;
  const first = text[0];
  if (first === '"' || first === "'") {
    const end = text.indexOf(first, 1);
    if (end === -1) return null;
    const binary = text.slice(1, end).trim();
    return binary || null;
  }
  const token = text.split(/\s+/, 1)[0];
  return token || null;
}

function pathDelimiter(platform) {
  return platform === "win32" ? ";" : ":";
}

function winExtensionsFor(env) {
  const raw =
    (env && typeof env.PATHEXT === "string" && env.PATHEXT) ||
    ".COM;.EXE;.BAT;.CMD;.VBS;.JS;.WS;.MSC";
  return raw
    .split(";")
    .map((ext) => ext.trim().toLowerCase())
    .filter(Boolean);
}

function pathImplFor(platform) {
  return platform === "win32" ? path.win32 : path.posix;
}

function hasPathSeparator(binary, platform, pathImpl) {
  if (!binary) return false;
  if (platform === "win32") {
    return /[\\/]/.test(binary) || pathImpl.isAbsolute(binary);
  }
  return binary.includes("/");
}

function isAccessible(file, platform, fsImpl) {
  // On Windows executability is determined by extension lookup, so existence
  // is the meaningful check. On POSIX require the execute bit.
  const mode =
    platform === "win32" ? fsImpl.constants.F_OK : fsImpl.constants.X_OK;
  try {
    fsImpl.accessSync(file, mode);
    return true;
  } catch {
    return false;
  }
}

function existsAnywhere(file, fsImpl) {
  try {
    fsImpl.accessSync(file, fsImpl.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function isCmdShim(resolvedPath, platform) {
  if (platform !== "win32" || typeof resolvedPath !== "string") return false;
  const lower = resolvedPath.toLowerCase();
  return lower.endsWith(".cmd") || lower.endsWith(".bat");
}

/**
 * Locate the hook binary without executing anything. Returns one of:
 * - { outcome: "found", path }
 * - { outcome: "missing" }
 * - { outcome: "not_executable", path }
 *
 * The path implementation, environment (PATHEXT), and filesystem are all
 * injectable so callers can simulate Windows or POSIX behavior on any host
 * without leaking the host's path grammar into the result.
 */
export function findHookBinary(
  binary,
  {
    pathEnv = process.env.PATH ?? "",
    platform = process.platform,
    env = process.env,
    fsImpl = fs,
    pathImpl
  } = {}
) {
  if (!binary) return { outcome: "missing", path: null };

  const usePathImpl = pathImpl ?? pathImplFor(platform);
  const delimiter = pathDelimiter(platform);
  const hasSeparator = hasPathSeparator(binary, platform, usePathImpl);
  const candidates = [];
  if (hasSeparator) {
    candidates.push(binary);
  } else {
    const dirs = String(pathEnv).split(delimiter);
    for (const dir of dirs) {
      if (!dir) continue;
      if (platform === "win32") {
        const lower = binary.toLowerCase();
        const hasExt = winExtensionsFor(env).some((ext) =>
          lower.endsWith(ext)
        );
        if (hasExt) {
          candidates.push(usePathImpl.join(dir, binary));
        } else {
          for (const ext of winExtensionsFor(env)) {
            candidates.push(usePathImpl.join(dir, `${binary}${ext}`));
          }
        }
      } else {
        candidates.push(usePathImpl.join(dir, binary));
      }
    }
  }

  let seenExists = null;
  for (const candidate of candidates) {
    if (isAccessible(candidate, platform, fsImpl)) {
      return { outcome: "found", path: candidate };
    }
    if (seenExists === null && existsAnywhere(candidate, fsImpl)) {
      seenExists = candidate;
    }
  }

  if (seenExists !== null) {
    return { outcome: "not_executable", path: seenExists };
  }
  return { outcome: "missing", path: null };
}

function mapSpawnError(error) {
  const code = error?.code;
  if (code === "ENOENT") return "hook_command_missing";
  if (code === "EACCES" || code === "EPERM") return "hook_command_not_executable";
  if (code === "ETIMEDOUT") return "hook_command_probe_timeout";
  return "hook_command_probe_failed";
}

/**
 * Run a harmless identity probe (`--help`) against the resolved hook binary.
 * This never fires a hook event and never touches Codex state; unknown CAE
 * commands fall through to usage output with exit code 0.
 *
 * Windows `.cmd` / `.bat` shims (npm-installed CLI shims, etc.) cannot be
 * launched directly through `spawnSync` because Node does not interpret them
 * as native binaries. For those we invoke `%ComSpec% /c <shim> --help` so
 * the shell performs the actual script dispatch, with quoting robust against
 * spaces in the resolved path. Direct execution is preserved for `.exe`,
 * `.com`, native binaries, and POSIX executables.
 */
export function probeHookBinary(
  resolvedPath,
  {
    spawnSyncImpl = spawnSync,
    timeoutMs = 5000,
    platform = process.platform,
    env = process.env
  } = {}
) {
  if (!resolvedPath) {
    return {
      launched: false,
      callable: false,
      reason: "hook_command_missing"
    };
  }

  if (isCmdShim(resolvedPath, platform)) {
    const comspec = env?.ComSpec || env?.COMSPEC || "cmd.exe";
    let result;
    try {
      result = spawnSyncImpl(comspec, ["/d", "/s", "/c", resolvedPath, "--help"], {
        encoding: "utf8",
        timeout: timeoutMs,
        windowsHide: true
      });
    } catch (error) {
      return { launched: true, callable: false, reason: mapSpawnError(error) };
    }
    if (result?.error) {
      return { launched: true, callable: false, reason: mapSpawnError(result.error) };
    }
    if (typeof result?.status === "number" && result.status === 0) {
      return { launched: true, callable: true, reason: null };
    }
    if (result?.signal) {
      return {
        launched: true,
        callable: false,
        reason: "hook_command_probe_timeout",
        signal: result.signal
      };
    }
    return {
      launched: true,
      callable: false,
      reason: "hook_command_probe_failed",
      exitCode: result?.status ?? null
    };
  }

  let result;
  try {
    result = spawnSyncImpl(resolvedPath, ["--help"], {
      encoding: "utf8",
      timeout: timeoutMs,
      windowsHide: true
    });
  } catch (error) {
    return { launched: true, callable: false, reason: mapSpawnError(error) };
  }
  if (result?.error) {
    return { launched: true, callable: false, reason: mapSpawnError(result.error) };
  }
  if (typeof result?.status === "number" && result.status === 0) {
    return { launched: true, callable: true, reason: null };
  }
  if (result?.signal) {
    return {
      launched: true,
      callable: false,
      reason: "hook_command_probe_timeout",
      signal: result.signal
    };
  }
  return {
    launched: true,
    callable: false,
    reason: "hook_command_probe_failed",
    exitCode: result?.status ?? null
  };
}

/**
 * Verify the configured CAE hook command is actually launchable in the
 * current environment. Zero model inference, no hook event, no state change.
 */
export function checkHookCommand({
  command = CAE_HOOK_COMMAND,
  pathEnv = process.env.PATH ?? "",
  platform = process.platform,
  env = process.env,
  fsImpl = fs,
  spawnSyncImpl = spawnSync,
  timeoutMs = 5000
} = {}) {
  const binary = resolveHookBinary(command);
  if (!binary) {
    return {
      command,
      binary: null,
      resolved: null,
      available: false,
      reason: "hook_command_invalid"
    };
  }

  const located = findHookBinary(binary, { pathEnv, platform, env, fsImpl });
  if (located.outcome === "missing") {
    return {
      command,
      binary,
      resolved: null,
      available: false,
      reason: "hook_command_missing"
    };
  }
  if (located.outcome === "not_executable") {
    return {
      command,
      binary,
      resolved: located.path,
      available: false,
      reason: "hook_command_not_executable"
    };
  }

  const probe = probeHookBinary(located.path, {
    spawnSyncImpl,
    timeoutMs,
    platform,
    env
  });
  if (!probe.callable) {
    return {
      command,
      binary,
      resolved: located.path,
      available: false,
      reason: probe.reason
    };
  }

  return {
    command,
    binary,
    resolved: located.path,
    available: true,
    reason: null
  };
}
