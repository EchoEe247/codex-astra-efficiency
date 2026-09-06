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

test("permissions: on POSIX, state directory and written files enforce restricted modes", {
  skip: process.platform === "win32"
}, () => {
  const tmpParent = fs.mkdtempSync(path.join(os.tmpdir(), "cae-perm-test-"));
  const dir = path.join(tmpParent, "state-subdir");
  const transcriptPath = path.join(tmpParent, "rollout.jsonl");

  fs.writeFileSync(
    transcriptPath,
    JSON.stringify({
      type: "token_usage_record",
      payload: {
        turn_token_usage: {
          input_tokens: 100,
          cached_input_tokens: 50,
          output_tokens: 20,
          total_tokens: 120
        }
      }
    }) + "\n"
  );

  const config = {
    dir,
    astraModelIds: ["gpt-6-astra"],
    warning: null
  };

  runHook(
    JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "s-perm",
      turn_id: "t-perm",
      transcript_path: transcriptPath
    }),
    { config }
  );

  const dirStat = fs.statSync(dir);
  const eventsStat = fs.statSync(path.join(dir, "events.jsonl"));
  const measStat = fs.statSync(path.join(dir, "measurements.jsonl"));

  assert.equal(dirStat.mode & 0o077, 0, "state dir should not be group/world accessible");
  assert.equal(eventsStat.mode & 0o077, 0, "events.jsonl should not be group/world readable");
  assert.equal(measStat.mode & 0o077, 0, "measurements.jsonl should not be group/world readable");

  fs.rmSync(tmpParent, { recursive: true, force: true });
});

test("config/env: processHookInput and runHook respect options.env CAE_ASTRA_MODEL_IDS override", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-env-test-"));
  const env = {
    CAE_STATE_DIR: dir,
    CAE_ASTRA_MODEL_IDS: "custom-astra-preview,gpt-6-astra-experiment"
  };

  const nonMatch = processHookInput(
    { hook_event_name: "UserPromptSubmit", model: "gpt-6-astra" },
    { env }
  );
  assert.equal(nonMatch.targeted, false);

  const match = processHookInput(
    { hook_event_name: "UserPromptSubmit", model: "custom-astra-preview" },
    { env }
  );
  assert.equal(match.targeted, true);
  assert.equal(match.config.dir, dir);

  runHook(
    JSON.stringify({
      hook_event_name: "UserPromptSubmit",
      model: "custom-astra-preview",
      session_id: "s-env",
      turn_id: "t-env"
    }),
    { env }
  );

  assert.equal(fs.existsSync(path.join(dir, "events.jsonl")), true);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("bounded transcript reader: extracts token usage from large transcript tail", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-large-transcript-"));
  const transcriptPath = path.join(dir, "rollout-large.jsonl");

  const fd = fs.openSync(transcriptPath, "w");
  const paddingChunk = Buffer.from(JSON.stringify({ type: "tool_output", payload: { data: "x".repeat(1000) } }) + "\n");
  for (let i = 0; i < 3500; i++) {
    fs.writeSync(fd, paddingChunk);
  }
  const tokenLine = Buffer.from(JSON.stringify({
    type: "token_usage_record",
    payload: {
      turn_token_usage: {
        input_tokens: 42000,
        cached_input_tokens: 30000,
        output_tokens: 500,
        total_tokens: 42500
      }
    }
  }) + "\n");
  fs.writeSync(fd, tokenLine);
  fs.closeSync(fd);

  const stat = fs.statSync(transcriptPath);
  assert.ok(stat.size > 3 * 1024 * 1024, "transcript size must exceed 3 MiB");

  const config = {
    dir,
    astraModelIds: ["gpt-6-astra"],
    warning: null
  };

  runHook(
    JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "s-large",
      turn_id: "t-large",
      transcript_path: transcriptPath
    }),
    { config }
  );

  const measLines = fs.readFileSync(path.join(dir, "measurements.jsonl"), "utf8").trim().split("\n");
  assert.equal(measLines.length, 1);
  const parsed = JSON.parse(measLines[0]);
  assert.equal(parsed.tokens.input, 42000);
  assert.equal(parsed.tokens.cachedInput, 30000);
  assert.equal(parsed.tokens.output, 500);

  fs.rmSync(dir, { recursive: true, force: true });
});

