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
