import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  HOOK_COMMAND_UNAVAILABLE,
  checkHookCommand,
  findHookBinary,
  probeHookBinary,
  resolveHookBinary
} from "../src/hook-command.js";
import { summarizeAstraReadiness } from "../src/readiness.js";

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cae-hookcmd-test-"));
}

function okSpawn(expectedPath) {
  return (resolved, args) => {
    assert.equal(resolved, expectedPath);
    assert.deepEqual(args, ["--help"]);
    return { status: 0, stdout: "usage", stderr: "" };
  };
}

function okCmdSpawn(expectedComspec, expectedShimPath) {
  return (resolved, args) => {
    assert.equal(resolved, expectedComspec);
    assert.deepEqual(args, ["/d", "/c", expectedShimPath, "--help"]);
    return { status: 0, stdout: "usage", stderr: "" };
  };
}

function neverSpawn() {
  return () => {
    throw new Error("probe must not run when the binary is not launchable");
  };
}

function catalog(...models) {
  return { data: models };
}

function astra(model = "gpt-6-astra") {
  return {
    id: model,
    model,
    displayName: "Astra",
    hidden: false,
    defaultReasoningEffort: "low",
    supportedReasoningEfforts: [{ reasoningEffort: "low" }]
  };
}

function sharedQuota() {
  return {
    rateLimits: {
      limitId: "codex",
      normalModelSlug: null,
      planType: "plus",
      primary: { usedPercent: 1, windowDurationMins: 300, resetsAt: 1000 },
      secondary: { usedPercent: 82, windowDurationMins: 10080, resetsAt: 2000 }
    },
    rateLimitResetCredits: { availableCount: 2 }
  };
}

/**
 * Build a fake filesystem that recognizes a list of pre-registered files.
 * Files whose normalized form ends with `:noexec` are reported as existing
 * but not executable. This lets us exercise simulated-platform behavior on
 * any host without letting the host's native path grammar leak into the
 * resolver.
 */
function virtualFs(files = []) {
  const noexec = new Set();
  const registered = new Set();
  for (const f of files) {
    if (f.endsWith(":noexec")) {
      const stripped = f.slice(0, -":noexec".length);
      registered.add(stripped.replace(/\\/g, "/").toLowerCase());
      noexec.add(stripped.replace(/\\/g, "/").toLowerCase());
    } else {
      registered.add(f.replace(/\\/g, "/").toLowerCase());
    }
  }
  return {
    constants: { F_OK: 0, X_OK: 1 },
    accessSync(target, mode) {
      const key = String(target).replace(/\\/g, "/").toLowerCase();
      if (!registered.has(key)) {
        const err = new Error(`ENOENT: ${target}`);
        err.code = "ENOENT";
        throw err;
      }
      if (mode === 1 && noexec.has(key)) {
        const err = new Error(`EACCES: ${target}`);
        err.code = "EACCES";
        throw err;
      }
    }
  };
}

test("resolveHookBinary extracts the binary token", () => {
  assert.equal(resolveHookBinary("cae hook --cae-owned"), "cae");
  assert.equal(resolveHookBinary("  /usr/local/bin/cae  hook "), "/usr/local/bin/cae");
  assert.equal(resolveHookBinary('"C:\\tools\\cae.exe" hook'), "C:\\tools\\cae.exe");
  assert.equal(resolveHookBinary(""), null);
  assert.equal(resolveHookBinary(null), null);
});

test("callable stub CAE command reports available without a real global cae", () => {
  // Simulated POSIX: virtual filesystem and virtual PATH so the host's native
  // path grammar never enters path parsing.
  const virtualBin = "/virtual/bin/cae-stub-ok";
  const fakeFs = virtualFs([virtualBin]);
  const result = checkHookCommand({
    command: "cae-stub-ok hook --cae-owned",
    pathEnv: "/virtual/bin",
    platform: "linux",
    fsImpl: fakeFs,
    spawnSyncImpl: okSpawn(virtualBin)
  });
  assert.equal(result.available, true);
  assert.equal(result.reason, null);
  assert.equal(result.binary, "cae-stub-ok");
  assert.equal(result.resolved, virtualBin);
});

