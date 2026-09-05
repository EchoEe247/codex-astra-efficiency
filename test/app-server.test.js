import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import test from "node:test";
import {
  CODEX_COMMAND_ENV,
  initializeRequest,
  initializedNotification,
  modelListRequest,
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
        version: "0.0.0-dev"
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
