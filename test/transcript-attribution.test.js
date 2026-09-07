import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runHook } from "../src/hook.js";
import {
  ATTRIBUTION_MATCHED_TURN,
  readTokenUsageFromTranscript
} from "../src/token-usage.js";

function writeTranscript(file, entries) {
  fs.writeFileSync(file, `${entries.map((entry) => JSON.stringify(entry)).join("\n")}\n`, "utf8");
}

function usageRecord(threadId, turnId, input, output = 10) {
  return {
    type: "token_usage_record",
    payload: {
      thread_id: threadId,
      turn_id: turnId,
      turn_token_usage: {
        input_tokens: input,
        cached_input_tokens: 0,
        output_tokens: output,
        total_tokens: input + output
      },
      thread_token_usage: {
        input_tokens: input,
        cached_input_tokens: 0,
        output_tokens: output,
        total_tokens: input + output
      }
    }
  };
}

function tokenCount(contextWindow) {
  return {
    type: "event_msg",
    payload: {
      type: "token_count",
      info: { model_context_window: contextWindow }
    }
  };
}

test("transcript reader binds counters to the exact Stop turn instead of the newest unrelated turn", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-turn-attribution-"));
  const transcript = path.join(dir, "rollout.jsonl");

  try {
    writeTranscript(transcript, [
      usageRecord("thread-a", "turn-old", 1000),
      tokenCount(111111),
      usageRecord("thread-a", "turn-current", 2000),
      tokenCount(258400)
    ]);

    const usage = readTokenUsageFromTranscript(transcript, {
      expectedThreadId: "thread-a",
      expectedTurnId: "turn-current"
    });

    assert.ok(usage);
    assert.equal(usage.attributionStatus, ATTRIBUTION_MATCHED_TURN);
    assert.equal(usage.last.input_tokens, 2000);
    assert.equal(usage.last.total_tokens, 2010);
    assert.equal(usage.modelContextWindow, 258400);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("transcript reader returns null when current Stop turn has not flushed a tagged token record", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-stale-turn-"));
  const transcript = path.join(dir, "rollout.jsonl");

  try {
    writeTranscript(transcript, [
      usageRecord("thread-a", "turn-previous", 3333),
      tokenCount(258400),
      { type: "event_msg", payload: { type: "agent_message", message: "current turn still active" } }
    ]);

    const usage = readTokenUsageFromTranscript(transcript, {
      expectedThreadId: "thread-a",
      expectedTurnId: "turn-current"
    });

    assert.equal(usage, null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("context window is taken only from the selected turn segment and never from a later turn", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-context-segment-"));
  const transcript = path.join(dir, "rollout.jsonl");

  try {
    writeTranscript(transcript, [
      usageRecord("thread-a", "turn-current", 4444),
      tokenCount(258400),
      { type: "event_msg", payload: { type: "other" } },
      usageRecord("thread-a", "turn-later", 9999),
      tokenCount(999999)
    ]);

    const usage = readTokenUsageFromTranscript(transcript, {
      expectedThreadId: "thread-a",
      expectedTurnId: "turn-current"
    });

    assert.ok(usage);
    assert.equal(usage.last.input_tokens, 4444);
    assert.equal(usage.modelContextWindow, 258400);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("multiple unidentified token records are never guessed between when a Stop turn identity is available", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-unidentified-turns-"));
  const transcript = path.join(dir, "rollout.jsonl");

  try {
    writeTranscript(transcript, [
      {
        type: "token_usage_record",
        payload: { turn_token_usage: { input_tokens: 100, output_tokens: 1, total_tokens: 101 } }
      },
      {
        type: "token_usage_record",
        payload: { turn_token_usage: { input_tokens: 200, output_tokens: 2, total_tokens: 202 } }
      }
    ]);

    const usage = readTokenUsageFromTranscript(transcript, {
      expectedThreadId: "thread-a",
      expectedTurnId: "turn-current"
    });

    assert.equal(usage, null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("duplicate Stop hooks for the same matched turn do not duplicate measurements", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-duplicate-stop-"));
  const transcript = path.join(dir, "rollout.jsonl");

  try {
    writeTranscript(transcript, [
      usageRecord("thread-a", "turn-current", 5000, 50),
      tokenCount(258400)
    ]);

    const config = {
      dir,
      astraModelIds: ["gpt-6-astra"],
      warning: null
    };
    const stop = JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "thread-a",
      turn_id: "turn-current",
      transcript_path: transcript
    });

    runHook(stop, { config });
    runHook(stop, { config });

    const measurements = fs
      .readFileSync(path.join(dir, "measurements.jsonl"), "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    assert.equal(measurements.length, 1);
    assert.equal(measurements[0].attributionStatus, ATTRIBUTION_MATCHED_TURN);
    assert.equal(measurements[0].tokens.input, 5000);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
