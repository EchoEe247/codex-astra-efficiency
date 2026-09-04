import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { applyHookSetup, hooksFilePath, planHookSetup, resolveCodexHome } from "../src/setup.js";

function tempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cae-setup-test-"));
}

test("resolves Codex home exactly like upstream default and CODEX_HOME override", () => {
  assert.equal(resolveCodexHome({}, "/home/example"), path.join("/home/example", ".codex"));
  assert.equal(
    resolveCodexHome({ CODEX_HOME: "/tmp/custom-codex" }, "/home/example"),
    path.resolve("/tmp/custom-codex")
  );
});

test("dry-run plans CAE hooks without writing user configuration", () => {
  const home = tempHome();
  try {
    const plan = applyHookSetup({ env: {}, homeDir: home, action: "install", dryRun: true });
    assert.equal(plan.changed, true);
    assert.equal(plan.applied, false);
    assert.equal(plan.dryRun, true);
    assert.equal(fs.existsSync(hooksFilePath({}, home)), false);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("install preserves existing hooks and is idempotent", () => {
  const home = tempHome();
  try {
    const codexHome = path.join(home, ".codex");
    fs.mkdirSync(codexHome, { recursive: true });
    const file = path.join(codexHome, "hooks.json");
    fs.writeFileSync(
      file,
      JSON.stringify({
        custom: { keep: true },
        hooks: {
          Stop: [{ hooks: [{ type: "command", command: "existing stop" }] }]
        }
      })
    );

    const first = applyHookSetup({ env: {}, homeDir: home, action: "install" });
    assert.equal(first.applied, true);
    const installed = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.deepEqual(installed.custom, { keep: true });
    assert.equal(installed.hooks.Stop[0].hooks[0].command, "existing stop");
    assert.equal(
      installed.hooks.Stop.some((group) =>
        group.hooks?.some((handler) => handler.command === "cae hook --cae-owned")
      ),
      true
    );
    assert.equal(
      installed.hooks.UserPromptSubmit.some((group) =>
        group.hooks?.some((handler) => handler.command === "cae hook --cae-owned")
      ),
      true
    );

    const second = applyHookSetup({ env: {}, homeDir: home, action: "install" });
    assert.equal(second.changed, false);
    assert.equal(second.applied, false);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("uninstall removes only CAE handlers and preserves later user changes", () => {
  const home = tempHome();
  try {
    const codexHome = path.join(home, ".codex");
    fs.mkdirSync(codexHome, { recursive: true });
    const file = path.join(codexHome, "hooks.json");

    applyHookSetup({ env: {}, homeDir: home, action: "install" });
    const afterInstall = JSON.parse(fs.readFileSync(file, "utf8"));
    afterInstall.hooks.Stop.push({ hooks: [{ type: "command", command: "added later" }] });
    afterInstall.other = "preserve";
    fs.writeFileSync(file, JSON.stringify(afterInstall));

    const removal = applyHookSetup({ env: {}, homeDir: home, action: "uninstall" });
    assert.equal(removal.applied, true);

    const final = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.equal(final.other, "preserve");
    assert.equal(
      JSON.stringify(final).includes("cae hook --cae-owned"),
      false
    );
    assert.equal(JSON.stringify(final).includes("added later"), true);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test("configured CODEX_HOME must already exist before install", () => {
  const home = tempHome();
  try {
    const missing = path.join(home, "missing");
    assert.throws(
      () => applyHookSetup({ env: { CODEX_HOME: missing }, homeDir: home, action: "install" }),
      /CODEX_HOME must already exist/
    );
    const plan = planHookSetup({ env: { CODEX_HOME: missing }, homeDir: home, action: "install" });
    assert.equal(plan.hooksFile, path.join(missing, "hooks.json"));
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
