import fs from "node:fs";
import path from "node:path";
import { opaqueKey } from "./observe.js";

export const MEASUREMENT_SCHEMA_VERSION = 1;
export const EVENT_TYPE_TURN_MEASUREMENT = "turn_measurement";

export const TRANSCRIPT_TAIL_SCAN_BYTES = 2 * 1024 * 1024;
export const LAST_MEASUREMENT_SCAN_BYTES = 64 * 1024;

export const ATTRIBUTION_MATCHED_TURN = "matched_turn";
export const ATTRIBUTION_UNVERIFIED_SINGLE_RECORD = "unverified_single_record";
export const ATTRIBUTION_UNSCOPED_LATEST = "unscoped_latest_record";

export const TASK_CLASSES = Object.freeze([
  "audit_review",
  "bug_diagnosis",
  "focused_fix",
  "multi_fix_implementation",
  "feature_implementation",
  "refactor",
  "documentation_reconciliation",
  "validation_release",
  "large_repository_exploration"
]);

export const TURN_OUTCOMES = Object.freeze([
  "PASS",
  "PARTIAL",
  "FAIL_USEFUL",
  "FAIL_WASTE"
]);

const ATTRIBUTION_STATUSES = new Set([
  ATTRIBUTION_MATCHED_TURN,
  ATTRIBUTION_UNVERIFIED_SINGLE_RECORD,
  ATTRIBUTION_UNSCOPED_LATEST
]);

function toNonNegativeSafeInt(value) {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }
  if (typeof value === "bigint") {
    return value >= 0n && value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
  }
  return null;
}

function toNonNegativeNumber(value) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  return null;
}

function sanitizeLabel(value, maxLength = 64) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function normalizeAttributionStatus(value) {
  return ATTRIBUTION_STATUSES.has(value) ? value : null;
}

function calculateProcessedVolume(total, input, output) {
  if (total !== null) return total;
  if (input !== null && output !== null) {
    return toNonNegativeSafeInt(input + output);
  }
  return null;
}

function calculateCacheLeverage(cachedInput, input) {
  if (cachedInput === null || input === null) return null;
  if (cachedInput > input) return null;
  if (input === 0) return cachedInput === 0 ? 0.0 : null;
  const ratio = cachedInput / input;
  if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) return null;
  return Number(ratio.toFixed(4));
}

function calculateReasoningFraction(reasoningOutput, output) {
  if (reasoningOutput === null || output === null) return null;
  if (reasoningOutput > output) return null;
  if (output === 0) return reasoningOutput === 0 ? 0.0 : null;
  const ratio = reasoningOutput / output;
  if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) return null;
  return Number(ratio.toFixed(4));
}

/**
 * Normalize one native token breakdown. Missing or invalid values remain null;
 * CAE never coerces an unknown counter into a credible-looking zero.
 */
export function normalizeTokenBreakdown(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const input = toNonNegativeSafeInt(raw.inputTokens ?? raw.input_tokens);
  const cachedInput = toNonNegativeSafeInt(raw.cachedInputTokens ?? raw.cached_input_tokens);
  const cacheWriteInput = toNonNegativeSafeInt(
    raw.cacheWriteInputTokens ?? raw.cache_write_input_tokens
  );
  const output = toNonNegativeSafeInt(raw.outputTokens ?? raw.output_tokens);
  const reasoningOutput = toNonNegativeSafeInt(
    raw.reasoningOutputTokens ?? raw.reasoning_output_tokens
  );
  const total = toNonNegativeSafeInt(raw.totalTokens ?? raw.total_tokens);

  return {
    input,
    cachedInput,
    cacheWriteInput,
    output,
    reasoningOutput,
    total,
    processedVolume: calculateProcessedVolume(total, input, output),
    cacheLeverage: calculateCacheLeverage(cachedInput, input),
    reasoningFraction: calculateReasoningFraction(reasoningOutput, output)
  };
}

/**
 * Normalize a ThreadTokenUsage-like payload while preserving the distinction
 * between the most recent turn and cumulative thread counters.
 */
export function normalizeThreadTokenUsage(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      last: null,
      total: null,
      modelContextWindow: null
    };
  }

  const lastRaw = raw.last ?? raw.last_token_usage ?? raw.usage ?? null;
  const totalRaw = raw.total ?? raw.total_token_usage ?? raw.thread_token_usage ?? null;

  return {
    last: normalizeTokenBreakdown(lastRaw),
    total: normalizeTokenBreakdown(totalRaw),
    modelContextWindow: toNonNegativeSafeInt(
      raw.modelContextWindow ?? raw.model_context_window
    )
  };
}

