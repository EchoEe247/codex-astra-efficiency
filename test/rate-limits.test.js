import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  calculateDefaultUsageDelta,
  calculateModelUsageDelta,
  calculateWindowDelta,
  normalizeRateLimitResponse,
  selectUsageAuthority
} from "../src/rate-limits.js";

function fixture(name) {
  const url = new URL(`./fixtures/rate-limits/${name}.json`, import.meta.url);
  return JSON.parse(fs.readFileSync(url, "utf8"));
}

function modelSpecificPayload(astra5h, astraWeekly, shared5h = 50, sharedWeekly = 60) {
  return {
    ordinaryUsageAllowed: true,
    rateLimits: {
      limitId: "codex",
      planType: "plus",
      primary: { usedPercent: shared5h, windowDurationMins: 300, resetsAt: 1000 },
      secondary: { usedPercent: sharedWeekly, windowDurationMins: 10080, resetsAt: 2000 }
    },
    rateLimitsByLimitId: {
      astra_meter: {
        limitId: "astra_meter",
        limitName: "astra",
        normalModelSlug: "gpt-6-astra",
        planType: "plus",
        primary: { usedPercent: astra5h, windowDurationMins: 300, resetsAt: 1000 },
        secondary: { usedPercent: astraWeekly, windowDurationMins: 10080, resetsAt: 2000 }
      }
    }
  };
}

test("normalizes complete Plus 5-hour, weekly, and credit state by native metadata", () => {
  const normalized = normalizeRateLimitResponse(fixture("complete"));

  assert.equal(normalized.status, "reported");
  assert.equal(normalized.default.planType, "plus");
  assert.equal(normalized.default.fiveHour.status, "reported");
  assert.equal(normalized.default.fiveHour.usedPercent, 18);
  assert.equal(normalized.default.fiveHour.remainingPercent, 82);
  assert.equal(normalized.default.weekly.status, "reported");
  assert.equal(normalized.default.weekly.usedPercent, 37);
  assert.deepEqual(normalized.default.credits, {
    status: "reported",
    hasCredits: true,
    unlimited: false,
    balance: "38"
  });
  assert.equal(normalized.resetCreditsAvailable, 2);
  assert.equal(normalized.ordinaryUsageAllowed, true);
  assert.equal(normalized.buckets.codex.fiveHour.usedPercent, 18);
  assert.equal(normalized.buckets.codex.credits.balance, "38");
});

test("missing purchased-credit state remains not_reported", () => {
  const normalized = normalizeRateLimitResponse(fixture("missing-five-hour"));
  assert.deepEqual(normalized.default.credits, { status: "not_reported" });
});

test("malformed purchased-credit state is surfaced rather than coerced", () => {
  const payload = fixture("complete");
  payload.rateLimits.credits = {
    hasCredits: true,
    unlimited: false,
    balance: 38
  };

  const normalized = normalizeRateLimitResponse(payload);
  assert.deepEqual(normalized.default.credits, {
    status: "malformed",
    reason: "invalid_credit_balance"
  });
});

test("does not invent a missing 5-hour window", () => {
  const normalized = normalizeRateLimitResponse(fixture("missing-five-hour"));

  assert.equal(normalized.default.fiveHour.status, "not_reported");
  assert.equal(normalized.default.weekly.status, "reported");
  assert.equal(normalized.default.weekly.usedPercent, 44);
});

test("does not invent a missing weekly window", () => {
  const normalized = normalizeRateLimitResponse(fixture("missing-weekly"));

  assert.equal(normalized.default.fiveHour.status, "reported");
  assert.equal(normalized.default.fiveHour.usedPercent, 21);
  assert.equal(normalized.default.weekly.status, "not_reported");
});

test("keeps durationless windows unclassified instead of assuming slot meaning", () => {
  const normalized = normalizeRateLimitResponse(fixture("partial"));

  assert.equal(normalized.default.fiveHour.status, "not_reported");
  assert.equal(normalized.default.weekly.status, "reported");
  assert.equal(normalized.default.weekly.usedPercent, 48);
  assert.equal(normalized.default.unclassified.length, 1);
  assert.equal(normalized.default.unclassified[0].slot, "primary");
  assert.equal(normalized.default.unclassified[0].durationMins, null);
});

test("surfaces malformed windows rather than coercing bad values", () => {
  const normalized = normalizeRateLimitResponse(fixture("malformed"));

  assert.equal(normalized.default.fiveHour.status, "malformed");
  assert.equal(normalized.default.fiveHour.candidates[0].reason, "invalid_used_percent");
  assert.equal(normalized.default.malformed.length, 2);
});

test("preserves contradictory observations instead of choosing one", () => {
  const normalized = normalizeRateLimitResponse(fixture("contradictory"));

  assert.equal(normalized.default.fiveHour.status, "conflicting");
  assert.equal(normalized.default.fiveHour.candidates.length, 2);
  assert.deepEqual(
    normalized.default.fiveHour.candidates.map((candidate) => candidate.usedPercent),
    [22, 31]
  );
});

test("calculates measured usage deltas only within a stable window", () => {
  const start = normalizeRateLimitResponse(fixture("complete"));
  const end = structuredClone(start);
  end.default.fiveHour.usedPercent = 25;
  end.default.fiveHour.remainingPercent = 75;
  end.default.weekly.usedPercent = 40;
  end.default.weekly.remainingPercent = 60;

  assert.deepEqual(calculateDefaultUsageDelta(start, end), {
    fiveHour: {
      status: "measured",
      usedPercentDelta: 7,
      startUsedPercent: 18,
      endUsedPercent: 25
    },
    weekly: {
      status: "measured",
      usedPercentDelta: 3,
      startUsedPercent: 37,
      endUsedPercent: 40
    }
  });
});

