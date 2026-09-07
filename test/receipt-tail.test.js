import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  appendReceipt,
  readLastReceipt,
  startRunReceipt
} from "../src/receipts.js";

test("readLastReceipt returns the newest valid receipt while skipping malformed trailing lines", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-receipt-tail-"));

  try {
    const first = startRunReceipt({
      id: "receipt-1",
      model: "gpt-6-astra",
      startedAt: "2026-09-07T00:00:00Z"
    });
    const second = startRunReceipt({
      id: "receipt-2",
      model: "gpt-6-astra",
      startedAt: "2026-09-07T00:01:00Z"
    });

    appendReceipt(first, dir);
    appendReceipt(second, dir);
    fs.appendFileSync(path.join(dir, "receipts.jsonl"), "{ malformed trailing json\n", "utf8");

    const latest = readLastReceipt(dir);
    assert.ok(latest);
    assert.equal(latest.id, "receipt-2");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("readLastReceipt stays bounded when historical receipt data is large", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-receipt-large-"));
  const file = path.join(dir, "receipts.jsonl");

  try {
    const padding = JSON.stringify({ old: "x".repeat(2048) });
    fs.writeFileSync(file, `${Array.from({ length: 80 }, () => padding).join("\n")}\n`, "utf8");

    const latest = startRunReceipt({
      id: "receipt-latest",
      model: "gpt-6-astra",
      startedAt: "2026-09-07T01:00:00Z"
    });
    fs.appendFileSync(file, `${JSON.stringify(latest)}\n`, "utf8");

    assert.ok(fs.statSync(file).size > 64 * 1024);
    const result = readLastReceipt(dir);
    assert.equal(result.id, "receipt-latest");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("appendReceipt corrects broader existing POSIX state modes", {
  skip: process.platform === "win32"
}, () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "cae-receipt-mode-"));
  const dir = path.join(parent, "state");
  const file = path.join(dir, "receipts.jsonl");

  try {
    fs.mkdirSync(dir, { mode: 0o777 });
    fs.writeFileSync(file, "", { mode: 0o666 });
    fs.chmodSync(dir, 0o777);
    fs.chmodSync(file, 0o666);

    const receipt = startRunReceipt({
      id: "receipt-mode",
      model: "gpt-6-astra",
      startedAt: "2026-09-07T02:00:00Z"
    });
    appendReceipt(receipt, dir);

    assert.equal(fs.statSync(dir).mode & 0o077, 0);
    assert.equal(fs.statSync(file).mode & 0o077, 0);
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});
