import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  MEASUREMENT_SCHEMA_VERSION,
  EVENT_TYPE_TURN_MEASUREMENT,
  TASK_CLASSES,
  TURN_OUTCOMES,
  normalizeTokenBreakdown,
  normalizeThreadTokenUsage,
  createTurnMeasurementRecord,
  appendTurnMeasurement,
  readTurnMeasurements,
  readLastTurnMeasurement,
  formatTurnMeasurement
} from "../src/token-usage.js";

function loadFixture(name) {
  const content = fs.readFileSync(
    path.join(import.meta.dirname, "fixtures", "token-usage", name),
    "utf8"
  );
  return JSON.parse(content);
}

test("normalizes complete ThreadTokenUsage payload with last, total, and context window", () => {
  const fixture = loadFixture("complete.json");
  const normalized = normalizeThreadTokenUsage(fixture.tokenUsage);

  assert.equal(normalized.modelContextWindow, 258400);

  // Last turn breakdown
  assert.equal(normalized.last.input, 12500);
  assert.equal(normalized.last.cachedInput, 10000);
  assert.equal(normalized.last.cacheWriteInput, 2500);
  assert.equal(normalized.last.output, 800);
  assert.equal(normalized.last.reasoningOutput, 400);
  assert.equal(normalized.last.total, 13300);
  assert.equal(normalized.last.processedVolume, 13300);
  assert.equal(normalized.last.cacheLeverage, 0.8);
  assert.equal(normalized.last.reasoningFraction, 0.5);

  // Cumulative total breakdown
  assert.equal(normalized.total.input, 45000);
  assert.equal(normalized.total.cachedInput, 38000);
  assert.equal(normalized.total.cacheWriteInput, 7000);
  assert.equal(normalized.total.output, 3200);
  assert.equal(normalized.total.reasoningOutput, 1600);
  assert.equal(normalized.total.total, 48200);
  assert.equal(normalized.total.processedVolume, 48200);
  assert.equal(normalized.total.cacheLeverage, 0.8444);
  assert.equal(normalized.total.reasoningFraction, 0.5);
});

test("handles payload with zero cached input and zero reasoning output", () => {
  const fixture = loadFixture("no-cached-input.json");
  const normalized = normalizeThreadTokenUsage(fixture);

  assert.equal(normalized.last.input, 5000);
  assert.equal(normalized.last.cachedInput, 0);
  assert.equal(normalized.last.cacheLeverage, 0.0);
  assert.equal(normalized.last.reasoningOutput, 0);
  assert.equal(normalized.last.reasoningFraction, 0.0);
  assert.equal(normalized.last.processedVolume, 5250);
});

test("handles payload with missing reasoning output", () => {
  const fixture = loadFixture("missing-reasoning.json");
  const normalized = normalizeThreadTokenUsage(fixture);

  assert.equal(normalized.last.input, 8000);
  assert.equal(normalized.last.cachedInput, 6000);
  assert.equal(normalized.last.reasoningOutput, null);
  assert.equal(normalized.last.reasoningFraction, null);
  assert.equal(normalized.last.total, 8500);
});

test("handles payload with missing model context window", () => {
  const fixture = loadFixture("missing-context-window.json");
  const normalized = normalizeThreadTokenUsage(fixture);

  assert.equal(normalized.modelContextWindow, null);
  assert.equal(normalized.last.input, 1000);
  assert.equal(normalized.last.output, 100);
  assert.equal(normalized.last.processedVolume, 1100);
});

test("handles partial breakdown calculating processed volume from input + output", () => {
  const fixture = loadFixture("partial.json");
  const normalized = normalizeThreadTokenUsage(fixture);

  assert.equal(normalized.last.input, 3000);
  assert.equal(normalized.last.output, 150);
  assert.equal(normalized.last.total, null);
  assert.equal(normalized.last.processedVolume, 3150);
  assert.equal(normalized.last.cachedInput, null);
  assert.equal(normalized.last.cacheLeverage, null);
});

test("handles null or undefined payload safely without throwing", () => {
  const fixture = loadFixture("null-payload.json");
  const normalized = normalizeThreadTokenUsage(fixture);

  assert.deepEqual(normalized, {
    last: null,
    total: null,
    modelContextWindow: null
  });

  const nullBreakdown = normalizeTokenBreakdown(null);
  assert.equal(nullBreakdown, null);
});

