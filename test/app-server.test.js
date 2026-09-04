import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import test from "node:test";
import {
  initializeRequest,
  initializedNotification,
  rateLimitsRequest,
  readAccountRateLimits
} from "../src/app-server.js";

function fakeSpawnWithQuota(result) {
  return (_command, args) => {
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
        }
        if (message.method === "account/rateLimits/read") {
          queueMicrotask(() => {
            stdout.write(`${JSON.stringify({ id: message.id, result })}\n`);
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
});

test("performs initialize then reads one account rate-limit snapshot", async () => {
  const quota = {
    rateLimits: {
      planType: "plus",
      primary: { usedPercent: 11, windowDurationMins: 300, resetsAt: 123 },
      secondary: { usedPercent: 23, windowDurationMins: 10080, resetsAt: 456 }
    }
  };

  const response = await readAccountRateLimits({
    codexCommand: "fake-codex",
    spawnImpl: fakeSpawnWithQuota(quota),
    timeoutMs: 1000
  });

  assert.equal(response.initialized, true);
  assert.deepEqual(response.result, quota);
  assert.equal(response.stderr, null);
});
