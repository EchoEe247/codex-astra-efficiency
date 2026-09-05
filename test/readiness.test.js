import assert from "node:assert/strict";
import test from "node:test";
import { summarizeAstraReadiness } from "../src/readiness.js";

function catalog(...models) {
  return { data: models };
}

function astra(model = "gpt-6-astra") {
  return {
    id: model,
    model,
    displayName: "Astra",
    hidden: false,
    defaultReasoningEffort: "medium",
    supportedReasoningEfforts: [
      { reasoningEffort: "medium" },
      { reasoningEffort: "high" }
    ]
  };
}

function sharedQuota() {
  return {
    rateLimits: {
      limitId: "codex",
      normalModelSlug: null,
      planType: "plus",
      primary: { usedPercent: 1, windowDurationMins: 300, resetsAt: 1000 },
      secondary: { usedPercent: 82, windowDurationMins: 10080, resetsAt: 2000 }
    },
    rateLimitResetCredits: { availableCount: 2 }
  };
}

test("single Astra candidate reports exact target command before configuration", () => {
  const result = summarizeAstraReadiness({
    modelPayload: catalog(astra()),
    rateLimitPayload: sharedQuota(),
    configuredModelIds: []
  });

  assert.equal(result.status, "target_configuration_required");
  assert.equal(result.candidate.model, "gpt-6-astra");
  assert.equal(result.targetConfigured, false);
  assert.equal(result.authority.kind, "shared_default");
  assert.equal(result.authority.fiveHour.remainingPercent, 99);
  assert.equal(result.authority.weekly.remainingPercent, 18);
  assert.equal(result.resetCreditsAvailable, 2);
  assert.equal(result.nextAction, "cae target set gpt-6-astra");
});

test("configured single Astra candidate becomes ready for live hook capture", () => {
  const result = summarizeAstraReadiness({
    modelPayload: catalog(astra("gpt-6-astra")),
    rateLimitPayload: sharedQuota(),
    configuredModelIds: ["GPT-6-ASTRA"]
  });

  assert.equal(result.status, "ready_for_live_hook_capture");
  assert.equal(result.targetConfigured, true);
  assert.equal(result.authority.status, "selected");
  assert.equal(result.nextAction, "select Astra in native /model and capture live hook identity");
});

test("incomplete native model catalog blocks target authority", () => {
  const result = summarizeAstraReadiness({
    modelPayload: { ...catalog(astra()), nextCursor: "page-2" },
    rateLimitPayload: sharedQuota(),
    configuredModelIds: ["gpt-6-astra"]
  });

  assert.equal(result.status, "model_catalog_incomplete");
  assert.equal(result.discovery.nextCursorPresent, true);
  assert.equal(result.authority.reason, "model_catalog_has_more_pages");
});

test("ambiguous Astra discovery does not choose a target", () => {
  const result = summarizeAstraReadiness({
    modelPayload: catalog(astra("gpt-6-astra"), astra("gpt-6-astra-fast")),
    rateLimitPayload: sharedQuota(),
    configuredModelIds: []
  });

  assert.equal(result.status, "astra_discovery_ambiguous");
  assert.equal(result.discovery.candidates.length, 2);
  assert.equal(result.authority.status, "unavailable");
});

test("missing Astra remains explicit and does not infer availability", () => {
  const result = summarizeAstraReadiness({
    modelPayload: catalog({ model: "gpt-5.6-sol", displayName: "Sol" }),
    rateLimitPayload: sharedQuota(),
    configuredModelIds: []
  });

  assert.equal(result.status, "astra_not_found");
  assert.equal(result.discovery.candidates.length, 0);
});

test("native hook readiness gating regression tests", () => {
  const commonArgs = {
    modelPayload: catalog(astra("gpt-6-astra")),
    rateLimitPayload: sharedQuota(),
    configuredModelIds: ["gpt-6-astra"],
    hookCommand: { available: true }
  };

  // Case 1: readable=true, installed=false -> should fail ready and report native_hooks_not_installed
  const case1 = summarizeAstraReadiness({
    ...commonArgs,
    nativeHooks: { readable: true, installed: false }
  });
  assert.equal(case1.status, "native_hooks_not_installed");
  assert.equal(case1.nextAction, "run cae setup and complete native Codex hook review before live capture");

  // Case 2: readable=false, installed=false -> should report native_hooks_unavailable
  const case2 = summarizeAstraReadiness({
    ...commonArgs,
    nativeHooks: { readable: false, installed: false }
  });
  assert.equal(case2.status, "native_hooks_unavailable");
  assert.equal(case2.nextAction, "repair/read the native Codex hook configuration before live capture");

  // Case 3: readable=true, installed=true -> should be fully ready
  const case3 = summarizeAstraReadiness({
    ...commonArgs,
    nativeHooks: { readable: true, installed: true }
  });
  assert.equal(case3.status, "ready_for_live_hook_capture");
});

test("native hook readiness gating precedence", () => {
  // 1. Target not configured takes precedence over quota unresolved, hook command unavailable, native hooks uninstalled
  const prec1 = summarizeAstraReadiness({
    modelPayload: catalog(astra("gpt-6-astra")),
    rateLimitPayload: { rateLimits: null }, // unresolved
    configuredModelIds: [], // not configured
    hookCommand: { available: false, reason: "hook_command_missing" },
    nativeHooks: { readable: true, installed: false }
  });
  assert.equal(prec1.status, "target_configuration_required");

  // 2. Quota unresolved takes precedence over hook command unavailable, native hooks uninstalled
  const prec2 = summarizeAstraReadiness({
    modelPayload: catalog(astra("gpt-6-astra")),
    rateLimitPayload: { rateLimits: null }, // unresolved
    configuredModelIds: ["gpt-6-astra"], // configured
    hookCommand: { available: false, reason: "hook_command_missing" },
    nativeHooks: { readable: true, installed: false }
  });
  assert.equal(prec2.status, "quota_authority_unresolved");

  // 3. Hook command unavailable takes precedence over native hooks uninstalled/unreadable
  const prec3 = summarizeAstraReadiness({
    modelPayload: catalog(astra("gpt-6-astra")),
    rateLimitPayload: sharedQuota(), // resolved
    configuredModelIds: ["gpt-6-astra"],
    hookCommand: { available: false, reason: "hook_command_missing" },
    nativeHooks: { readable: false, installed: false }
  });
  assert.equal(prec3.status, "hook_command_unavailable");

  // 4. Native hook unreadable takes precedence over native hooks not installed
  const prec4 = summarizeAstraReadiness({
    modelPayload: catalog(astra("gpt-6-astra")),
    rateLimitPayload: sharedQuota(),
    configuredModelIds: ["gpt-6-astra"],
    hookCommand: { available: true },
    nativeHooks: { readable: false, installed: false }
  });
  assert.equal(prec4.status, "native_hooks_unavailable");
});