/**
 * `sessionKey` and `turnKey` are internal CAE opaque-key parameters. Raw native
 * IDs should be supplied through `threadId` / `turnId`, which are always hashed
 * before persistence. The 64-hex compatibility path preserves existing CAE
 * event/measurement correlation keys.
 */
function toOpaqueKey(namespace, value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return opaqueKey(namespace, trimmed);
}

/**
 * Construct a privacy-safe turn measurement. Raw prompt/response/transcript
 * content and raw native identifiers are deliberately absent from the schema.
 */
export function createTurnMeasurementRecord({
  sessionKey = null,
  turnKey = null,
  threadId = null,
  turnId = null,
  model = null,
  reasoning = null,
  tokens = null,
  tokenUsage = null,
  cumulativeTokens = null,
  context = {},
  quota = {},
  durationSeconds = null,
  outcome = null,
  taskClass = null,
  attributionStatus = null,
  recordedAt = new Date().toISOString()
} = {}) {
  const safeSessionKey = sessionKey
    ? toOpaqueKey("session", sessionKey)
    : threadId
    ? opaqueKey("session", threadId)
    : null;

  const safeTurnKey = turnKey
    ? toOpaqueKey("turn", turnKey)
    : turnId
    ? opaqueKey("turn", turnId)
    : null;

  let turnTokens = null;
  let totalTokens = null;
  let contextWindow = null;

  if (tokenUsage && typeof tokenUsage === "object") {
    const normalized = normalizeThreadTokenUsage(tokenUsage);
    turnTokens = normalized.last;
    totalTokens = normalized.total;
    contextWindow = normalized.modelContextWindow;
  } else if (tokens && typeof tokens === "object") {
    turnTokens = normalizeTokenBreakdown(tokens);
  }

  if (cumulativeTokens && typeof cumulativeTokens === "object") {
    totalTokens = normalizeTokenBreakdown(cumulativeTokens);
  }

  const safeContextWindow = toNonNegativeSafeInt(context?.window) ?? contextWindow;
  const safeContextPeak = toNonNegativeSafeInt(context?.peak);

  return {
    schemaVersion: MEASUREMENT_SCHEMA_VERSION,
    eventType: EVENT_TYPE_TURN_MEASUREMENT,
    recordedAt: typeof recordedAt === "string" ? recordedAt : new Date().toISOString(),
    sessionKey: safeSessionKey,
    turnKey: safeTurnKey,
    model: sanitizeLabel(model, 32),
    reasoning: sanitizeLabel(reasoning, 16),
    attributionStatus: normalizeAttributionStatus(attributionStatus),
    tokens: turnTokens ?? {
      input: null,
      cachedInput: null,
      cacheWriteInput: null,
      output: null,
      reasoningOutput: null,
      total: null,
      processedVolume: null,
      cacheLeverage: null,
      reasoningFraction: null
    },
    cumulativeTokens: totalTokens,
    context: {
      window: safeContextWindow,
      peak: safeContextPeak
    },
    quota: {
      fiveHourBurnPoints: toNonNegativeNumber(quota?.fiveHourBurnPoints),
      weeklyBurnPoints: toNonNegativeNumber(quota?.weeklyBurnPoints)
    },
    durationSeconds: toNonNegativeNumber(durationSeconds),
    outcome: TURN_OUTCOMES.includes(outcome) ? outcome : null,
    taskClass: TASK_CLASSES.includes(taskClass) ? taskClass : null
  };
}

function enforcePrivateMode(fileOrDir, mode) {
  if (process.platform === "win32") return;
  try {
    const stat = fs.statSync(fileOrDir);
    if ((stat.mode & 0o077) !== 0) {
      fs.chmodSync(fileOrDir, mode);
    }
  } catch {
    // Best-effort hardening only; caller retains fail-open behavior.
  }
}

function parseMeasurementLine(line) {
  if (typeof line !== "string" || !line.trim()) return null;
  try {
    const parsed = JSON.parse(line);
    if (
      parsed?.schemaVersion === MEASUREMENT_SCHEMA_VERSION &&
      parsed?.eventType === EVENT_TYPE_TURN_MEASUREMENT
    ) {
      return parsed;
    }
  } catch {
    // Malformed individual records are ignored.
  }
  return null;
}

/**
 * Read the newest valid measurement with a bounded reverse-tail read. This
 * keeps `--last-turn` O(1) with respect to long-term append-only history.
 */
