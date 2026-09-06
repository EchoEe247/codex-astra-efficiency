import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTokenBreakdown } from "../src/token-usage.js";

test("derived processed volume becomes unknown when input plus output overflows safe integer", () => {
  const normalized = normalizeTokenBreakdown({
    inputTokens: Number.MAX_SAFE_INTEGER,
    outputTokens: 1
  });

  assert.equal(normalized.input, Number.MAX_SAFE_INTEGER);
  assert.equal(normalized.output, 1);
  assert.equal(normalized.total, null);
  assert.equal(normalized.processedVolume, null);
});

test("cache leverage stays unknown when cached input exceeds total input", () => {
  const normalized = normalizeTokenBreakdown({
    inputTokens: 100,
    cachedInputTokens: 101,
    outputTokens: 5
  });

  assert.equal(normalized.input, 100);
  assert.equal(normalized.cachedInput, 101);
  assert.equal(normalized.cacheLeverage, null);
});