test("rejects malformed string tokens to null instead of coercing or NaN", () => {
  const fixture = loadFixture("malformed-strings.json");
  const normalized = normalizeThreadTokenUsage(fixture);

  assert.equal(normalized.modelContextWindow, null);
  assert.equal(normalized.last.input, null);
  assert.equal(normalized.last.cachedInput, null);
  assert.equal(normalized.last.output, null);
  assert.equal(normalized.last.total, null);
  assert.equal(normalized.last.processedVolume, null);
});

test("rejects negative numeric values to null", () => {
  const fixture = loadFixture("negative-values.json");
  const normalized = normalizeThreadTokenUsage(fixture);

  assert.equal(normalized.modelContextWindow, null);
  assert.equal(normalized.last.input, null);
  assert.equal(normalized.last.cachedInput, null);
  assert.equal(normalized.last.output, null);
  assert.equal(normalized.last.reasoningOutput, null);
  assert.equal(normalized.last.total, null);
});

test("rejects integers exceeding Number.MAX_SAFE_INTEGER", () => {
  const fixture = loadFixture("unexpectedly-large.json");
  const normalized = normalizeThreadTokenUsage(fixture);

  assert.equal(normalized.last.input, null);
  assert.equal(normalized.last.output, 100);
  assert.equal(normalized.last.processedVolume, null);
});

test("ignores extra unknown fields cleanly", () => {
  const fixture = loadFixture("extra-unknown-fields.json");
  const normalized = normalizeThreadTokenUsage(fixture);

  assert.equal(normalized.last.input, 1000);
  assert.equal(normalized.last.cachedInput, 800);
  assert.equal(normalized.last.output, 100);
  assert.equal(normalized.last.total, 1100);
  assert.equal("superfluousTelemetry" in normalized.last, false);
});

test("supports schema drift with snake_case token properties", () => {
  const fixture = loadFixture("schema-drift.json");
  const normalized = normalizeTokenBreakdown(fixture);

  assert.equal(normalized.input, 12000);
  assert.equal(normalized.cachedInput, 10000);
  assert.equal(normalized.cacheWriteInput, 2000);
  assert.equal(normalized.output, 600);
  assert.equal(normalized.reasoningOutput, 200);
  assert.equal(normalized.total, 12600);
  assert.equal(normalized.processedVolume, 12600);
  assert.equal(normalized.cacheLeverage, 0.8333);
  assert.equal(normalized.reasoningFraction, 0.3333);
});

test("preserves distinction between cumulative total and last-turn breakdown", () => {
  const fixture = loadFixture("cumulative-vs-last.json");
  const normalized = normalizeThreadTokenUsage(fixture);

  assert.equal(normalized.last.input, 4000);
  assert.equal(normalized.last.total, 4200);
  assert.equal(normalized.total.input, 20000);
  assert.equal(normalized.total.total, 21200);
  assert.notEqual(normalized.last.input, normalized.total.input);
});

test("createTurnMeasurementRecord enforces schema version, hashing, and sanitized fields", () => {
  const record = createTurnMeasurementRecord({
    threadId: "0191b92c-raw-thread-id-must-be-hashed",
    turnId: "0191b92c-raw-turn-id-must-be-hashed",
    model: "gpt-6-astra",
    reasoning: "low",
    tokens: {
      inputTokens: 10000,
      cachedInputTokens: 8000,
      outputTokens: 500,
      totalTokens: 10500
    },
    context: {
      window: 258400,
      peak: 10500
    },
    quota: {
      fiveHourBurnPoints: 1.5,
      weeklyBurnPoints: 4.2
    },
    durationSeconds: 12.3,
    outcome: "PASS",
    taskClass: "audit_review"
  });

  assert.equal(record.schemaVersion, MEASUREMENT_SCHEMA_VERSION);
  assert.equal(record.eventType, EVENT_TYPE_TURN_MEASUREMENT);
  assert.equal(record.model, "gpt-6-astra");
  assert.equal(record.reasoning, "low");
  assert.equal(record.outcome, "PASS");
  assert.equal(record.taskClass, "audit_review");
  assert.equal(record.durationSeconds, 12.3);
  assert.equal(record.quota.fiveHourBurnPoints, 1.5);
  assert.equal(record.quota.weeklyBurnPoints, 4.2);

  // Tokens verified
  assert.equal(record.tokens.input, 10000);
  assert.equal(record.tokens.cachedInput, 8000);
  assert.equal(record.tokens.output, 500);
  assert.equal(record.tokens.total, 10500);
  assert.equal(record.tokens.processedVolume, 10500);

  // Context verified
  assert.equal(record.context.window, 258400);
  assert.equal(record.context.peak, 10500);

  // CRITICAL PRIVACY: Raw IDs MUST NOT exist anywhere in the record
  assert.equal("threadId" in record, false);
  assert.equal("turnId" in record, false);
  assert.match(record.sessionKey, /^[0-9a-f]{64}$/);
  assert.match(record.turnKey, /^[0-9a-f]{64}$/);
  assert.equal(record.sessionKey.includes("0191b92c"), false);
  assert.equal(record.turnKey.includes("0191b92c"), false);
});