export function readLastTurnMeasurement(
  dir,
  { maxScanBytes = LAST_MEASUREMENT_SCAN_BYTES } = {}
) {
  if (typeof dir !== "string" || !dir.trim()) return null;
  const filePath = path.join(dir, "measurements.jsonl");

  let fd = null;
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size === 0) return null;

    const scanBytes =
      Number.isSafeInteger(maxScanBytes) && maxScanBytes > 0
        ? maxScanBytes
        : LAST_MEASUREMENT_SCAN_BYTES;
    const readSize = Math.min(stat.size, scanBytes);
    const startOffset = stat.size - readSize;

    fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(readSize);
    const bytesRead = fs.readSync(fd, buffer, 0, readSize, startOffset);
    if (bytesRead <= 0) return null;

    let text = buffer.toString("utf8", 0, bytesRead);
    if (startOffset > 0) {
      const firstNewline = text.indexOf("\n");
      if (firstNewline === -1) return null;
      text = text.slice(firstNewline + 1);
    }

    const lines = text.split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      const parsed = parseMeasurementLine(lines[i]);
      if (parsed) return parsed;
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        // Best-effort cleanup.
      }
    }
  }
}

/**
 * Append one turn measurement. A duplicate Stop hook for the same CAE
 * session/turn key is idempotent when it is the most recent measurement.
 */
export function appendTurnMeasurement(record, dir) {
  if (!record || typeof record !== "object") return null;
  if (typeof dir !== "string" || !dir.trim()) return null;

  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    enforcePrivateMode(dir, 0o700);

    const filePath = path.join(dir, "measurements.jsonl");
    const previous = readLastTurnMeasurement(dir);
    if (
      record.sessionKey &&
      record.turnKey &&
      previous?.sessionKey === record.sessionKey &&
      previous?.turnKey === record.turnKey
    ) {
      return filePath;
    }

    fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, {
      encoding: "utf8",
      mode: 0o600
    });
    enforcePrivateMode(filePath, 0o600);
    return filePath;
  } catch {
    return null;
  }
}

/**
 * Read measurement history. Full-history reads remain available for analysis;
 * the common `limit: 1` path is delegated to the bounded tail reader.
 */
export function readTurnMeasurements(dir, { sessionKey = null, limit = null } = {}) {
  if (typeof dir !== "string" || !dir.trim()) return [];

  if (!sessionKey && limit === 1) {
    const last = readLastTurnMeasurement(dir);
    return last ? [last] : [];
  }

  const filePath = path.join(dir, "measurements.jsonl");
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const records = [];

    for (const line of content.split("\n")) {
      const parsed = parseMeasurementLine(line);
      if (!parsed) continue;
      if (sessionKey && parsed.sessionKey !== sessionKey) continue;
      records.push(parsed);
    }

    if (limit && Number.isInteger(limit) && limit > 0) {
      return records.slice(-limit);
    }
    return records;
  } catch {
    return [];
  }
}

function parseTranscriptEntries(text) {
  const entries = [];
  const lines = text.split("\n");
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]?.trim();
    if (!line) continue;
    if (!line.includes("token_usage_record") && !line.includes("token_count")) continue;
    try {
      entries.push({ index, entry: JSON.parse(line) });
    } catch {
      // Malformed candidate lines are ignored; no older value is invented.
    }
  }
  return { lines, entries };
}

function isTokenUsageRecord(item) {
  return item?.entry?.type === "token_usage_record" && item?.entry?.payload;
}

function recordIdentity(payload) {
  return {
    threadId: typeof payload?.thread_id === "string" ? payload.thread_id : null,
    turnId: typeof payload?.turn_id === "string" ? payload.turn_id : null
  };
}

function findAssociatedContextWindow(entries, selectedIndex) {
  let contextWindow = null;
  for (const item of entries) {
    if (item.index <= selectedIndex) continue;
    if (isTokenUsageRecord(item)) break;
    if (item?.entry?.type !== "event_msg" || item?.entry?.payload?.type !== "token_count") {
      continue;
    }
    const candidate = toNonNegativeSafeInt(item.entry.payload?.info?.model_context_window);
    if (candidate !== null) contextWindow = candidate;
  }
  return contextWindow;
}

/**
 * Passively extract native token counters from a bounded transcript tail.
 *
 * When `expectedTurnId` is supplied, tagged native `token_usage_record` entries
 * must match the Stop hook's transient thread/turn identity. This prevents a
 * not-yet-flushed current turn from inheriting the previous turn's counters.
 * Raw native IDs are used only for in-memory comparison and are never returned.
 *
 * A single record with no native identity fields is retained only as an
 * explicitly `unverified_single_record` compatibility result. Multiple
 * unidentified records are never guessed between.
 */
