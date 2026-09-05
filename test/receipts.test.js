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

test("receipt stores sanitized quota facts, campaign, cause class, and model-aware deltas", () => {
  const started = startRunReceipt({
    id: "run-1",
    model: "gpt-6-astra",
    codexVersion: "codex 1.2.3",
    reasoningEffort: "high",
    serviceTier: "standard",
    campaign: "window_0",
    taskClass: "cross-system debugging",
    projectScale: "large",
    continuity: "continuation",
    rawQuota: quota(10, 20),
    startedAt: "2026-09-04T19:00:00.000Z"
  });

  const completed = completeRunReceipt(started, {
    rawQuota: quota(24, 26),
    outcome: "PASS",
    causeClass: "MIXED",
    requestedObjectiveCompleted: true,
    validationStatus: "tests-pass",
    humanInterventions: 1,
    subagentCount: 0,
    toolClasses: ["shell", "code-edit", "tests", "shell"],
    scopeExpanded: false,
    reworkNeeded: false,
    workDisposition: "implementation",
    endedAt: "2026-09-04T19:30:00.000Z"
  });

  assert.equal(completed.schemaVersion, 3);
  assert.equal(completed.status, "completed");
  assert.equal(completed.campaign, "window_0");
  assert.equal(completed.causeClass, "MIXED");
  assert.equal(completed.durationMs, 30 * 60 * 1000);
  assert.equal(completed.plan, "plus");
  assert.equal(completed.reasoningEffort, "high");
  assert.equal(completed.serviceTier, "standard");
  assert.equal(completed.projectScale, "large");
  assert.equal(completed.continuity, "continuation");
  assert.equal(completed.requestedObjectiveCompleted, true);
  assert.equal(completed.validationStatus, "tests-pass");
  assert.equal(completed.subagentCount, 0);
  assert.deepEqual(completed.toolClasses, ["shell", "code-edit", "tests"]);
  assert.equal(completed.scopeExpanded, false);
  assert.equal(completed.reworkNeeded, false);
  assert.equal(completed.workDisposition, "implementation");
  assert.deepEqual(completed.usageDelta.authority, {
    status: "stable",
    kind: "shared_default",
    key: "default",
    limitId: "codex",
    normalModelSlug: null
  });
  assert.equal(completed.usageDelta.fiveHour.status, "measured");
  assert.equal(completed.usageDelta.fiveHour.usedPercentDelta, 14);
  assert.equal(completed.usageDelta.weekly.usedPercentDelta, 6);
  assert.equal(JSON.stringify(completed).includes("must-not-persist"), false);
});

test("native quota plan overrides a conflicting provided label", () => {
  const started = startRunReceipt({
    id: "run-native-plan",
    model: "gpt-6-astra",
    plan: "pro",
    rawQuota: quota(1, 2),
    startedAt: "2026-09-04T19:00:00.000Z"
  });

  assert.equal(started.plan, "plus");
  assert.equal(started.campaign, "unspecified");
});

test("receipt preserves unavailable quota and unknown work evidence instead of guessing", () => {
  const started = startRunReceipt({
    id: "run-2",
    model: "gpt-6-astra",
    campaign: "window_1_control",
    startedAt: "2026-09-04T19:00:00.000Z"
  });
  const completed = completeRunReceipt(started, {
    outcome: "FAIL_USEFUL",
    requestedObjectiveCompleted: "unknown",
    humanInterventions: -1,
    subagentCount: 1.5,
    endedAt: "2026-09-04T19:05:00.000Z"
  });

  assert.deepEqual(completed.usageDelta, {
    authority: { status: "unavailable_authority" },
    fiveHour: { status: "unavailable" },
    weekly: { status: "unavailable" }
  });
  assert.equal(completed.causeClass, "UNKNOWN");
  assert.equal(completed.requestedObjectiveCompleted, null);
  assert.equal(completed.humanInterventions, null);
  assert.equal(completed.subagentCount, null);
});

test("receipt rejects unknown campaign and cause-class labels", () => {
  assert.throws(
    () =>
      startRunReceipt({
        model: "gpt-6-astra",
        campaign: "made-up"
      }),
    /unsupported campaign/
  );

  const started = startRunReceipt({ model: "gpt-6-astra" });
  assert.throws(
    () => completeRunReceipt(started, { causeClass: "BLAME_USER" }),
    /unsupported cause class/
  );
});

test("appendReceipt writes local JSONL only to the supplied state directory", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-receipt-test-"));
  try {
    const receipt = startRunReceipt({
      id: "run-3",
      model: "gpt-6-astra",
      campaign: "window_2_rc",
      startedAt: "2026-09-04T19:00:00.000Z"
    });
    const file = appendReceipt(receipt, dir);
    const rows = fs.readFileSync(file, "utf8").trim().split("\n").map(JSON.parse);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, "run-3");
    assert.equal(rows[0].campaign, "window_2_rc");
    assert.equal(path.dirname(file), dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