test("bounded transcript reader: token record before scan bound returns null and is not guessed", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-bound-exceeded-"));
  const transcriptPath = path.join(dir, "rollout-bound-exceeded.jsonl");

  const fd = fs.openSync(transcriptPath, "w");
  const tokenLine = Buffer.from(JSON.stringify({
    type: "token_usage_record",
    payload: {
      turn_token_usage: {
        input_tokens: 99999,
        cached_input_tokens: 0,
        output_tokens: 10,
        total_tokens: 100009
      }
    }
  }) + "\n");
  fs.writeSync(fd, tokenLine);

  const paddingChunk = Buffer.from(JSON.stringify({ type: "dummy_event", text: "z".repeat(1000) }) + "\n");
  for (let i = 0; i < 2800; i++) {
    fs.writeSync(fd, paddingChunk);
  }
  fs.closeSync(fd);

  const config = {
    dir,
    astraModelIds: ["gpt-6-astra"],
    warning: null
  };

  runHook(
    JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "s-exceeded",
      turn_id: "t-exceeded",
      transcript_path: transcriptPath
    }),
    { config }
  );

  assert.equal(fs.existsSync(path.join(dir, "events.jsonl")), true);
  assert.equal(fs.existsSync(path.join(dir, "measurements.jsonl")), false);

  fs.rmSync(dir, { recursive: true, force: true });
});

test("bounded transcript reader: directory path, empty file, and malformed trailing lines fail open", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-edge-cases-"));

  const dirResult = runHook(
    JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "s-dir",
      turn_id: "t-dir",
      transcript_path: dir
    }),
    { config: { dir, astraModelIds: ["gpt-6-astra"] } }
  );
  assert.deepEqual(dirResult, { continue: true, suppressOutput: true });

  const emptyPath = path.join(dir, "empty.jsonl");
  fs.writeFileSync(emptyPath, "");
  runHook(
    JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "s-empty",
      turn_id: "t-empty",
      transcript_path: emptyPath
    }),
    { config: { dir, astraModelIds: ["gpt-6-astra"] } }
  );

  const malformedPath = path.join(dir, "malformed-tail.jsonl");
  const content = [
    JSON.stringify({
      type: "token_usage_record",
      payload: {
        turn_token_usage: { input_tokens: 777, cached_input_tokens: 0, output_tokens: 33, total_tokens: 810 }
      }
    }),
    "{ truncated invalid json line",
    ""
  ].join("\n");
  fs.writeFileSync(malformedPath, content);

  runHook(
    JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "s-malformed",
      turn_id: "t-malformed",
      transcript_path: malformedPath
    }),
    { config: { dir, astraModelIds: ["gpt-6-astra"] } }
  );

  const measLines = fs.readFileSync(path.join(dir, "measurements.jsonl"), "utf8").trim().split("\n");
  assert.equal(measLines.length, 1);
  assert.equal(JSON.parse(measLines[0]).tokens.input, 777);

  fs.rmSync(dir, { recursive: true, force: true });
});

test("bounded transcript reader: sensitive prompt/repo/secret content in transcript never leaks to measurement", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-secret-leak-test-"));
  const transcriptPath = path.join(dir, "rollout-secrets.jsonl");

  const lines = [
    JSON.stringify({
      type: "user_message",
      text: "SUPER_SECRET_API_KEY_xyz123987 and password_hunter2 and https://github.com/secret/repo.git"
    }),
    JSON.stringify({
      type: "token_usage_record",
      payload: {
        turn_token_usage: {
          input_tokens: 1500,
          cached_input_tokens: 1000,
          output_tokens: 50,
          total_tokens: 1550
        }
      }
    })
  ];
  fs.writeFileSync(transcriptPath, lines.join("\n") + "\n");

  runHook(
    JSON.stringify({
      hook_event_name: "Stop",
      model: "gpt-6-astra",
      session_id: "s-secret",
      turn_id: "t-secret",
      transcript_path: transcriptPath
    }),
    { config: { dir, astraModelIds: ["gpt-6-astra"] } }
  );

  const measRaw = fs.readFileSync(path.join(dir, "measurements.jsonl"), "utf8");
  assert.equal(measRaw.includes("SUPER_SECRET_API_KEY"), false);
  assert.equal(measRaw.includes("hunter2"), false);
  assert.equal(measRaw.includes("secret/repo"), false);
  assert.equal(measRaw.includes(transcriptPath), false);

  fs.rmSync(dir, { recursive: true, force: true });
});
