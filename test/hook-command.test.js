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
    defaultReasoningEffort: "medium",
    supportedReasoningEfforts: [{ reasoningEffort: "medium" }]
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

test("resolveHookBinary extracts the binary token", () => {
  assert.equal(resolveHookBinary("cae hook --cae-owned"), "cae");
  assert.equal(resolveHookBinary("  /usr/local/bin/cae  hook "), "/usr/local/bin/cae");
  assert.equal(resolveHookBinary('"C:\\tools\\cae.exe" hook'), "C:\\tools\\cae.exe");
  assert.equal(resolveHookBinary(""), null);
  assert.equal(resolveHookBinary(null), null);
});

test("callable stub CAE command reports available without a real global cae", () => {
  const dir = tempDir();
  try {
    const stub = path.join(dir, "cae-stub-ok");
    fs.writeFileSync(stub, "#!/bin/sh\nexit 0\n");
    fs.chmodSync(stub, 0o755);
    const result = checkHookCommand({
      command: "cae-stub-ok hook --cae-owned",
      pathEnv: dir,
      platform: "linux",
      fsImpl: fs,
      spawnSyncImpl: okSpawn(stub)
    });
    assert.equal(result.available, true);
    assert.equal(result.reason, null);
    assert.equal(result.binary, "cae-stub-ok");
    assert.equal(result.resolved, stub);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("missing executable reports hook_command_missing without probing", () => {
  const dir = tempDir();
  try {
    const result = checkHookCommand({
      command: "cae-definitely-absent-xyz hook --cae-owned",
      pathEnv: dir,
      platform: "linux",
      fsImpl: fs,
      spawnSyncImpl: neverSpawn()
    });
    assert.equal(result.available, false);
    assert.equal(result.reason, "hook_command_missing");
    assert.equal(result.resolved, null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
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
  assert.equal(result.resolved, path.join("/fake/bin", "cae"));
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

test("spawn ENOENT maps to missing and EACCES maps to not_executable", () => {
  const enoent = probeHookBinary("/fake/cae", {
    spawnSyncImpl: () => ({ error: Object.assign(new Error("missing"), { code: "ENOENT" }) })
  });
  assert.equal(enoent.callable, false);
  assert.equal(enoent.reason, "hook_command_missing");

  const eacces = probeHookBinary("/fake/cae", {
    spawnSyncImpl: () => ({ error: Object.assign(new Error("denied"), { code: "EACCES" }) })
  });
  assert.equal(eacces.callable, false);
  assert.equal(eacces.reason, "hook_command_not_executable");
});

test("findHookBinary distinguishes missing from not_executable", () => {
  const missing = findHookBinary("cae-absent", {
    pathEnv: "/nonexistent-dir-xyz",
    platform: "linux",
    fsImpl: fs
  });
  assert.equal(missing.outcome, "missing");
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
