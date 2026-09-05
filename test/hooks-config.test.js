import test from "node:test";
import assert from "node:assert/strict";
import {
  CAE_HOOK_COMMAND,
  installCaeHooks,
  parseHooksConfig,
  uninstallCaeHooks
} from "../src/hooks-config.js";

test("install adds CAE hooks without disturbing existing hooks", () => {
  const input = {
    hooks: {
      UserPromptSubmit: [
        {
          matcher: "existing",
          hooks: [{ type: "command", command: "existing-hook" }]
        }
      ],
      SessionStart: [{ hooks: [{ type: "command", command: "session-hook" }] }]
    },
    other: { keep: true }
  };

  const output = installCaeHooks(input);
  assert.equal(input.hooks.UserPromptSubmit[0].hooks[0].command, "existing-hook");
  assert.equal(output.hooks.UserPromptSubmit.length, 2);
  assert.equal(output.hooks.UserPromptSubmit[1].hooks[0].command, CAE_HOOK_COMMAND);
  assert.equal(output.hooks.Stop[0].hooks[0].command, CAE_HOOK_COMMAND);
  assert.equal(output.hooks.SessionStart[0].hooks[0].command, "session-hook");
  assert.deepEqual(output.other, { keep: true });
});

test("install is idempotent", () => {
  const once = installCaeHooks({});
  const twice = installCaeHooks(once);
  assert.deepEqual(twice, once);
});

test("uninstall removes only CAE-owned handlers and preserves mixed groups", () => {
  const input = {
    hooks: {
      UserPromptSubmit: [
        {
          matcher: "mixed",
          hooks: [
            { type: "command", command: CAE_HOOK_COMMAND },
            { type: "command", command: "keep-me" }
          ]
        },
        { hooks: [{ type: "command", command: CAE_HOOK_COMMAND }] }
      ],
      Stop: [{ hooks: [{ type: "command", command: CAE_HOOK_COMMAND }] }],
      SessionStart: [{ hooks: [{ type: "command", command: "other" }] }]
    }
  };

  const output = uninstallCaeHooks(input);
  assert.equal(output.hooks.UserPromptSubmit.length, 1);
  assert.equal(output.hooks.UserPromptSubmit[0].matcher, "mixed");
  assert.equal(output.hooks.UserPromptSubmit[0].hooks[0].command, "keep-me");
  assert.equal("Stop" in output.hooks, false);
  assert.equal(output.hooks.SessionStart[0].hooks[0].command, "other");
});

test("malformed existing event array is rejected instead of overwritten", () => {
  assert.throws(
    () => installCaeHooks({ hooks: { Stop: {} } }),
    /must be an array/
  );
});

test("parseHooksConfig accepts empty content as an empty config", () => {
  assert.deepEqual(parseHooksConfig(""), {});
});

test("uninstall preserves unrelated empty groups and event arrays", () => {
  const input = {
    custom: { keep: true },
    hooks: {
      UserPromptSubmit: [{ matcher: "reserved", hooks: [], custom: "keep" }],
      Stop: [{ hooks: [] }]
    }
  };

  const emptyEvents = { hooks: { UserPromptSubmit: [], Stop: [] } };
  assert.deepEqual(uninstallCaeHooks(emptyEvents), emptyEvents);
  assert.deepEqual(uninstallCaeHooks(input), input);
  const installed = installCaeHooks(input);
  assert.deepEqual(installCaeHooks(installed), installed);
  const removed = uninstallCaeHooks(installed);
  assert.deepEqual(removed, input);
  assert.deepEqual(uninstallCaeHooks(removed), input);
  assert.deepEqual(uninstallCaeHooks(installCaeHooks(removed)), input);
});