test("createTurnMeasurementRecord sanitizes unlisted task classes and outcomes to null", () => {
  const record = createTurnMeasurementRecord({
    outcome: "EXPLODED",
    taskClass: "unsupported_magic_task"
  });

  assert.equal(record.outcome, null);
  assert.equal(record.taskClass, null);
});

test("measurements.jsonl persistence: appends, reads, filters by sessionKey, and fails open", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-measurements-test-"));

  try {
    const rec1 = createTurnMeasurementRecord({
      sessionKey: "session-a",
      turnKey: "turn-1",
      model: "gpt-6-astra",
      tokens: { inputTokens: 1000, outputTokens: 50 },
      outcome: "PASS",
      taskClass: "focused_fix"
    });

    const rec2 = createTurnMeasurementRecord({
      sessionKey: "session-b",
      turnKey: "turn-2",
      model: "gpt-6-astra",
      tokens: { inputTokens: 2000, outputTokens: 100 },
      outcome: "PARTIAL",
      taskClass: "bug_diagnosis"
    });

    appendTurnMeasurement(rec1, tmpDir);
    appendTurnMeasurement(rec2, tmpDir);

    const all = readTurnMeasurements(tmpDir);
    assert.equal(all.length, 2);
    assert.equal(all[0].turnKey, rec1.turnKey);
    assert.equal(all[1].turnKey, rec2.turnKey);

    const last = readLastTurnMeasurement(tmpDir);
    assert.equal(last.turnKey, rec2.turnKey);

    const filtered = readTurnMeasurements(tmpDir, { sessionKey: rec1.sessionKey });
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].turnKey, rec1.turnKey);

    // Fail-open test: unwritable path returns null and does not throw
    const failPath = appendTurnMeasurement(rec1, "/dev/null/impossible");
    assert.equal(failPath, null);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("formatTurnMeasurement generates structured terminal output without prohibited words", () => {
  const record = createTurnMeasurementRecord({
    model: "gpt-6-astra",
    reasoning: "low",
    tokens: {
      inputTokens: 15420,
      cachedInputTokens: 12288,
      outputTokens: 742,
      reasoningOutputTokens: 384,
      totalTokens: 16162
    },
    context: {
      window: 258400,
      peak: 16162
    },
    quota: {
      fiveHourBurnPoints: 2.1,
      weeklyBurnPoints: 5.4
    },
    durationSeconds: 14.8,
    outcome: "PASS",
    taskClass: "focused_fix"
  });

  const formatted = formatTurnMeasurement(record);

  assert.match(formatted, /NATIVE MODEL PROCESSING/);
  assert.match(formatted, /CONTEXT/);
  assert.match(formatted, /PLUS ALLOWANCE/);
  assert.match(formatted, /OUTCOME/);

  assert.match(formatted, /Model:\s+gpt-6-astra/);
  assert.match(formatted, /Input tokens:\s+15,420/);
  assert.match(formatted, /Cached input tokens:\s+12,288/);
  assert.match(formatted, /Total\/processed:\s+16,162/);
  assert.match(formatted, /5-hour burn points:\s+2\.1 pt/);
  assert.match(formatted, /Weekly burn points:\s+5\.4 pt/);

  // Prohibited misleading claims check
  assert.doesNotMatch(formatted, /\bcost\b/i);
  assert.doesNotMatch(formatted, /quota tokens/i);
  assert.doesNotMatch(formatted, /remaining Astra tokens/i);
});
