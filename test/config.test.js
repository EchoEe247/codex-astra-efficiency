import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { isAstraModel, loadConfig, parseModelIds, writeConfig } from "../src/config.js";
import { runHook } from "../src/hook.js";

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

test("F5: invalid parsed config shape validation - null", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-shape-"));
  try {
    fs.writeFileSync(path.join(dir, "config.json"), "null");
    const cfg = loadConfig({ CAE_STATE_DIR: dir });
    assert.equal(cfg.warning, "config_invalid_shape:expected_object");
    assert.deepEqual(cfg.astraModelIds, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("F5: invalid parsed config shape validation - array", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-shape-"));
  try {
    fs.writeFileSync(path.join(dir, "config.json"), "[]");
    const cfg = loadConfig({ CAE_STATE_DIR: dir });
    assert.equal(cfg.warning, "config_invalid_shape:expected_object");
    assert.deepEqual(cfg.astraModelIds, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("F5: invalid parsed config shape validation - primitive string", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-shape-"));
  try {
    fs.writeFileSync(path.join(dir, "config.json"), '"just-a-string"');
    const cfg = loadConfig({ CAE_STATE_DIR: dir });
    assert.equal(cfg.warning, "config_invalid_shape:expected_object");
    assert.deepEqual(cfg.astraModelIds, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("F5: invalid parsed config shape validation - primitive number", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-shape-"));
  try {
    fs.writeFileSync(path.join(dir, "config.json"), "123");
    const cfg = loadConfig({ CAE_STATE_DIR: dir });
    assert.equal(cfg.warning, "config_invalid_shape:expected_object");
    assert.deepEqual(cfg.astraModelIds, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("F5: invalid parsed config shape validation - primitive boolean", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-shape-"));
  try {
    fs.writeFileSync(path.join(dir, "config.json"), "true");
    const cfg = loadConfig({ CAE_STATE_DIR: dir });
    assert.equal(cfg.warning, "config_invalid_shape:expected_object");
    assert.deepEqual(cfg.astraModelIds, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("F5: valid empty object config", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-shape-"));
  try {
    fs.writeFileSync(path.join(dir, "config.json"), "{}");
    const cfg = loadConfig({ CAE_STATE_DIR: dir });
    assert.equal(cfg.warning, null);
    assert.deepEqual(cfg.astraModelIds, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("F5: valid config object with astraModelIds array", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-shape-"));
  try {
    fs.writeFileSync(
      path.join(dir, "config.json"),
      JSON.stringify({ schemaVersion: 1, astraModelIds: ["gpt-6-astra"] })
    );
    const cfg = loadConfig({ CAE_STATE_DIR: dir });
    assert.equal(cfg.warning, null);
    assert.deepEqual(cfg.astraModelIds, ["gpt-6-astra"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("F5: invalid astraModelIds type generates warning", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-shape-"));
  try {
    fs.writeFileSync(
      path.join(dir, "config.json"),
      JSON.stringify({ astraModelIds: 123 })
    );
    const cfgNum = loadConfig({ CAE_STATE_DIR: dir });
    assert.equal(cfgNum.warning, "config_invalid_shape:invalid_astra_model_ids");

    fs.writeFileSync(
      path.join(dir, "config.json"),
      JSON.stringify({ astraModelIds: [123, null] })
    );
    const cfgMixed = loadConfig({ CAE_STATE_DIR: dir });
    assert.equal(cfgMixed.warning, "config_invalid_shape:invalid_astra_model_ids");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("F5: preserves CAE_ASTRA_MODEL_IDS environment fallback when file config is invalid shape", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-shape-"));
  try {
    fs.writeFileSync(path.join(dir, "config.json"), "null");
    const cfg = loadConfig({
      CAE_STATE_DIR: dir,
      CAE_ASTRA_MODEL_IDS: "gpt-6-astra-env-fallback"
    });
    assert.equal(cfg.warning, "config_invalid_shape:expected_object");
    assert.deepEqual(cfg.astraModelIds, ["gpt-6-astra-env-fallback"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("F5: hook safety - malformed config fails open without throwing or persisting raw prompt", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-config-hook-safe-"));
  try {
    fs.writeFileSync(path.join(dir, "config.json"), "null");
    const env = { CAE_STATE_DIR: dir };

    const rawInput = JSON.stringify({
      hook_event_name: "UserPromptSubmit",
      model: "gpt-6-astra",
      session_id: "s1",
      turn_id: "t1",
      prompt: "secret confidential prompt code"
    });

    const response = runHook(rawInput, { env });
    assert.deepEqual(response, { continue: true, suppressOutput: true });

    const eventsFile = path.join(dir, "events.jsonl");
    assert.equal(fs.existsSync(eventsFile), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
