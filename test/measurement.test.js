import assert from "node:assert/strict";
import test from "node:test";
import {
  measurementCoverage,
  normalizeCompletionEvidence,
  normalizeRunDescriptor
} from "../src/measurement.js";

test("normalizes coarse Astra run descriptors without project content", () => {
  const descriptor = normalizeRunDescriptor({
    plan: " plus ",
    reasoningEffort: "medium",
    serviceTier: "standard",
    taskClass: "cross-system-debugging",
    projectScale: "large",
    continuity: "continuation",
    contextBucket: "large"
  });

  assert.deepEqual(descriptor, {
    plan: "plus",
    reasoningEffort: "medium",
    serviceTier: "standard",
    taskClass: "cross-system-debugging",
    projectScale: "large",
    continuity: "continuation",
    contextBucket: "large"
  });
  assert.equal(JSON.stringify(descriptor).includes("repo"), false);
});

test("completion evidence preserves unknown instead of guessing", () => {
  const evidence = normalizeCompletionEvidence({
    requestedObjectiveCompleted: true,
    validationStatus: "tests-pass",
    humanInterventions: 1,
    subagentCount: 0,
    toolClasses: ["shell", "tests", "shell", "browser"],
    scopeExpanded: false,
    reworkNeeded: null,
    workDisposition: "implementation"
  });

  assert.deepEqual(evidence, {
    requestedObjectiveCompleted: true,
    validationStatus: "tests-pass",
    humanInterventions: 1,
    subagentCount: 0,
    toolClasses: ["shell", "tests", "browser"],
    scopeExpanded: false,
    reworkNeeded: null,
    workDisposition: "implementation"
  });
});

test("invalid counts and non-boolean judgments become unknown", () => {
  const evidence = normalizeCompletionEvidence({
    requestedObjectiveCompleted: "yes",
    humanInterventions: -1,
    subagentCount: 1.5,
    scopeExpanded: "no"
  });

  assert.equal(evidence.requestedObjectiveCompleted, null);
  assert.equal(evidence.humanInterventions, null);
  assert.equal(evidence.subagentCount, null);
  assert.equal(evidence.scopeExpanded, null);
});

test("measurement coverage never claims efficiency from metadata alone", () => {
  const descriptor = normalizeRunDescriptor({
    plan: "plus",
    reasoningEffort: "high",
    taskClass: "bounded-implementation"
  });
  const evidence = normalizeCompletionEvidence({
    requestedObjectiveCompleted: true,
    humanInterventions: 0,
    toolClasses: ["code-edit", "tests"]
  });

  const coverage = measurementCoverage({ descriptor, evidence });
  assert.deepEqual(coverage.descriptorKnown, ["plan", "reasoningEffort", "taskClass"]);
  assert.deepEqual(coverage.evidenceKnown, [
    "requestedObjectiveCompleted",
    "humanInterventions",
    "toolClasses"
  ]);
  assert.equal(coverage.sufficientForEfficiencyClaim, false);
});
