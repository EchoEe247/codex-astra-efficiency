import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";
import {
  CODEX_COMMAND_ENV,
  CODEX_VERSION_TIMEOUT_MS,
  initializeRequest,
  initializedNotification,
  isWindowsBatch,
  modelListRequest,
  prepareProcessInvocation,
  probeCodexVersion,
  rateLimitsRequest,
  readAccountRateLimits,
  readModelList,
  resolveCodexCommand
} from "../src/app-server.js";

function fakeSpawnWithResults(resultsByMethod, expectedCommand = null) {
  return (command, args) => {
    if (expectedCommand !== null) assert.equal(command, expectedCommand);
    assert.deepEqual(args, ["app-server", "--listen", "stdio://"]);

    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const child = {
      stdin,
      stdout,
      stderr,
      killed: false,
      kill() {
        this.killed = true;
      }
    };

    let buffer = "";
    stdin.setEncoding("utf8");
    stdin.on("data", (chunk) => {
      buffer += chunk;
      while (buffer.includes("\n")) {
        const index = buffer.indexOf("\n");
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        if (!line.trim()) continue;
        const message = JSON.parse(line);
        if (message.method === "initialize" && Object.hasOwn(message, "id")) {
          queueMicrotask(() => {
            stdout.write(`${JSON.stringify({ id: message.id, result: { userAgent: "test" } })}\n`);
          });
          continue;
        }

        if (Object.hasOwn(resultsByMethod, message.method)) {
          queueMicrotask(() => {
            stdout.write(
              `${JSON.stringify({ id: message.id, result: resultsByMethod[message.method] })}\n`
            );
          });
        }
      }
    });

    return child;
  };
}

test("builds the current Codex initialize handshake without a jsonrpc field", () => {
  assert.deepEqual(initializeRequest(7), {
    id: 7,
    method: "initialize",
    params: {
      clientInfo: {
        name: "codex-astra-efficiency",
        title: "Codex Astra Efficiency",
        version: "0.1.0"
      },
      capabilities: null
    }
  });
  assert.deepEqual(initializedNotification(), { method: "initialized" });
  assert.deepEqual(rateLimitsRequest(8), { id: 8, method: "account/rateLimits/read" });
  assert.deepEqual(modelListRequest(9), {
    id: 9,
    method: "model/list",
    params: { cursor: null, limit: 100, includeHidden: false }
  });
});

test("resolves explicit, environment, and platform-default Codex launchers conservatively", () => {
  assert.equal(
    resolveCodexCommand({ codexCommand: " /custom/codex-wrapper ", env: {}, platform: "linux" }),
    "/custom/codex-wrapper"
  );
  assert.equal(
    resolveCodexCommand({ env: { [CODEX_COMMAND_ENV]: " /usr/bin/codex " }, platform: "linux" }),
    "/usr/bin/codex"
  );
  assert.equal(resolveCodexCommand({ env: {}, platform: "linux" }), "codex");
  assert.equal(resolveCodexCommand({ env: {}, platform: "win32" }), "codex.cmd");
});

test("explicit launcher takes precedence over environment launcher", () => {
  assert.equal(
    resolveCodexCommand({
      codexCommand: "explicit-codex",
      env: { [CODEX_COMMAND_ENV]: "env-codex" },
      platform: "linux"
    }),
    "explicit-codex"
  );
});

test("performs initialize then reads one account rate-limit snapshot through selected launcher", async () => {
  const quota = {
    rateLimits: {
      planType: "plus",
      primary: { usedPercent: 11, windowDurationMins: 300, resetsAt: 123 },
      secondary: { usedPercent: 23, windowDurationMins: 10080, resetsAt: 456 }
    }
  };

  const response = await readAccountRateLimits({
    codexCommand: "/usr/bin/codex",
    spawnImpl: fakeSpawnWithResults({ "account/rateLimits/read": quota }, "/usr/bin/codex"),
    timeoutMs: 1000
  });

  assert.equal(response.initialized, true);
  assert.equal(response.command, "/usr/bin/codex");
  assert.deepEqual(response.result, quota);
  assert.equal(response.stderr, null);
});

