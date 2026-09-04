import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { isAstraModel, loadConfig, parseModelIds, writeConfig } from "../src/config.js";

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

test("writeConfig persists only normalized exact Astra targets", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-test-"));
  try {
    const env = { CAE_STATE_DIR: dir };
    const written = writeConfig(
      { astraModelIds: [" gpt-6-astra ", "gpt-6-astra", "gpt-6-astra-fast"] },
      env
    );
    assert.deepEqual(written.astraModelIds, ["gpt-6-astra", "gpt-6-astra-fast"]);

    const disk = JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8"));
    assert.deepEqual(disk, {
      schemaVersion: 1,
      astraModelIds: ["gpt-6-astra", "gpt-6-astra-fast"]
    });
    assert.deepEqual(loadConfig(env).astraModelIds, ["gpt-6-astra", "gpt-6-astra-fast"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("environment target remains an explicit temporary override", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-test-"));
  try {
    const baseEnv = { CAE_STATE_DIR: dir };
    writeConfig({ astraModelIds: ["gpt-6-astra"] }, baseEnv);
    const loaded = loadConfig({
      ...baseEnv,
      CAE_ASTRA_MODEL_IDS: "gpt-6-astra-validation-target"
    });
    assert.deepEqual(loaded.astraModelIds, ["gpt-6-astra-validation-target"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
