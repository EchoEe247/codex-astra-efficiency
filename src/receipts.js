import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { calculateDefaultUsageDelta, normalizeRateLimitResponse } from "./rate-limits.js";

export const RECEIPT_SCHEMA_VERSION = 1;
export const RECEIPT_OUTCOMES = Object.freeze([
  "PASS",
  "PARTIAL",
  "FAIL_USEFUL",
  "FAIL_WASTE",
  "UNKNOWN"
]);

function isoTimestamp(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError("invalid timestamp");
  return date.toISOString();
}

function sanitizeTaskClass(value) {
  if (typeof value !== "string" || !value.trim()) return "unclassified";
  return value.trim().slice(0, 80);
}

function normalizeQuota(rawQuota) {
  if (rawQuota === null || rawQuota === undefined) return null;
  return normalizeRateLimitResponse(rawQuota);
}

export function startRunReceipt({
  id = crypto.randomUUID(),
  model,
  codexVersion = null,
  taskClass = "unclassified",
  rawQuota = null,
  startedAt = new Date()
} = {}) {
  if (typeof model !== "string" || !model.trim()) {
    throw new TypeError("model is required");
  }

  return {
    schemaVersion: RECEIPT_SCHEMA_VERSION,
    id,
    status: "running",
    model: model.trim(),
    codexVersion: typeof codexVersion === "string" ? codexVersion : null,
    taskClass: sanitizeTaskClass(taskClass),
    startedAt: isoTimestamp(startedAt),
    endedAt: null,
    durationMs: null,
    outcome: null,
    humanInterventions: null,
    startQuota: normalizeQuota(rawQuota),
    endQuota: null,
    usageDelta: null
  };
}

export function completeRunReceipt(
  receipt,
  {
    rawQuota = null,
    outcome = "UNKNOWN",
    humanInterventions = null,
    endedAt = new Date()
  } = {}
) {
  if (!receipt || receipt.status !== "running") {
    throw new TypeError("receipt must be a running receipt");
  }
  if (!RECEIPT_OUTCOMES.includes(outcome)) {
    throw new TypeError(`unsupported outcome: ${outcome}`);
  }
  if (
    humanInterventions !== null &&
    (!Number.isInteger(humanInterventions) || humanInterventions < 0)
  ) {
    throw new TypeError("humanInterventions must be a non-negative integer or null");
  }

  const endedAtIso = isoTimestamp(endedAt);
  const startedMs = new Date(receipt.startedAt).getTime();
  const endedMs = new Date(endedAtIso).getTime();
  if (endedMs < startedMs) throw new RangeError("endedAt precedes startedAt");

  const endQuota = normalizeQuota(rawQuota);
  const usageDelta =
    receipt.startQuota && endQuota
      ? calculateDefaultUsageDelta(receipt.startQuota, endQuota)
      : {
          fiveHour: { status: "unavailable" },
          weekly: { status: "unavailable" }
        };

  return {
    ...receipt,
    status: "completed",
    endedAt: endedAtIso,
    durationMs: endedMs - startedMs,
    outcome,
    humanInterventions,
    endQuota,
    usageDelta
  };
}

export function appendReceipt(receipt, dir) {
  if (!receipt || typeof receipt !== "object") throw new TypeError("receipt is required");
  if (typeof dir !== "string" || !dir) throw new TypeError("receipt directory is required");

  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, "receipts.jsonl");
  fs.appendFileSync(file, `${JSON.stringify(receipt)}\n`, {
    encoding: "utf8",
    mode: 0o600
  });
  return file;
}