export function readTokenUsageFromTranscript(transcriptPath, options = {}) {
  if (typeof transcriptPath !== "string" || !transcriptPath) return null;

  const maxScanBytes =
    Number.isSafeInteger(options?.maxScanBytes) && options.maxScanBytes > 0
      ? options.maxScanBytes
      : TRANSCRIPT_TAIL_SCAN_BYTES;
  const expectedThreadId =
    typeof options?.expectedThreadId === "string" && options.expectedThreadId
      ? options.expectedThreadId
      : null;
  const expectedTurnId =
    typeof options?.expectedTurnId === "string" && options.expectedTurnId
      ? options.expectedTurnId
      : null;

  let fd = null;
  try {
    const stat = fs.statSync(transcriptPath);
    if (!stat.isFile() || stat.size === 0) return null;

    const readSize = Math.min(stat.size, maxScanBytes);
    const startOffset = stat.size - readSize;

    fd = fs.openSync(transcriptPath, "r");
    const buffer = Buffer.alloc(readSize);
    const bytesRead = fs.readSync(fd, buffer, 0, readSize, startOffset);
    if (bytesRead <= 0) return null;

    let text = buffer.toString("utf8", 0, bytesRead);
    if (startOffset > 0) {
      const firstNewline = text.indexOf("\n");
      if (firstNewline === -1) return null;
      text = text.slice(firstNewline + 1);
    }

    const { entries } = parseTranscriptEntries(text);
    const tokenRecords = entries.filter(isTokenUsageRecord);
    if (tokenRecords.length === 0) return null;

    let selected = null;
    let attributionStatus = ATTRIBUTION_UNSCOPED_LATEST;

    if (expectedTurnId) {
      for (let i = tokenRecords.length - 1; i >= 0; i--) {
        const item = tokenRecords[i];
        const identity = recordIdentity(item.entry.payload);
        if (identity.turnId !== expectedTurnId) continue;
        if (expectedThreadId && identity.threadId !== expectedThreadId) continue;
        selected = item;
        attributionStatus = ATTRIBUTION_MATCHED_TURN;
        break;
      }

      if (!selected) {
        const allUnidentified = tokenRecords.every((item) => {
          const identity = recordIdentity(item.entry.payload);
          return identity.threadId === null && identity.turnId === null;
        });
        if (allUnidentified && tokenRecords.length === 1) {
          selected = tokenRecords[0];
          attributionStatus = ATTRIBUTION_UNVERIFIED_SINGLE_RECORD;
        } else {
          return null;
        }
      }
    } else {
      selected = tokenRecords[tokenRecords.length - 1];
    }

    const payload = selected.entry.payload;
    return {
      last: payload?.turn_token_usage ?? null,
      total: payload?.thread_token_usage ?? null,
      modelContextWindow: findAssociatedContextWindow(entries, selected.index),
      attributionStatus
    };
  } catch {
    return null;
  } finally {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        // Best-effort cleanup.
      }
    }
  }
}

function formatValue(val, unit = "") {
  if (val === null || val === undefined) return "unavailable";
  if (typeof val === "number") {
    return `${val.toLocaleString("en-US")}${unit ? ` ${unit}` : ""}`;
  }
  return String(val);
}

/**
 * Format a turn measurement without implying a public token-to-quota formula.
 */
export function formatTurnMeasurement(record) {
  if (!record || typeof record !== "object") {
    return "No turn measurement recorded.\n";
  }

  const tokens = record.tokens || {};
  const context = record.context || {};
  const quota = record.quota || {};

  const lines = [
    "NATIVE MODEL PROCESSING",
    `  Model:                 ${formatValue(record.model)}`,
    `  Reasoning effort:      ${formatValue(record.reasoning)}`,
    `  Turn attribution:      ${formatValue(record.attributionStatus)}`,
    `  Input tokens:          ${formatValue(tokens.input)}`,
    `  Cached input tokens:   ${formatValue(tokens.cachedInput)}`,
    `  Output tokens:         ${formatValue(tokens.output)}`,
    `  Reasoning output:      ${formatValue(tokens.reasoningOutput)}`,
    `  Total/processed:       ${formatValue(tokens.processedVolume)}`,
    "",
    "CONTEXT",
    `  Context window:        ${formatValue(context.window, "tokens")}`,
    `  Peak occupancy:        ${formatValue(context.peak, "tokens")}`,
    "",
    "PLUS ALLOWANCE",
    `  5-hour burn points:    ${formatValue(quota.fiveHourBurnPoints, "pt")}`,
    `  Weekly burn points:    ${formatValue(quota.weeklyBurnPoints, "pt")}`,
    "",
    "OUTCOME",
    `  Task class:            ${formatValue(record.taskClass)}`,
    `  Outcome:               ${formatValue(record.outcome)}`,
    `  Duration:              ${formatValue(record.durationSeconds, "s")}`
  ];

  return lines.join("\n") + "\n";
}