test("environment launcher is used by app-server reads when explicit launcher is absent", async () => {
  const quota = { rateLimits: null };
  const response = await readAccountRateLimits({
    env: { [CODEX_COMMAND_ENV]: "/wrapper/codex" },
    platform: "linux",
    spawnImpl: fakeSpawnWithResults({ "account/rateLimits/read": quota }, "/wrapper/codex"),
    timeoutMs: 1000
  });

  assert.equal(response.command, "/wrapper/codex");
  assert.deepEqual(response.result, quota);
});

test("reads the same native model catalog that backs Codex picker discovery", async () => {
  const catalog = {
    data: [
      {
        id: "model-entry-1",
        model: "gpt-6-astra",
        displayName: "GPT-6 Astra",
        description: "test fixture",
        hidden: false,
        isDefault: false,
        defaultReasoningEffort: "medium",
        supportedReasoningEfforts: [
          { reasoningEffort: "medium", description: "balanced" },
          { reasoningEffort: "high", description: "deep" }
        ]
      }
    ],
    nextCursor: null
  };

  const response = await readModelList({
    codexCommand: "fake-codex",
    spawnImpl: fakeSpawnWithResults({ "model/list": catalog }, "fake-codex"),
    timeoutMs: 1000
  });

  assert.equal(response.initialized, true);
  assert.deepEqual(response.result, catalog);
});

test("F2 negative test: rejects deterministically when spawn fails/throws error", async () => {
  const missingLauncher = "/definitely/missing/codex";
  let err;
  try {
    await readAccountRateLimits({
      codexCommand: missingLauncher,
      spawnImpl: () => {
        throw new Error("spawn ENOENT");
      }
    });
  } catch (e) {
    err = e;
  }
  assert.ok(err, "should have rejected");
  assert.match(err.message, /codex_app_server_spawn_failed/);
});

test("F3 negative test: timeout rejects request even if child process stdout is kept open", async () => {
  const spawnImpl = () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const child = {
      stdin,
      stdout,
      stderr,
      killed: false,
      kill() {
        this.killed = true;
      }
    };
    return child;
  };

  let err;
  const startTime = Date.now();
  try {
    await readAccountRateLimits({
      codexCommand: "hang-codex",
      spawnImpl,
      timeoutMs: 50
    });
  } catch (e) {
    err = e;
  }
  const duration = Date.now() - startTime;
  assert.ok(err, "should have timed out");
  assert.ok(duration < 500, `duration ${duration}ms should be bounded`);
  assert.match(err.message, /codex_app_server_timeout/);
});

test("rejects when initialization fails with error", async () => {
  const spawnImpl = (command, args) => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const child = { stdin, stdout, stderr, killed: false, kill() {} };

    stdin.on("data", (chunk) => {
      const line = chunk.toString().trim();
      if (!line) return;
      const msg = JSON.parse(line);
      if (msg.method === "initialize") {
        stdout.write(`${JSON.stringify({ id: msg.id, error: { message: "init failed" } })}\n`);
      }
    });

    return child;
  };

  let err;
  try {
    await readAccountRateLimits({ codexCommand: "fail-init-codex", spawnImpl });
  } catch (e) {
    err = e;
  }
  assert.ok(err, "should fail");
  assert.match(err.message, /codex_app_server_initialize_failed:init failed/);
});

test("rejects when request fails with error", async () => {
  const spawnImpl = (command, args) => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const child = { stdin, stdout, stderr, killed: false, kill() {} };

    stdin.on("data", (chunk) => {
      const line = chunk.toString().trim();
      if (!line) return;
      const msg = JSON.parse(line);
      if (msg.method === "initialize") {
        stdout.write(`${JSON.stringify({ id: msg.id, result: {} })}\n`);
      } else if (msg.method === "account/rateLimits/read") {
        stdout.write(`${JSON.stringify({ id: msg.id, error: { message: "request failed" } })}\n`);
      }
    });

    return child;
  };

  let err;
  try {
    await readAccountRateLimits({ codexCommand: "fail-req-codex", spawnImpl });
  } catch (e) {
    err = e;
  }
  assert.ok(err, "should fail");
  assert.match(err.message, /codex_app_server_request_failed/);
});

