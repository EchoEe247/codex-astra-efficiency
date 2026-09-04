import test from "node:test";
import assert from "node:assert/strict";
import { isAstraModel, parseModelIds } from "../src/config.js";

test("parseModelIds trims, removes empties, and deduplicates", () => {
  assert.deepEqual(
    parseModelIds("gpt-6-astra, gpt-6-astra ,astra-preview"),
    ["gpt-6-astra", "astra-preview"]
  );
});

test("isAstraModel requires an exact configured model id", () => {
  const ids = ["gpt-6-astra"];
  assert.equal(isAstraModel("gpt-6-astra", ids), true);
  assert.equal(isAstraModel("GPT-6-ASTRA", ids), true);
  assert.equal(isAstraModel("gpt-6-astra-fast", ids), false);
  assert.equal(isAstraModel("gpt-5.6-sol", ids), false);
});

test("unconfigured target list never activates", () => {
  assert.equal(isAstraModel("gpt-6-astra", []), false);
});