test("missing executable reports hook_command_missing without probing", () => {
  const fakeFs = virtualFs([]);
  const result = checkHookCommand({
    command: "cae-definitely-absent-xyz hook --cae-owned",
    pathEnv: "/virtual/bin",
    platform: "linux",
    fsImpl: fakeFs,
    spawnSyncImpl: neverSpawn()
  });
  assert.equal(result.available, false);
  assert.equal(result.reason, "hook_command_missing");
  assert.equal(result.resolved, null);
});

test("non-executable file reports not_executable via injected POSIX semantics", () => {
  const calls = [];
  const fakeFs = {
    constants: { F_OK: 0, X_OK: 1 },
    accessSync(target, mode) {
      calls.push(mode);
      if (mode === 1) {
        const error = new Error("permission denied");
        error.code = "EACCES";
        throw error;
      }
      // F_OK passes: the file exists but cannot be executed.
    }
  };
  const result = checkHookCommand({
    command: "cae hook --cae-owned",
    pathEnv: "/fake/bin",
    platform: "linux",
    fsImpl: fakeFs,
    spawnSyncImpl: neverSpawn()
  });
  assert.equal(result.available, false);
  assert.equal(result.reason, "hook_command_not_executable");
  assert.equal(result.resolved, path.posix.join("/fake/bin", "cae"));
});

