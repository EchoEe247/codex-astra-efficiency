import assert from "node:assert/strict";
import test from "node:test";
import { astraCandidatesFromCatalog, summarizeAstraDiscovery } from "../src/model-discovery.js";

test("finds one visible Astra candidate and preserves exact native model id", () => {
  const result = summarizeAstraDiscovery({
    data: [
      {
        id: "picker-astra",
        model: "gpt-6-astra",
        displayName: "GPT-6 Astra",
        hidden: false,
        isDefault: false,
        defaultReasoningEffort: "medium",
        supportedReasoningEfforts: [
          { reasoningEffort: "medium", description: "balanced" },
          { reasoningEffort: "high", description: "deep" }
        ]
      },
      {
        id: "picker-luna",
        model: "gpt-5.6-luna",
        displayName: "GPT-5.6 Luna",
        hidden: false
      }
    ],
    nextCursor: null
  });

  assert.equal(result.status, "single_candidate");
  assert.equal(result.candidates[0].model, "gpt-6-astra");
  assert.deepEqual(result.candidates[0].supportedReasoningEfforts, ["medium", "high"]);
});

test("does not mistake astral-like names or hidden entries for picker Astra", () => {
  assert.deepEqual(
    astraCandidatesFromCatalog({
      data: [
        { id: "astral", model: "astral-helper", displayName: "Astral Helper", hidden: false },
        { id: "astra-hidden", model: "gpt-6-astra-hidden", displayName: "Astra Preview", hidden: true }
      ]
    }),
    []
  );
});

test("multiple native Astra candidates remain ambiguous", () => {
  const result = summarizeAstraDiscovery({
    data: [
      { id: "a", model: "gpt-6-astra", displayName: "GPT-6 Astra", hidden: false },
      { id: "b", model: "gpt-6-astra-fast", displayName: "GPT-6 Astra Fast", hidden: false }
    ],
    nextCursor: "more"
  });

  assert.equal(result.status, "ambiguous");
  assert.equal(result.candidates.length, 2);
  assert.equal(result.nextCursorPresent, true);
});

test("missing or malformed catalog data remains not found", () => {
  assert.deepEqual(summarizeAstraDiscovery(null), {
    status: "not_found",
    candidates: [],
    catalogCount: 0,
    nextCursorPresent: false
  });
});