test("rejects when stream closes prematurely", async () => {
  const spawnImpl = (command, args) => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const child = { stdin, stdout, stderr, killed: false, kill() {} };

    stdin.on("data", (chunk) => {
      stdout.end();
    });

    return child;
  };

  let err;
  try {
    await readAccountRateLimits({ codexCommand: "close-codex", spawnImpl });
  } catch (e) {
    err = e;
  }
  assert.ok(err, "should fail");
  assert.match(err.message, /codex_app_server_closed_before_response/);
});

test("F1: win32 default codex.cmd uses ComSpec /d /c dispatch", () => {
  const comspec = "C:\\Windows\\System32\\cmd.exe";
  const inv = prepareProcessInvocation("codex.cmd", ["app-server", "--listen", "stdio://"], {
    platform: "win32",
    env: { ComSpec: comspec }
  });
  assert.equal(inv.file, comspec);
  assert.deepEqual(inv.args, ["/d", "/c", "codex.cmd", "app-server", "--listen", "stdio://"]);
});

test("F1: explicit C:\\path with spaces\\codex.cmd uses ComSpec and preserves path", () => {
  const comspec = "C:\\Windows\\System32\\cmd.exe";
  const shim = "C:\\Program Files\\Codex\\codex.cmd";
  const inv = prepareProcessInvocation(shim, ["app-server", "--listen", "stdio://"], {
    platform: "win32",
    env: { ComSpec: comspec }
  });
  assert.equal(inv.file, comspec);
  assert.equal(inv.args[0], "/d");
  assert.equal(inv.args[1], "/c");
  assert.equal(inv.args[2], shim);
  assert.deepEqual(inv.args.slice(3), ["app-server", "--listen", "stdio://"]);
});

test("F1: Windows .bat launcher routes through ComSpec", () => {
  const comspec = "C:\\Windows\\System32\\cmd.exe";
  const batPath = "C:\\tools\\codex.bat";
  const inv = prepareProcessInvocation(batPath, ["--version"], {
    platform: "win32",
    env: { ComSpec: comspec }
  });
  assert.equal(inv.file, comspec);
  assert.deepEqual(inv.args, ["/d", "/c", batPath, "--version"]);
});

test("F1: Windows native .exe launcher uses direct process execution", () => {
  const exePath = "C:\\tools\\codex.exe";
  const inv = prepareProcessInvocation(exePath, ["app-server", "--listen", "stdio://"], {
    platform: "win32"
  });
  assert.equal(inv.file, exePath);
  assert.deepEqual(inv.args, ["app-server", "--listen", "stdio://"]);
});

test("F1: POSIX executable uses direct process execution unchanged", () => {
  const posixPath = "/usr/local/bin/codex";
  const inv = prepareProcessInvocation(posixPath, ["app-server", "--listen", "stdio://"], {
    platform: "linux"
  });
  assert.equal(inv.file, posixPath);
  assert.deepEqual(inv.args, ["app-server", "--listen", "stdio://"]);
});

test("F1: custom CAE_CODEX_COMMAND is preserved and dispatched correctly", () => {
  const cmd = resolveCodexCommand({
    env: { [CODEX_COMMAND_ENV]: "C:\\my tools\\custom-codex.cmd" },
    platform: "win32"
  });
  assert.equal(cmd, "C:\\my tools\\custom-codex.cmd");
  const inv = prepareProcessInvocation(cmd, ["app-server", "--listen", "stdio://"], {
    platform: "win32",
    env: { ComSpec: "C:\\Windows\\cmd.exe" }
  });
  assert.equal(inv.file, "C:\\Windows\\cmd.exe");
  assert.equal(inv.args[2], "C:\\my tools\\custom-codex.cmd");
});

test("F1: missing ComSpec falls back to cmd.exe on Windows", () => {
  const inv = prepareProcessInvocation("codex.cmd", ["--version"], {
    platform: "win32",
    env: {}
  });
  assert.equal(inv.file, "cmd.exe");
  assert.deepEqual(inv.args, ["/d", "/c", "codex.cmd", "--version"]);
});

