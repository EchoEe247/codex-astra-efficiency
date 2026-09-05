import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { normalizeCompletionEvidence, normalizeRunDescriptor } from "./measurement.js";
import { calculateModelUsageDelta, normalizeRateLimitResponse } from "./rate-limits.js";

export const RECEIPT_SCHEMA_VERSION = 3;
export const RECEIPT_OUTCOMES = Object.freeze([
  "PASS",
  "PARTIAL",
  "FAIL_USEFUL",
  "FAIL_WASTE",
  "UNKNOWN"
]);
export const RECEIPT_CAMPAIGNS = Object.freeze([
  "unspecified",
  "window_0",
  "window_1_control",
  "window_1_optimized",
  "window_2_rc"
]);
export const RECEIPT_CAUSE_CLASSES = Object.freeze([
  "MODEL",
  "USER_TASK",
  "CAE",
  "MIXED",
  "UNKNOWN"
]);

function isoTimestamp(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError("invalid timestamp");
  return date.toISOString();
}

function normalizeQuota(rawQuota) {
  if (rawQuota === null || rawQuota === undefined) return null;
  return normalizeRateLimitResponse(rawQuota);
}

function unavailableUsageDelta() {
  return {
    authority: { status: "unavailable_authority" },
    fiveHour: { status: "unavailable" },
    weekly: { status: "unavailable" }
  };
}

function requireEnum(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw new TypeError(`unsupported ${field}: ${value}`);
  }
  return value;
}

export function startRunReceipt({
  id = crypto.randomUUID(),
  model,
  codexVersion = null,
  plan = null,
  reasoningEffort = null,
  serviceTier = null,
  campaign = "unspecified",
  taskClass = "unclassified",
  projectScale = null,
  continuity = null,
  contextBucket = null,
  rawQuota = null,
  startedAt = new Date()
} = {}) {
  if (typeof model !== "string" || !model.trim()) {
    throw new TypeError("model is required");
  }

  requireEnum(campaign, RECEIPT_CAMPAIGNS, "campaign");

  const startQuota = normalizeQuota(rawQuota);
  const nativePlan = startQuota?.default?.planType ?? null;
  const descriptor = normalizeRunDescriptor({
    plan: nativePlan ?? plan,
    reasoningEffort,
    serviceTier,
    taskClass,
    projectScale,
    continuity,
    contextBucket
  });

  return {
    schemaVersion: RECEIPT_SCHEMA_VERSION,
    id,
    status: "running",
    campaign,
    model: model.trim(),
    codexVersion: typeof codexVersion === "string" ? codexVersion : null,
    ...descriptor,
    startedAt: isoTimestamp(startedAt),
    endedAt: null,
    durationMs: null,
    outcome: null,
    causeClass: null,
    requestedObjectiveCompleted: null,
    validationStatus: null,
    humanInterventions: null,
    subagentCount: null,
    toolClasses: [],
    scopeExpanded: null,
    reworkNeeded: null,
    workDisposition: null,
    startQuota,
    endQuota: null,
    usageDelta: null
  };
}

export function completeRunReceipt(
  receipt,
  {
    rawQuota = null,
    outcome = "UNKNOWN",
    causeClass = "UNKNOWN",
    requestedObjectiveCompleted = null,
    validationStatus = null,
    humanInterventions = null,
    subagentCount = null,
    toolClasses = [],
    scopeExpanded = null,
    reworkNeeded = null,
    workDisposition = null,
    endedAt = new Date()
  } = {}
) {
  if (!receipt || receipt.status !== "running") {
    throw new TypeError("receipt must be a running receipt");
  }
  requireEnum(outcome, RECEIPT_OUTCOMES, "outcome");
  requireEnum(causeClass, RECEIPT_CAUSE_CLASSES, "cause class");

  const evidence = normalizeCompletionEvidence({
    requestedObjectiveCompleted,
    validationStatus,
    humanInterventions,
    subagentCount,
    toolClasses,
    scopeExpanded,
    reworkNeeded,
    workDisposition
  });

  const endedAtIso = isoTimestamp(endedAt);
  const startedMs = new Date(receipt.startedAt).getTime();
  const endedMs = new Date(endedAtIso).getTime();
  if (endedMs < startedMs) throw new RangeError("endedAt precedes startedAt");

  const endQuota = normalizeQuota(rawQuota);
  const usageDelta =
    receipt.startQuota && endQuota
      ? calculateModelUsageDelta(receipt.startQuota, endQuota, receipt.model)
      : unavailableUsageDelta();

  return {
    ...receipt,
    status: "completed",
    endedAt: endedAtIso,
    durationMs: endedMs - startedMs,
    outcome,
    causeClass,
    ...evidence,
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
