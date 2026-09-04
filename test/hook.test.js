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
