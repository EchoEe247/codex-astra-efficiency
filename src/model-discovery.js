function stringContainsAstra(value) {
  if (typeof value !== "string") return false;
  return /(^|[^a-z0-9])astra([^a-z0-9]|$)/i.test(value);
}

function reasoningEfforts(model) {
  if (!Array.isArray(model?.supportedReasoningEfforts)) return [];
  return model.supportedReasoningEfforts
    .map((entry) => entry?.reasoningEffort)
    .filter((value) => typeof value === "string" && value.length > 0);
}

export function astraCandidatesFromCatalog(payload) {
  if (!payload || !Array.isArray(payload.data)) return [];

  const byModel = new Map();
  for (const entry of payload.data) {
    if (!entry || typeof entry !== "object") continue;
    if (entry.hidden === true) continue;
    if (
      !stringContainsAstra(entry.model) &&
      !stringContainsAstra(entry.displayName) &&
      !stringContainsAstra(entry.id)
    ) {
      continue;
    }
    if (typeof entry.model !== "string" || !entry.model.trim()) continue;

    const model = entry.model.trim();
    if (!byModel.has(model)) {
      byModel.set(model, {
        model,
        id: typeof entry.id === "string" ? entry.id : null,
        displayName: typeof entry.displayName === "string" ? entry.displayName : null,
        hidden: Boolean(entry.hidden),
        isDefault: Boolean(entry.isDefault),
        defaultReasoningEffort:
          typeof entry.defaultReasoningEffort === "string" ? entry.defaultReasoningEffort : null,
        supportedReasoningEfforts: reasoningEfforts(entry)
      });
    }
  }

  return [...byModel.values()];
}

/**
 * Discovery is intentionally advisory. Even a single candidate is not silently
 * activated until CAE has runtime evidence that the native picker reports the
 * same exact model id in hook input.
 */
export function summarizeAstraDiscovery(payload) {
  const candidates = astraCandidatesFromCatalog(payload);
  return {
    status: candidates.length === 0 ? "not_found" : candidates.length === 1 ? "single_candidate" : "ambiguous",
    candidates,
    catalogCount: Array.isArray(payload?.data) ? payload.data.length : 0,
    nextCursorPresent: typeof payload?.nextCursor === "string" && payload.nextCursor.length > 0
  };
}