test("uses shared default allowance when no exact model bucket is reported", () => {
  const normalized = normalizeRateLimitResponse(fixture("complete"));
  const authority = selectUsageAuthority(normalized, "gpt-6-astra");

  assert.equal(authority.status, "selected");
  assert.equal(authority.kind, "shared_default");
  assert.equal(authority.key, "default");
});

test("prefers an exact native model bucket over shared default allowance", () => {
  const start = normalizeRateLimitResponse(modelSpecificPayload(10, 20, 70, 80));
  const end = normalizeRateLimitResponse(modelSpecificPayload(17, 24, 95, 99));

  const delta = calculateModelUsageDelta(start, end, "gpt-6-astra");
  assert.deepEqual(delta.authority, {
    status: "stable",
    kind: "model_bucket",
    key: "astra_meter",
    limitId: "astra_meter",
    normalModelSlug: "gpt-6-astra"
  });
  assert.equal(delta.fiveHour.usedPercentDelta, 7);
  assert.equal(delta.weekly.usedPercentDelta, 4);
});

test("refuses to guess when multiple model-specific quota buckets match Astra", () => {
  const payload = modelSpecificPayload(10, 20);
  payload.rateLimitsByLimitId.astra_meter_2 = {
    ...payload.rateLimitsByLimitId.astra_meter,
    limitId: "astra_meter_2"
  };
  const normalized = normalizeRateLimitResponse(payload);

  const authority = selectUsageAuthority(normalized, "gpt-6-astra");
  assert.equal(authority.status, "ambiguous");
  assert.deepEqual(authority.candidateKeys, ["astra_meter", "astra_meter_2"]);
});

test("does not use a default quota snapshot explicitly assigned to another model", () => {
  const payload = fixture("complete");
  payload.rateLimits.normalModelSlug = "gpt-5.6-sol";
  payload.rateLimitsByLimitId = {};
  const normalized = normalizeRateLimitResponse(payload);

  const authority = selectUsageAuthority(normalized, "gpt-6-astra");
  assert.equal(authority.status, "unavailable");
  assert.equal(authority.reason, "default_targets_other_model");
});

test("treats a limitId change as an authority change even when kind and key match", () => {
  const startPayload = modelSpecificPayload(10, 20);
  const endPayload = modelSpecificPayload(17, 24);
  endPayload.rateLimitsByLimitId.astra_meter.limitId = "astra_meter_rotated";
  const start = normalizeRateLimitResponse(startPayload);
  const end = normalizeRateLimitResponse(endPayload);

  const delta = calculateModelUsageDelta(start, end, "gpt-6-astra");
  assert.equal(delta.authority.status, "authority_changed");
  assert.equal(delta.fiveHour.status, "unavailable");
  assert.equal(delta.weekly.status, "unavailable");
});

test("does not call a reset-crossing change usage burn", () => {
  assert.deepEqual(
    calculateWindowDelta(
      { status: "reported", durationMins: 300, usedPercent: 92, resetsAt: 1000 },
      { status: "reported", durationMins: 300, usedPercent: 7, resetsAt: 2000 }
    ),
    {
      status: "reset_boundary",
      startUsedPercent: 92,
      endUsedPercent: 7
    }
  );
});

test("F4 negative tests: reset continuity with null resetsAt", () => {
  const startEpoch = 1000;
  const endEpoch = 1000;

  // Case A: start.resetsAt = null, end.resetsAt = valid -> must NOT return measured
  const resA = calculateWindowDelta(
    { status: "reported", durationMins: 300, usedPercent: 10, resetsAt: null },
    { status: "reported", durationMins: 300, usedPercent: 15, resetsAt: endEpoch }
  );
  assert.notEqual(resA.status, "measured");
  assert.equal(resA.status, "reset_boundary_unknown");

  // Case B: start.resetsAt = valid, end.resetsAt = null -> must NOT return measured
  const resB = calculateWindowDelta(
    { status: "reported", durationMins: 300, usedPercent: 10, resetsAt: startEpoch },
    { status: "reported", durationMins: 300, usedPercent: 15, resetsAt: null }
  );
  assert.notEqual(resB.status, "measured");
  assert.equal(resB.status, "reset_boundary_unknown");

  // Case C: start.resetsAt = null, end.resetsAt = null -> must NOT return measured
  const resC = calculateWindowDelta(
    { status: "reported", durationMins: 300, usedPercent: 10, resetsAt: null },
    { status: "reported", durationMins: 300, usedPercent: 15, resetsAt: null }
  );
  assert.notEqual(resC.status, "measured");
  assert.equal(resC.status, "reset_boundary_unknown");

  // Case D: start.resetsAt = valid1, end.resetsAt = valid2 -> reset_boundary
  const resD = calculateWindowDelta(
    { status: "reported", durationMins: 300, usedPercent: 10, resetsAt: 1000 },
    { status: "reported", durationMins: 300, usedPercent: 15, resetsAt: 2000 }
  );
  assert.equal(resD.status, "reset_boundary");

  // Case E: start.resetsAt = valid1, end.resetsAt = valid1 -> normal measured behavior preserved
  const resE = calculateWindowDelta(
    { status: "reported", durationMins: 300, usedPercent: 10, resetsAt: 1000 },
    { status: "reported", durationMins: 300, usedPercent: 15, resetsAt: 1000 }
  );
  assert.equal(resE.status, "measured");
  assert.equal(resE.usedPercentDelta, 5);
});
