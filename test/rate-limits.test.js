import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  calculateDefaultUsageDelta,
  calculateWindowDelta,
  normalizeRateLimitResponse
} from "../src/rate-limits.js";

function fixture(name) {
  const url = new URL(`./fixtures/rate-limits/${name}.json`, import.meta.url);
  return JSON.parse(fs.readFileSync(url, "utf8"));
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
