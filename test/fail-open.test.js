import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { processHookInput } from "../src/hook.js";
import { summarizeAstraReadiness } from "../src/readiness.js";
import {
  appendTurnMeasurement,
  normalizeThreadTokenUsage,
  createTurnMeasurementRecord
} from "../src/token-usage.js";
import { parseThreadTokenUsageNotification } from "../src/app-server.js";

test("Phase 12: Fail-open - malformed token notification never throws and fails gracefully", () => {
  const malformedInputs = [
    null,
    undefined,
    {},
    { method: "unexpected/method" },
    { method: "thread/tokenUsage/updated" },
    { method: "thread/tokenUsage/updated", params: null },
    { method: "thread/tokenUsage/updated", params: "not-an-object" },
    { method: "thread/tokenUsage/updated", params: { tokenUsage: "corrupted" } },
    { method: "thread/tokenUsage/updated", params: { tokenUsage: { last: -999 } } }
  ];

  for (const input of malformedInputs) {
    assert.doesNotThrow(() => {
      const parsed = parseThreadTokenUsageNotification(input);
      if (parsed) {
        normalizeThreadTokenUsage(parsed.tokenUsage);
      }
    });
  }
});

test("Phase 12: Fail-open - storage failure in appendTurnMeasurement returns null and never throws", () => {
  const record = createTurnMeasurementRecord({
    sessionKey: "s-1",
    turnKey: "t-1",
    model: "gpt-6-astra",
    tokens: { inputTokens: 100, outputTokens: 20 }
  });

  assert.doesNotThrow(() => {
    const res1 = appendTurnMeasurement(record, "/nonexistent_root_dir_impossible/meas");
    assert.equal(res1, null);

    const res2 = appendTurnMeasurement(null, "/tmp");
    assert.equal(res2, null);

    const res3 = appendTurnMeasurement(record, null);
    assert.equal(res3, null);
  });
});

test("Phase 12: Fail-open - missing token notification does not affect v0.1 readiness gating", () => {
  const modelPayload = {
    data: [
      {
        id: "gpt-6-astra",
        model: "gpt-6-astra",
        displayName: "Astra",
        defaultReasoningEffort: "medium"
      }
    ]
  };

  const rateLimitPayload = {
    rateLimits: {
      limitId: "codex",
      normalModelSlug: null,
      planType: "plus",
      primary: { usedPercent: 1, windowDurationMins: 300, resetsAt: 1000 },
      secondary: { usedPercent: 82, windowDurationMins: 10080, resetsAt: 2000 }
    }
  };

  const configuredModelIds = ["gpt-6-astra"];
  const hookCommand = { available: true };
  const nativeHooks = { readable: true, installed: true };

  // Readiness evaluation without any token notification data
  const readiness = summarizeAstraReadiness({
    modelPayload,
    rateLimitPayload,
    configuredModelIds,
    hookCommand,
    nativeHooks
  });

  // Must remain ready_for_live_hook_capture without token telemetry
  assert.equal(readiness.status, "ready_for_live_hook_capture");
  assert.equal(readiness.targetConfigured, true);
});

test("Phase 12: Fail-open - non-Astra turns remain strict no-op under token accounting", () => {
  const result = processHookInput(
    {
      hook_event_name: "UserPromptSubmit",
      model: "gpt-5.6-sol",
      session_id: "s1",
      turn_id: "t1"
    },
    {
      config: {
        dir: "/tmp/unused",
        astraModelIds: ["gpt-6-astra"],
        warning: null
      }
    }
  );

  assert.equal(result.targeted, false);
  assert.equal(result.observation, null);
  assert.deepEqual(result.response, { continue: true, suppressOutput: true });
});

test("Phase 12: Fail-open - processHookInput returns no-op response for unconfigured model or empty object", () => {
  const result = processHookInput(
    { model: null },
    {
      config: {
        dir: "/tmp/unused",
        astraModelIds: ["gpt-6-astra"],
        warning: null
      }
    }
  );

  assert.equal(result.targeted, false);
  assert.equal(result.observation, null);
  assert.deepEqual(result.response, { continue: true, suppressOutput: true });
});