test("non-executable real file reports unavailable on POSIX", { skip: process.platform === "win32" }, () => {
  const dir = tempDir();
  try {
    const stub = path.join(dir, "cae-stub-noexec");
    fs.writeFileSync(stub, "#!/bin/sh\nexit 0\n");
    fs.chmodSync(stub, 0o644);
    const result = checkHookCommand({
      command: "cae-stub-noexec hook --cae-owned",
      pathEnv: dir,
      platform: process.platform,
      fsImpl: fs,
      spawnSyncImpl: neverSpawn()
    });
    assert.equal(result.available, false);
    assert.equal(result.reason, "hook_command_not_executable");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("real-host POSIX executable is callable end-to-end", { skip: process.platform === "win32" }, () => {
  const dir = tempDir();
  try {
    const stub = path.join(dir, "cae-stub-ok");
    fs.writeFileSync(stub, "#!/bin/sh\nexit 0\n");
    fs.chmodSync(stub, 0o755);
    const result = checkHookCommand({
      command: "cae-stub-ok hook --cae-owned",
      pathEnv: dir,
      platform: process.platform,
      fsImpl: fs,
      spawnSyncImpl: okSpawn(stub)
    });
    assert.equal(result.available, true);
    assert.equal(result.resolved, stub);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("spawn ENOENT maps to missing and EACCES maps to not_executable", () => {
  const enoent = probeHookBinary("/fake/cae", {
    platform: "linux",
    spawnSyncImpl: () => ({ error: Object.assign(new Error("missing"), { code: "ENOENT" }) })
  });
  assert.equal(enoent.callable, false);
  assert.equal(enoent.reason, "hook_command_missing");

  const eacces = probeHookBinary("/fake/cae", {
    platform: "linux",
    spawnSyncImpl: () => ({ error: Object.assign(new Error("denied"), { code: "EACCES" }) })
  });
  assert.equal(eacces.callable, false);
  assert.equal(eacces.reason, "hook_command_not_executable");
});

test("probe uses ComSpec dispatch for Windows .cmd shims", () => {
  const comspec = "C:\\Windows\\System32\\cmd.exe";
  const shim = "C:\\Users\\Angel\\AppData\\Roaming\\npm\\cae.cmd";
  const probe = probeHookBinary(shim, {
    platform: "win32",
    env: { ComSpec: comspec, PATHEXT: ".COM;.EXE;.BAT;.CMD" },
    spawnSyncImpl: okCmdSpawn(comspec, shim)
  });
  assert.equal(probe.callable, true);
});

test("probe treats cmd shim dispatch failure as not_executable", () => {
  const comspec = "C:\\Windows\\System32\\cmd.exe";
  const shim = "C:\\Users\\Angel\\AppData\\Roaming\\npm\\cae-broken.cmd";
  const probe = probeHookBinary(shim, {
    platform: "win32",
    env: { ComSpec: comspec },
    spawnSyncImpl: () => ({ error: Object.assign(new Error("denied"), { code: "EACCES" }) })
  });
  assert.equal(probe.callable, false);
  assert.equal(probe.reason, "hook_command_not_executable");
});

test("probe maps cmd shim non-zero exit to probe_failed", () => {
  const comspec = "C:\\Windows\\System32\\cmd.exe";
  const shim = "C:\\Users\\Angel\\AppData\\Roaming\\npm\\cae.cmd";
  const probe = probeHookBinary(shim, {
    platform: "win32",
    env: { ComSpec: comspec },
    spawnSyncImpl: () => ({ status: 2, stdout: "", stderr: "boom" })
  });
  assert.equal(probe.callable, false);
  assert.equal(probe.reason, "hook_command_probe_failed");
  assert.equal(probe.exitCode, 2);
});

test("probe with empty path returns missing without spawn", () => {
  const probe = probeHookBinary("", {
    platform: "linux",
    spawnSyncImpl: neverSpawn()
  });
  assert.equal(probe.launched, false);
  assert.equal(probe.callable, false);
  assert.equal(probe.reason, "hook_command_missing");
});

test("findHookBinary distinguishes missing from not_executable", () => {
  const missing = findHookBinary("cae-absent", {
    pathEnv: "/nonexistent-dir-xyz",
    platform: "linux",
    fsImpl: fs
  });
  assert.equal(missing.outcome, "missing");
});

test("findHookBinary resolves simulated Windows .cmd shims with injected PATHEXT", () => {
  const binDir = "C:\\Users\\Angel\\AppData\\Roaming\\npm";
  const shim = `${binDir}\\cae.cmd`;
  const fakeFs = virtualFs([shim]);
  const found = findHookBinary("cae", {
    pathEnv: binDir,
    platform: "win32",
    env: { PATHEXT: ".COM;.EXE;.BAT;.CMD" },
    fsImpl: fakeFs
  });
  assert.equal(found.outcome, "found");
  assert.equal(found.path, shim);
});

test("findHookBinary resolves simulated Windows .bat shims with injected PATHEXT", () => {
  const binDir = "C:\\Program Files\\Tools";
  const shim = `${binDir}\\cae.bat`;
  const fakeFs = virtualFs([shim]);
  const found = findHookBinary("cae", {
    pathEnv: binDir,
    platform: "win32",
    env: { PATHEXT: ".COM;.EXE;.BAT;.CMD" },
    fsImpl: fakeFs
  });
  assert.equal(found.outcome, "found");
  assert.equal(found.path, shim);
});

test("findHookBinary resolves simulated Windows .exe shims", () => {
  const binDir = "C:\\Tools";
  const exe = `${binDir}\\cae.exe`;
  const fakeFs = virtualFs([exe]);
  const found = findHookBinary("cae", {
    pathEnv: binDir,
    platform: "win32",
    env: { PATHEXT: ".COM;.EXE;.BAT;.CMD" },
    fsImpl: fakeFs
  });
  assert.equal(found.outcome, "found");
  assert.equal(found.path, exe);
});

test("findHookBinary preserves an extension already supplied in the binary token", () => {
  const binDir = "C:\\Tools";
  const shim = `${binDir}\\cae.CMD`;
  const fakeFs = virtualFs([shim]);
  const found = findHookBinary("cae.CMD", {
    pathEnv: binDir,
    platform: "win32",
    env: { PATHEXT: ".COM;.EXE;.BAT;.CMD" },
    fsImpl: fakeFs
  });
  assert.equal(found.outcome, "found");
  assert.equal(found.path, shim);
});

test("findHookBinary splits Windows PATH on ; not :", () => {
  const aDir = "C:\\ToolsA";
  const bDir = "C:\\ToolsB";
  const bExe = `${bDir}\\cae.exe`;
  const fakeFs = virtualFs([bExe]);
  const found = findHookBinary("cae", {
    pathEnv: `${aDir};${bDir}`,
    platform: "win32",
    env: { PATHEXT: ".COM;.EXE;.BAT;.CMD" },
    fsImpl: fakeFs
  });
  assert.equal(found.outcome, "found");
  assert.equal(found.path, bExe);
});

test("findHookBinary handles simulated Windows paths containing spaces", () => {
  const binDir = "C:\\Program Files\\My Tools";
  const shim = `${binDir}\\cae.cmd`;
  const fakeFs = virtualFs([shim]);
  const found = findHookBinary("cae", {
    pathEnv: binDir,
    platform: "win32",
    env: { PATHEXT: ".COM;.EXE;.BAT;.CMD" },
    fsImpl: fakeFs
  });
  assert.equal(found.outcome, "found");
  assert.equal(found.path, shim);
});

test("findHookBinary reports not_executable when a simulated POSIX file lacks X_OK", () => {
  const stub = "/virtual/bin/cae-stub-noexec";
  const fakeFs = virtualFs([stub + ":noexec"]);
  const result = findHookBinary("cae-stub-noexec", {
    pathEnv: "/virtual/bin",
    platform: "linux",
    fsImpl: fakeFs
  });
  assert.equal(result.outcome, "not_executable");
  assert.equal(result.path, stub);
});

test("findHookBinary returns missing when the simulated Windows binary does not exist", () => {
  const fakeFs = virtualFs([]);
  const result = findHookBinary("cae", {
    pathEnv: "C:\\Empty",
    platform: "win32",
    env: { PATHEXT: ".COM;.EXE;.BAT;.CMD" },
    fsImpl: fakeFs
  });
  assert.equal(result.outcome, "missing");
});

test("checkHookCommand routes a Windows .cmd shim through the ComSpec probe", () => {
  const binDir = "C:\\Users\\Angel\\AppData\\Roaming\\npm";
  const shim = `${binDir}\\cae.cmd`;
  const comspec = "C:\\Windows\\System32\\cmd.exe";
  const fakeFs = virtualFs([shim]);
  const result = checkHookCommand({
    command: "cae hook --cae-owned",
    pathEnv: binDir,
    platform: "win32",
    env: { ComSpec: comspec, PATHEXT: ".COM;.EXE;.BAT;.CMD" },
    fsImpl: fakeFs,
    spawnSyncImpl: okCmdSpawn(comspec, shim)
  });
  assert.equal(result.available, true);
  assert.equal(result.binary, "cae");
  assert.equal(result.resolved, shim);
});

test("readiness stays ready when the hook command is callable", () => {
  const result = summarizeAstraReadiness({
    modelPayload: catalog(astra()),
    rateLimitPayload: sharedQuota(),
    configuredModelIds: ["gpt-6-astra"],
    hookCommand: {
      command: "cae hook --cae-owned",
      binary: "cae",
      resolved: "/usr/local/bin/cae",
      available: true,
      reason: null
    }
  });
  assert.equal(result.status, "ready_for_live_hook_capture");
  assert.equal(result.hookCommand.available, true);
});

test("readiness cannot become ready when the handler command is unavailable", () => {
  for (const reason of [
    "hook_command_missing",
    "hook_command_not_executable",
    "hook_command_probe_failed"
  ]) {
    const result = summarizeAstraReadiness({
      modelPayload: catalog(astra()),
      rateLimitPayload: sharedQuota(),
      configuredModelIds: ["gpt-6-astra"],
      hookCommand: {
        command: "cae hook --cae-owned",
        binary: "cae",
        resolved: reason === "hook_command_missing" ? null : "/usr/local/bin/cae",
        available: false,
        reason
      }
    });
    assert.equal(result.status, HOOK_COMMAND_UNAVAILABLE);
    assert.equal(result.status === "ready_for_live_hook_capture", false);
    assert.equal(
      result.nextAction,
      "repair the CAE hook command installation before live capture"
    );
  }
});

test("readiness without hook data keeps legacy behavior", () => {
  const result = summarizeAstraReadiness({
    modelPayload: catalog(astra()),
    rateLimitPayload: sharedQuota(),
    configuredModelIds: ["gpt-6-astra"]
  });
  assert.equal(result.status, "ready_for_live_hook_capture");
  assert.equal("hookCommand" in result, false);
});

test("end-to-end real Windows .cmd shim is callable when present on the runner", { skip: process.platform !== "win32" }, () => {
  const dir = tempDir();
  try {
    const stub = path.join(dir, "cae-stub.cmd");
    // node executes .cmd via cmd.exe when shell:true OR when invoked
    // explicitly via %ComSpec%. Our probe does the latter.
    fs.writeFileSync(stub, "@echo off\r\nexit /b 0\r\n");
    const comspec = process.env.ComSpec || process.env.COMSPEC || "cmd.exe";
    const result = checkHookCommand({
      command: "cae-stub hook --cae-owned",
      pathEnv: dir,
      platform: "win32",
      env: { ...process.env, ComSpec: comspec },
      fsImpl: fs
    });
    assert.equal(result.available, true);
    assert.equal(result.resolved, stub);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});