test("F1: arguments remain safely separated in invocation args array", () => {
  const args = ["app-server", "--listen", "stdio://", "--param", "value with spaces"];
  const inv = prepareProcessInvocation("codex.cmd", args, {
    platform: "win32",
    env: { ComSpec: "cmd.exe" }
  });
  assert.equal(inv.args.length, 2 + 1 + args.length);
  assert.deepEqual(inv.args.slice(3), args);
});

test(
  "end-to-end real Windows .cmd shim launches app-server and answers readAccountRateLimits",
  { skip: process.platform !== "win32" },
  async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-win-test-"));
    try {
      const shimPath = path.join(tmpDir, "codex-test.cmd");
      const script = [
        "@echo off",
        'if "%1"=="--version" (',
        "  echo codex 1.2.3",
        "  exit /b 0",
        ")",
        'if "%1"=="app-server" (',
        '  echo {"id":1,"result":{"clientInfo":{"name":"test"}}}',
        '  echo {"id":2,"result":{"rateLimits":{"planType":"plus"}}}',
        "  exit /b 0",
        ")",
        "exit /b 1"
      ].join("\r\n");
      fs.writeFileSync(shimPath, script);

      const version = probeCodexVersion(shimPath);
      assert.equal(version.status, "ok");
      assert.match(version.version, /codex 1\.2\.3/);

      const limits = await readAccountRateLimits({ codexCommand: shimPath });
      assert.equal(limits.initialized, true);
      assert.deepEqual(limits.result, { rateLimits: { planType: "plus" } });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
);

test(
  "end-to-end real Windows .cmd shim with spaces in directory path launches app-server and answers readAccountRateLimits",
  { skip: process.platform !== "win32" },
  async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-win-test-"));
    try {
      const spaceDir = path.join(tmpDir, "CAE Windows Test");
      fs.mkdirSync(spaceDir, { recursive: true });
      const shimPath = path.join(spaceDir, "codex.cmd");
      const script = [
        "@echo off",
        'if "%1"=="--version" (',
        "  echo codex 1.2.3",
        "  exit /b 0",
        ")",
        'if "%1"=="app-server" (',
        '  echo {"id":1,"result":{"clientInfo":{"name":"test"}}}',
        '  echo {"id":2,"result":{"rateLimits":{"planType":"plus"}}}',
        "  exit /b 0",
        ")",
        "exit /b 1"
      ].join("\r\n");
      fs.writeFileSync(shimPath, script);

      const version = probeCodexVersion(shimPath);
      assert.equal(version.status, "ok", JSON.stringify(version));
      assert.match(version.version, /codex 1\.2\.3/);

      const limits = await readAccountRateLimits({ codexCommand: shimPath });
      assert.equal(limits.initialized, true);
      assert.deepEqual(limits.result, { rateLimits: { planType: "plus" } });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
);

test("F2: rejects deterministically on stdin async EPIPE and cleans up child", async () => {
  let childRef;
  const spawnImpl = () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const child = {
      stdin,
      stdout,
      stderr,
      killed: false,
      kill() {
        this.killed = true;
      }
    };
    childRef = child;
    queueMicrotask(() => {
      const err = new Error("write EPIPE");
      err.code = "EPIPE";
      stdin.emit("error", err);
    });
    return child;
  };

  let err;
  try {
    await readAccountRateLimits({ codexCommand: "test-epipe", spawnImpl });
  } catch (e) {
    err = e;
  }
  assert.ok(err, "should reject on stdin EPIPE");
  assert.match(err.message, /^codex_app_server_stream_failed:stdin:EPIPE/);
  assert.equal(childRef.killed, true);
});

test("F2: rejects deterministically on stdout async error", async () => {
  let childRef;
  const spawnImpl = () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const child = {
      stdin,
      stdout,
      stderr,
      killed: false,
      kill() {
        this.killed = true;
      }
    };
    childRef = child;
    queueMicrotask(() => {
      const err = new Error("read ECONNRESET");
      err.code = "ECONNRESET";
      stdout.emit("error", err);
    });
    return child;
  };

  let err;
  try {
    await readAccountRateLimits({ codexCommand: "test-stdout-err", spawnImpl });
  } catch (e) {
    err = e;
  }
  assert.ok(err, "should reject on stdout error");
  assert.match(err.message, /^codex_app_server_stream_failed:stdout:ECONNRESET/);
  assert.equal(childRef.killed, true);
});

