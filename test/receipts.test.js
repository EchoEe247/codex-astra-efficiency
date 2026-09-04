import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { appendReceipt, completeRunReceipt, startRunReceipt } from "../src/receipts.js";

function quota(used5h, usedWeekly, resets5h = 1000, resetsWeekly = 2000) {
  return {
    accountId: "must-not-persist",
    ordinaryUsageAllowed: true,
    rateLimits: {
      limitId: "codex",
      planType: "plus",
      primary: { usedPercent: used5h, windowDurationMins: 300, resetsAt: resets5h },
      secondary: { usedPercent: usedWeekly, windowDurationMins: 10080, resetsAt: resetsWeekly }
    }
  };
}

test("receipt stores sanitized quota facts and measured deltas", () => {
  const started = startRunReceipt({
    id: "run-1",
    model: "gpt-6-astra",
    codexVersion: "codex 1.2.3",
    taskClass: "cross-system debugging",
    rawQuota: quota(10, 20),
    startedAt: "2026-09-04T19:00:00.000Z"
  });

  const completed = completeRunReceipt(started, {
    rawQuota: quota(24, 26),
    outcome: "PASS",
    humanInterventions: 1,
    endedAt: "2026-09-04T19:30:00.000Z"
  });

  assert.equal(completed.status, "completed");
  assert.equal(completed.durationMs, 30 * 60 * 1000);
  assert.equal(completed.usageDelta.fiveHour.status, "measured");
  assert.equal(completed.usageDelta.fiveHour.usedPercentDelta, 14);
  assert.equal(completed.usageDelta.weekly.usedPercentDelta, 6);
  assert.equal(JSON.stringify(completed).includes("must-not-persist"), false);
});

test("receipt preserves unavailable quota instead of inventing burn", () => {
  const started = startRunReceipt({
    id: "run-2",
    model: "gpt-6-astra",
    startedAt: "2026-09-04T19:00:00.000Z"
  });
  const completed = completeRunReceipt(started, {
    outcome: "FAIL_USEFUL",
    endedAt: "2026-09-04T19:05:00.000Z"
  });

  assert.deepEqual(completed.usageDelta, {
    fiveHour: { status: "unavailable" },
    weekly: { status: "unavailable" }
  });
});

test("appendReceipt writes local JSONL only to the supplied state directory", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-receipt-test-"));
  try {
    const receipt = startRunReceipt({
      id: "run-3",
      model: "gpt-6-astra",
      startedAt: "2026-09-04T19:00:00.000Z"
    });
    const file = appendReceipt(receipt, dir);
    const rows = fs.readFileSync(file, "utf8").trim().split("\n").map(JSON.parse);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, "run-3");
    assert.equal(path.dirname(file), dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
