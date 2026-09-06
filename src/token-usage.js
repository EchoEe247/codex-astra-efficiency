import fs from "node:fs";
import path from "node:path";
import { opaqueKey } from "./observe.js";

export const MEASUREMENT_SCHEMA_VERSION = 1;
export const EVENT_TYPE_TURN_MEASUREMENT = "turn_measurement";

export const TRANSCRIPT_TAIL_SCAN_BYTES = 2 * 1024 * 1024; // 2 MiB bounded tail scan

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
  if (output === 0) return reasoningOutput === 0 ? 0.0 : null;
  const ratio = reasoningOutput / output;
  if (!Number.isFinite(ratio) || ratio < 0) return null;
  return Number(Math.min(1.0, ratio).toFixed(4));
}

/**
 * Normalizes a raw token breakdown object from Codex app-server notifications
 * or session records. Supports both camelCase and snake_case representations.
 *
 * Missing or invalid fields are preserved as null. Never guesses or zero-fills
 * unknown fields.
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

  const processedVolume = calculateProcessedVolume(total, input, output);
  const cacheLeverage = calculateCacheLeverage(cachedInput, input);
  const reasoningFraction = calculateReasoningFraction(reasoningOutput, output);

  return {
    input,
    cachedInput,
    cacheWriteInput,
    output,
    reasoningOutput,
    total,
    processedVolume,
    cacheLeverage,
    reasoningFraction
  };
}

/**
 * Normalizes a full thread token usage payload, distinguishing the last turn
 * from the cumulative thread total.
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
 * Ensures an opaque hashed key. If an unhashed native ID is supplied, it is
 * securely hashed with CAE's salt namespace. Raw native IDs are NEVER returned.
 */
function toOpaqueKey(namespace, value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  // If already a 64-char hex string, accept as existing opaque key
  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return opaqueKey(namespace, trimmed);
}

/**
 * Constructs a privacy-safe, versioned turn measurement record.
 *
 * Guarantees:
 * - NO raw prompts, responses, or code
 * - NO file paths or directory locations
 * - NO account identifiers, credentials, or API tokens
 * - NO raw native threadId or turnId (only opaque hashes)
 * - Null for all missing or unverifiable metrics
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

  const safeContextWindow =
    toNonNegativeSafeInt(context?.window) ?? contextWindow;
  const safeContextPeak = toNonNegativeSafeInt(context?.peak);

  const safeFiveHourBurn = toNonNegativeNumber(quota?.fiveHourBurnPoints);
  const safeWeeklyBurn = toNonNegativeNumber(quota?.weeklyBurnPoints);

  const safeOutcome = TURN_OUTCOMES.includes(outcome) ? outcome : null;
  const safeTaskClass = TASK_CLASSES.includes(taskClass) ? taskClass : null;

  return {
    schemaVersion: MEASUREMENT_SCHEMA_VERSION,
    eventType: EVENT_TYPE_TURN_MEASUREMENT,
    recordedAt: typeof recordedAt === "string" ? recordedAt : new Date().toISOString(),
    sessionKey: safeSessionKey,
    turnKey: safeTurnKey,
    model: sanitizeLabel(model, 32),
    reasoning: sanitizeLabel(reasoning, 16),
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
      fiveHourBurnPoints: safeFiveHourBurn,
      weeklyBurnPoints: safeWeeklyBurn
    },
    durationSeconds: toNonNegativeNumber(durationSeconds),
    outcome: safeOutcome,
    taskClass: safeTaskClass
  };
}

/**
 * Appends a turn measurement to measurements.jsonl in the given directory.
 * Fails open: suppresses filesystem errors so caller turns are never blocked.
 */
export function appendTurnMeasurement(record, dir) {
  if (!record || typeof record !== "object") return null;
  if (typeof dir !== "string" || !dir.trim()) return null;

  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    if (process.platform !== "win32") {
      try {
        const dirStat = fs.statSync(dir);
        if ((dirStat.mode & 0o077) !== 0) {
          fs.chmodSync(dir, 0o700);
        }
      } catch {}
    }
    const filePath = path.join(dir, "measurements.jsonl");
    fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, {
      encoding: "utf8",
      mode: 0o600
    });
    if (process.platform !== "win32") {
      try {
        const fileStat = fs.statSync(filePath);
        if ((fileStat.mode & 0o077) !== 0) {
          fs.chmodSync(filePath, 0o600);
        }
      } catch {}
    }
    return filePath;
  } catch {
    // Fail-open: persistence errors must never block Codex turns.
    return null;
  }
}

/**
 * Reads all turn measurement records from measurements.jsonl in dir.
 */
export function readTurnMeasurements(dir, { sessionKey = null, limit = null } = {}) {
  if (typeof dir !== "string" || !dir.trim()) return [];
  const filePath = path.join(dir, "measurements.jsonl");
  if (!fs.existsSync(filePath)) return [];

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const records = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (
          parsed?.schemaVersion === MEASUREMENT_SCHEMA_VERSION &&
          parsed?.eventType === EVENT_TYPE_TURN_MEASUREMENT
        ) {
          if (sessionKey && parsed.sessionKey !== sessionKey) continue;
          records.push(parsed);
        }
      } catch {
        // Skip malformed individual lines.
      }
    }

    if (limit && Number.isInteger(limit) && limit > 0) {
      return records.slice(-limit);
    }
    return records;
  } catch {
    return [];
  }
}

/**
 * Reads the most recent turn measurement record.
 */
export function readLastTurnMeasurement(dir) {
  const records = readTurnMeasurements(dir, { limit: 1 });
  return records.length > 0 ? records[0] : null;
}

/**
 * Passively extracts token usage from a local transcript/rollout JSONL file.
 * Fails open and returns null if file is missing, unreadable, or malformed.
 */
export function readTokenUsageFromTranscript(transcriptPath, options = {}) {
  if (typeof transcriptPath !== "string" || !transcriptPath) return null;
  const maxScanBytes =
    typeof options?.maxScanBytes === "number" && options.maxScanBytes > 0
      ? options.maxScanBytes
      : TRANSCRIPT_TAIL_SCAN_BYTES;

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
      // Discard partial first line if we did not read from the start of the file
      const firstNewline = text.indexOf("\n");
      if (firstNewline === -1) return null;
      text = text.slice(firstNewline + 1);
    }

    const lines = text.split("\n");
    let lastTokenRecord = null;
    let lastTokenCount = null;

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i]?.trim();
      if (!line) continue;
      if (!line.includes("token_usage_record") && !line.includes("token_count")) continue;

      try {
        const entry = JSON.parse(line);
        if (!lastTokenRecord && entry?.type === "token_usage_record" && entry?.payload) {
          lastTokenRecord = entry.payload;
        }
        if (!lastTokenCount && entry?.type === "event_msg" && entry?.payload?.type === "token_count") {
          lastTokenCount = entry.payload;
        }
        if (lastTokenRecord && lastTokenCount) break;
      } catch {
        // fail-open on malformed lines
      }
    }

    if (!lastTokenRecord && !lastTokenCount) return null;

    return {
      last: lastTokenRecord?.turn_token_usage || lastTokenCount?.info?.last_token_usage || null,
      total: lastTokenRecord?.thread_token_usage || lastTokenCount?.info?.total_token_usage || null,
      modelContextWindow: lastTokenCount?.info?.model_context_window ?? null
    };
  } catch {
    return null;
  } finally {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        // Best effort cleanup
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
 * Formats a turn measurement record for terminal display.
 * Strictly avoids unauthoritative labels like "cost", "quota tokens", etc.
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