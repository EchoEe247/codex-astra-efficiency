import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { processHookInput, runHook } from "../src/hook.js";

test("non-Astra model is a strict no-op", () => {
  const result = processHookInput(
    {
      hook_event_name: "UserPromptSubmit",
      model: "gpt-5.6-sol",
      session_id: "s1",
      turn_id: "t1",
      cwd: "/secret/project"
    },
    {
      config: {
        dir: "/tmp/unused",
        astraModelIds: ["gpt-6-astra"],
        warning: null
      }
    }
  );

  assert.equal(result.targeted, false);
  assert.equal(result.observation, null);
  assert.deepEqual(result.response, { continue: true, suppressOutput: true });
});

test("Astra observation excludes raw paths and raw correlation identifiers", () => {
  const result = processHookInput(
    {
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "private-session-id",
      turn_id: "private-turn-id",
      cwd: "/secret/project",
      transcript_path: "/secret/transcript.jsonl",
      permission_mode: "default"
    },
    {
      config: {
        dir: "/tmp/unused",
        astraModelIds: ["gpt-6-astra"],
        warning: null
      },
      observedAt: "2026-09-04T00:00:00.000Z"
    }
  );

  assert.equal(result.targeted, true);
  assert.equal(result.observation.schemaVersion, 2);
  assert.equal(result.observation.cwdPresent, true);
  assert.equal(result.observation.transcriptPresent, true);
  assert.equal(typeof result.observation.sessionKey, "string");
  assert.equal(typeof result.observation.turnKey, "string");
  const serialized = JSON.stringify(result.observation);
  assert.equal(serialized.includes("/secret/project"), false);
  assert.equal(serialized.includes("/secret/transcript"), false);
  assert.equal(serialized.includes("private-session-id"), false);
  assert.equal(serialized.includes("private-turn-id"), false);
});

test("UserPromptSubmit and Stop correlate by stable opaque turn key", () => {
  const config = {
    dir: "/tmp/unused",
    astraModelIds: ["gpt-6-astra"],
    warning: null
  };
  const prompt = processHookInput(
    {
      hook_event_name: "UserPromptSubmit",
      model: "gpt-6-astra",
      session_id: "session-a",
      turn_id: "turn-a"
    },
    { config, observedAt: "2026-09-04T00:00:00.000Z" }
  );
  const stop = processHookInput(
    {
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "session-a",
      turn_id: "turn-a"
    },
    { config, observedAt: "2026-09-04T00:01:00.000Z" }
  );

  assert.equal(prompt.observation.sessionKey, stop.observation.sessionKey);
  assert.equal(prompt.observation.turnKey, stop.observation.turnKey);
});

test("runHook writes only targeted observations", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-test-"));
  const config = {
    dir,
    astraModelIds: ["gpt-6-astra"],
    warning: null
  };

  runHook(
    JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-5.6-sol",
      session_id: "s1",
      turn_id: "t1"
    }),
    { config }
  );

  assert.equal(fs.existsSync(path.join(dir, "events.jsonl")), false);

  runHook(
    JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "s2",
      turn_id: "t2"
    }),
    {
      config,
      observedAt: "2026-09-04T00:00:00.000Z"
    }
  );

  const lines = fs
    .readFileSync(path.join(dir, "events.jsonl"), "utf8")
    .trim()
    .split("\n");

  assert.equal(lines.length, 1);
  const stored = JSON.parse(lines[0]);
  assert.equal(stored.model, "gpt-6-astra");
  assert.equal(stored.sessionId, undefined);
  assert.equal(stored.turnId, undefined);
});

test("runHook passively extracts token usage on Stop when transcript is present", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-hook-meas-"));
  const transcriptPath = path.join(dir, "rollout-sample.jsonl");

  const lines = [
    JSON.stringify({
      type: "token_usage_record",
      payload: {
        thread_id: "th-01",
        turn_id: "tu-01",
        turn_token_usage: {
          input_tokens: 5000,
          cached_input_tokens: 4000,
          output_tokens: 200,
          reasoning_output_tokens: 50,
          total_tokens: 5200
        },
        thread_token_usage: {
          input_tokens: 10000,
          cached_input_tokens: 8000,
          output_tokens: 500,
          total_tokens: 10500
        }
      }
    }),
    JSON.stringify({
      type: "event_msg",
      payload: {
        type: "token_count",
        info: {
          model_context_window: 258400
        }
      }
    })
  ];
  fs.writeFileSync(transcriptPath, lines.join("\n") + "\n", "utf8");

  const config = {
    dir,
    astraModelIds: ["gpt-6-astra"],
    warning: null
  };

  runHook(
    JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "th-01",
      turn_id: "tu-01",
      transcript_path: transcriptPath
    }),
    { config }
  );

  const measFile = path.join(dir, "measurements.jsonl");
  assert.equal(fs.existsSync(measFile), true);
  const measLines = fs.readFileSync(measFile, "utf8").trim().split("\n");
  assert.equal(measLines.length, 1);

  const parsed = JSON.parse(measLines[0]);
  assert.equal(parsed.model, "gpt-6-astra");
  assert.equal(parsed.tokens.input, 5000);
  assert.equal(parsed.tokens.cachedInput, 4000);
  assert.equal(parsed.tokens.output, 200);
  assert.equal(parsed.tokens.reasoningOutput, 50);
  assert.equal(parsed.tokens.total, 5200);
  assert.equal(parsed.tokens.processedVolume, 5200);
  assert.equal(parsed.tokens.cacheLeverage, 0.8);
  assert.equal(parsed.context.window, 258400);

  // Privacy: transcriptPath and raw IDs MUST NOT appear
  assert.equal(measLines[0].includes(transcriptPath), false);
  assert.equal(measLines[0].includes("th-01"), false);
  assert.equal(measLines[0].includes("tu-01"), false);
});

test("runHook fails open when transcript is missing or unreadable", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-hook-meas-failopen-"));
  const config = {
    dir,
    astraModelIds: ["gpt-6-astra"],
    warning: null
  };

  assert.doesNotThrow(() => {
    runHook(
      JSON.stringify({
        hook_event_name: "Stop",
        model: "gpt-6-astra",
        session_id: "th-01",
        turn_id: "tu-01",
        transcript_path: "/nonexistent/path/impossible.jsonl"
      }),
      { config }
    );
  });

  // Observation written, measurement gracefully omitted
  assert.equal(fs.existsSync(path.join(dir, "events.jsonl")), true);
  assert.equal(fs.existsSync(path.join(dir, "measurements.jsonl")), false);
});