test("F2: rejects deterministically on stderr async error", async () => {
  let childRef;
  const spawnImpl = () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const child = {
      stdin,
      stdout,
      stderr,
      killed: false,
      kill() {
        this.killed = true;
      }
    };
    childRef = child;
    queueMicrotask(() => {
      const err = new Error("read EIO");
      err.code = "EIO";
      stderr.emit("error", err);
    });
    return child;
  };

  let err;
  try {
    await readAccountRateLimits({ codexCommand: "test-stderr-err", spawnImpl });
  } catch (e) {
    err = e;
  }
  assert.ok(err, "should reject on stderr error");
  assert.match(err.message, /^codex_app_server_stream_failed:stderr:EIO/);
  assert.equal(childRef.killed, true);
});

test("F2: multiple stream errors settle exactly once without uncaught process errors", async () => {
  let childRef;
  const spawnImpl = () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const child = {
      stdin,
      stdout,
      stderr,
      killed: false,
      kill() {
        this.killed = true;
      }
    };
    childRef = child;
    queueMicrotask(() => {
      const err1 = new Error("write EPIPE");
      err1.code = "EPIPE";
      stdin.emit("error", err1);

      const err2 = new Error("read ECONNRESET");
      err2.code = "ECONNRESET";
      stdout.emit("error", err2);

      const err3 = new Error("stderr error");
      err3.code = "EIO";
      stderr.emit("error", err3);
    });
    return child;
  };

  let err;
  try {
    await readAccountRateLimits({ codexCommand: "test-multi-err", spawnImpl });
  } catch (e) {
    err = e;
  }
  assert.ok(err, "should reject once");
  assert.match(err.message, /^codex_app_server_stream_failed:stdin:EPIPE/);
});

test("F4: normal version probe succeeds and returns parsed version", () => {
  const spawnSyncImpl = (file, args) => {
    assert.deepEqual(args, ["--version"]);
    return { status: 0, stdout: "codex-cli 0.153.2\n", stderr: "", error: null };
  };
  const res = probeCodexVersion("codex", { spawnSyncImpl });
  assert.equal(res.status, "ok");
  assert.equal(res.version, "codex-cli 0.153.2");
});

test("F4: nonzero version exit returns null version with status nonzero_exit", () => {
  const spawnSyncImpl = () => ({ status: 1, stdout: "", stderr: "unknown option", error: null });
  const res = probeCodexVersion("codex", { spawnSyncImpl });
  assert.equal(res.status, "nonzero_exit");
  assert.equal(res.version, null);
  assert.equal(res.exitCode, 1);
});

test("F4: missing launcher returns spawn_error with null version", () => {
  const spawnSyncImpl = () => {
    const err = new Error("spawn ENOENT");
    err.code = "ENOENT";
    return { error: err };
  };
  const res = probeCodexVersion("missing-codex", { spawnSyncImpl });
  assert.equal(res.status, "spawn_error");
  assert.equal(res.version, null);
});

test("F4: timed-out launcher returns timeout status and completes boundedly", () => {
  const spawnSyncImpl = (file, args, options) => {
    assert.ok(options.timeout <= 5000);
    const err = new Error("spawnSync ETIMEDOUT");
    err.code = "ETIMEDOUT";
    return { error: err };
  };
  const res = probeCodexVersion("hang-codex", { spawnSyncImpl, timeoutMs: 50 });
  assert.equal(res.status, "timeout");
  assert.equal(res.version, null);
});

test("F4: signal termination returns signal status with null version", () => {
  const spawnSyncImpl = () => ({ status: null, signal: "SIGTERM", stdout: "", stderr: "" });
  const res = probeCodexVersion("signal-codex", { spawnSyncImpl });
  assert.equal(res.status, "signal");
  assert.equal(res.signal, "SIGTERM");
  assert.equal(res.version, null);
});

test("F4: CODEX_VERSION_TIMEOUT_MS constant is in 3000-5000 ms range", () => {
  assert.ok(CODEX_VERSION_TIMEOUT_MS >= 3000, "at least 3000ms");
  assert.ok(CODEX_VERSION_TIMEOUT_MS <= 5000, "at most 5000ms");
});
