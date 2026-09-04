const MAX_LABEL = 80;
const MAX_TOOL_CLASSES = 16;

function optionalLabel(value, max = MAX_LABEL) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function optionalBoolean(value) {
  return typeof value === "boolean" ? value : null;
}

function optionalCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function stringList(values, { maxItems = MAX_TOOL_CLASSES, maxLength = 48 } = {}) {
  if (!Array.isArray(values)) return [];
  const normalized = values
    .map((value) => optionalLabel(value, maxLength))
    .filter(Boolean);
  return [...new Set(normalized)].slice(0, maxItems);
}

/**
 * Normalize only coarse, privacy-safe run descriptors.
 *
 * This intentionally does not accept prompts, code, repository names, file
 * paths, transcript contents, or account identifiers. It exists so CAE can
 * compare Astra allowance burn against task shape without changing the native
 * Codex workflow or collecting project content.
 */
export function normalizeRunDescriptor({
  plan = null,
  reasoningEffort = null,
  serviceTier = null,
  taskClass = null,
  projectScale = null,
  continuity = null,
  contextBucket = null
} = {}) {
  return {
    plan: optionalLabel(plan, 32),
    reasoningEffort: optionalLabel(reasoningEffort, 32),
    serviceTier: optionalLabel(serviceTier, 32),
    taskClass: optionalLabel(taskClass) ?? "unclassified",
    projectScale: optionalLabel(projectScale, 32),
    continuity: optionalLabel(continuity, 32),
    contextBucket: optionalLabel(contextBucket, 32)
  };
}

/**
 * Normalize post-run evidence without pretending that CAE can infer task value
 * automatically. These values should be filled only when Codex exposes them
 * reliably or the user/test campaign records them deliberately.
 */
export function normalizeCompletionEvidence({
  requestedObjectiveCompleted = null,
  validationStatus = null,
  humanInterventions = null,
  subagentCount = null,
  toolClasses = [],
  scopeExpanded = null,
  reworkNeeded = null,
  workDisposition = null
} = {}) {
  return {
    requestedObjectiveCompleted: optionalBoolean(requestedObjectiveCompleted),
    validationStatus: optionalLabel(validationStatus, 48),
    humanInterventions: optionalCount(humanInterventions),
    subagentCount: optionalCount(subagentCount),
    toolClasses: stringList(toolClasses),
    scopeExpanded: optionalBoolean(scopeExpanded),
    reworkNeeded: optionalBoolean(reworkNeeded),
    workDisposition: optionalLabel(workDisposition, 48)
  };
}

/**
 * Report what the receipt actually knows. Missing evidence remains missing;
 * CAE must not manufacture an efficiency score from sparse observations.
 */
export function measurementCoverage({ descriptor = {}, evidence = {} } = {}) {
  const descriptorKeys = [
    "plan",
    "reasoningEffort",
    "serviceTier",
    "taskClass",
    "projectScale",
    "continuity",
    "contextBucket"
  ];
  const evidenceKeys = [
    "requestedObjectiveCompleted",
    "validationStatus",
    "humanInterventions",
    "subagentCount",
    "scopeExpanded",
    "reworkNeeded",
    "workDisposition"
  ];

  const knownDescriptor = descriptorKeys.filter((key) => {
    const value = descriptor[key];
    return value !== null && value !== undefined && value !== "unclassified";
  });
  const knownEvidence = evidenceKeys.filter((key) => {
    const value = evidence[key];
    return value !== null && value !== undefined;
  });
  if (Array.isArray(evidence.toolClasses) && evidence.toolClasses.length > 0) {
    knownEvidence.push("toolClasses");
  }

  return {
    descriptorKnown: knownDescriptor,
    evidenceKnown: knownEvidence,
    sufficientForEfficiencyClaim: false
  };
}
