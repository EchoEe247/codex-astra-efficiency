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

test("Astra observation excludes raw cwd and transcript paths", () => {
  const result = processHookInput(
    {
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "s1",
      turn_id: "t1",
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
  assert.equal(result.observation.cwdPresent, true);
  assert.equal(result.observation.transcriptPresent, true);
  assert.equal(JSON.stringify(result.observation).includes("/secret/project"), false);
  assert.equal(JSON.stringify(result.observation).includes("/secret/transcript"), false);
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
  assert.equal(JSON.parse(lines[0]).model, "gpt-6-astra");
});
