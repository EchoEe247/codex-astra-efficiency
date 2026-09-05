export const FIVE_HOUR_WINDOW_MINS = 300;
export const WEEKLY_WINDOW_MINS = 10080;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asNullableInteger(value) {
  return Number.isInteger(value) ? value : null;
}

function normalizeModelId(value) {
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null;
}

function normalizeCredits(raw) {
  if (raw === null || raw === undefined) return { status: "not_reported" };
  if (!isObject(raw)) return { status: "malformed", reason: "credits_not_object" };

  if (typeof raw.hasCredits !== "boolean" || typeof raw.unlimited !== "boolean") {
    return { status: "malformed", reason: "invalid_credit_flags" };
  }
  if (raw.balance !== null && raw.balance !== undefined && typeof raw.balance !== "string") {
    return { status: "malformed", reason: "invalid_credit_balance" };
  }

  return {
    status: "reported",
    hasCredits: raw.hasCredits,
    unlimited: raw.unlimited,
    balance: typeof raw.balance === "string" ? raw.balance : null
  };
}

function normalizeWindow(raw, slot, source) {
  if (raw === null || raw === undefined) return null;
  if (!isObject(raw)) {
    return {
      status: "malformed",
      slot,
      source,
      reason: "window_not_object"
    };
  }

  const durationMins = asNullableInteger(raw.windowDurationMins);
  const resetsAt = raw.resetsAt === null ? null : asNullableInteger(raw.resetsAt);
  const usedPercent = asNullableInteger(raw.usedPercent);

  if (usedPercent === null || usedPercent < 0 || usedPercent > 100) {
    return {
      status: "malformed",
      slot,
      source,
      durationMins,
      resetsAt,
      reason: "invalid_used_percent"
    };
  }

  if (raw.resetsAt !== null && raw.resetsAt !== undefined && resetsAt === null) {
    return {
      status: "malformed",
      slot,
      source,
      durationMins,
      usedPercent,
      reason: "invalid_resets_at"
    };
  }

  if (
    raw.windowDurationMins !== null &&
    raw.windowDurationMins !== undefined &&
    (durationMins === null || durationMins <= 0)
  ) {
    return {
      status: "malformed",
      slot,
      source,
      usedPercent,
      resetsAt,
      reason: "invalid_window_duration"
    };
  }

  return {
    status: "reported",
    slot,
    source,
    durationMins,
    usedPercent,
    remainingPercent: 100 - usedPercent,
    resetsAt
  };
}

function candidateSignature(candidate) {
  if (candidate.status !== "reported") {
    return JSON.stringify([
      candidate.status,
      candidate.durationMins ?? null,
      candidate.usedPercent ?? null,
      candidate.resetsAt ?? null,
      candidate.reason ?? null
    ]);
  }
  return JSON.stringify([
    candidate.durationMins,
    candidate.usedPercent,
    candidate.resetsAt
  ]);
}

function classifyWindow(candidates, durationMins) {
  const matching = candidates.filter((candidate) => candidate.durationMins === durationMins);
  if (matching.length === 0) return { status: "not_reported", durationMins };

  const malformed = matching.filter((candidate) => candidate.status !== "reported");
  const reported = matching.filter((candidate) => candidate.status === "reported");
  const uniqueReported = [...new Map(reported.map((item) => [candidateSignature(item), item])).values()];

  if (uniqueReported.length > 1) {
    return {
      status: "conflicting",
      durationMins,
      candidates: uniqueReported
    };
  }

  if (uniqueReported.length === 1 && malformed.length === 0) {
    const item = uniqueReported[0];
    return {
      status: "reported",
      durationMins,
      usedPercent: item.usedPercent,
      remainingPercent: item.remainingPercent,
      resetsAt: item.resetsAt,
      observedSlots: [...new Set(reported.map((candidate) => candidate.slot))]
    };
  }

  if (uniqueReported.length === 1) {
    return {
      status: "partial",
      durationMins,
      usedPercent: uniqueReported[0].usedPercent,
      remainingPercent: uniqueReported[0].remainingPercent,
      resetsAt: uniqueReported[0].resetsAt,
      malformedCandidates: malformed
    };
  }

  return {
    status: "malformed",
    durationMins,
    candidates: malformed
  };
}

export function normalizeRateLimitSnapshot(snapshot, source = "rateLimits") {
  if (!isObject(snapshot)) {
    return {
      status: "not_reported",
      source,
      credits: { status: "not_reported" },
      fiveHour: { status: "not_reported", durationMins: FIVE_HOUR_WINDOW_MINS },
      weekly: { status: "not_reported", durationMins: WEEKLY_WINDOW_MINS },
      unclassified: [],
      malformed: []
    };
  }

  const windows = [
    normalizeWindow(snapshot.primary, "primary", source),
    normalizeWindow(snapshot.secondary, "secondary", source)
  ].filter(Boolean);

  const malformed = windows.filter((window) => window.status === "malformed");
  const unclassified = windows.filter(
    (window) =>
      window.durationMins !== FIVE_HOUR_WINDOW_MINS &&
      window.durationMins !== WEEKLY_WINDOW_MINS
  );

  return {
    status: "reported",
    source,
    limitId: typeof snapshot.limitId === "string" ? snapshot.limitId : null,
    limitName: typeof snapshot.limitName === "string" ? snapshot.limitName : null,
    normalModelSlug:
      typeof snapshot.normalModelSlug === "string" ? snapshot.normalModelSlug : null,
    planType: typeof snapshot.planType === "string" ? snapshot.planType : null,
    credits: normalizeCredits(snapshot.credits),
    ordinaryUsageFields: {
      rateLimitReachedType:
        typeof snapshot.rateLimitReachedType === "string" ? snapshot.rateLimitReachedType : null,
      spendControlReached:
        typeof snapshot.spendControlReached === "boolean" ? snapshot.spendControlReached : null
    },
    fiveHour: classifyWindow(windows, FIVE_HOUR_WINDOW_MINS),
    weekly: classifyWindow(windows, WEEKLY_WINDOW_MINS),
    unclassified,
    malformed
  };
}

export function normalizeRateLimitResponse(payload) {
  if (!isObject(payload)) {
    return {
      status: "malformed",
      reason: "response_not_object",
      default: normalizeRateLimitSnapshot(null),
      buckets: {},
      ordinaryUsageAllowed: null,
      resetCreditsAvailable: null
    };
  }

  const buckets = {};
  if (isObject(payload.rateLimitsByLimitId)) {
    for (const [key, snapshot] of Object.entries(payload.rateLimitsByLimitId)) {
      buckets[key] = normalizeRateLimitSnapshot(snapshot, `rateLimitsByLimitId.${key}`);
    }
  }

  const resetCreditsAvailable = Number.isInteger(payload.rateLimitResetCredits?.availableCount)
    ? payload.rateLimitResetCredits.availableCount
    : null;

  return {
    status: isObject(payload.rateLimits) ? "reported" : "partial",
    default: normalizeRateLimitSnapshot(payload.rateLimits),
    buckets,
    ordinaryUsageAllowed:
      typeof payload.ordinaryUsageAllowed === "boolean" ? payload.ordinaryUsageAllowed : null,
    resetCreditsAvailable
  };
}

/**
 * Select the best quota authority for one exact native model id.
 *
 * Prefer a single bucket whose `normalModelSlug` exactly names the model. If
 * no model-specific bucket exists, a default snapshot with no model slug is
 * treated as shared account allowance. Never guess from limit names.
 */
export function selectUsageAuthority(response, model) {
  const target = normalizeModelId(model);
  if (!target || !isObject(response)) {
    return { status: "unavailable", reason: "missing_model_or_response" };
  }

  const exactBuckets = Object.entries(response.buckets ?? {}).filter(([, snapshot]) => {
    return normalizeModelId(snapshot?.normalModelSlug) === target;
  });

  if (exactBuckets.length > 1) {
    return {
      status: "ambiguous",
      reason: "multiple_model_specific_buckets",
      candidateKeys: exactBuckets.map(([key]) => key)
    };
  }

  if (exactBuckets.length === 1) {
    const [key, snapshot] = exactBuckets[0];
    return {
      status: "selected",
      kind: "model_bucket",
      key,
      limitId: snapshot.limitId ?? null,
      normalModelSlug: snapshot.normalModelSlug ?? null,
      snapshot
    };
  }

  const fallback = response.default;
  if (!fallback || fallback.status !== "reported") {
    return { status: "unavailable", reason: "default_not_reported" };
  }

  const fallbackModel = normalizeModelId(fallback.normalModelSlug);
  if (fallbackModel && fallbackModel !== target) {
    return {
      status: "unavailable",
      reason: "default_targets_other_model",
      defaultModelSlug: fallback.normalModelSlug
    };
  }

  return {
    status: "selected",
    kind: fallbackModel ? "model_default" : "shared_default",
    key: "default",
    limitId: fallback.limitId ?? null,
    normalModelSlug: fallback.normalModelSlug ?? null,
    snapshot: fallback
  };
}

export function calculateWindowDelta(start, end) {
  if (start?.status !== "reported" || end?.status !== "reported") {
    return { status: "unavailable" };
  }

  if (start.durationMins !== end.durationMins) {
    return { status: "incompatible_window" };
  }

  if (
    start.resetsAt !== null &&
    end.resetsAt !== null &&
    start.resetsAt !== end.resetsAt
  ) {
    return {
      status: "reset_boundary",
      startUsedPercent: start.usedPercent,
      endUsedPercent: end.usedPercent
    };
  }

  const usedPercentDelta = end.usedPercent - start.usedPercent;
  if (usedPercentDelta < 0) {
    return {
      status: "non_monotonic",
      startUsedPercent: start.usedPercent,
      endUsedPercent: end.usedPercent
    };
  }

  return {
    status: "measured",
    usedPercentDelta,
    startUsedPercent: start.usedPercent,
    endUsedPercent: end.usedPercent
  };
}

export function calculateDefaultUsageDelta(startResponse, endResponse) {
  return {
    fiveHour: calculateWindowDelta(startResponse?.default?.fiveHour, endResponse?.default?.fiveHour),
    weekly: calculateWindowDelta(startResponse?.default?.weekly, endResponse?.default?.weekly)
  };
}

/**
 * Calculate allowance movement against a stable model-aware authority.
 * A change from shared/default to a model-specific bucket is recorded as an
 * authority change rather than silently combining different meters.
 */
export function calculateModelUsageDelta(startResponse, endResponse, model) {
  const startAuthority = selectUsageAuthority(startResponse, model);
  const endAuthority = selectUsageAuthority(endResponse, model);

  if (startAuthority.status !== "selected" || endAuthority.status !== "selected") {
    const reason =
      startAuthority.status === "ambiguous" || endAuthority.status === "ambiguous"
        ? "ambiguous_authority"
        : "unavailable_authority";
    return {
      authority: {
        status: reason,
        start: { ...startAuthority, snapshot: undefined },
        end: { ...endAuthority, snapshot: undefined }
      },
      fiveHour: { status: "unavailable" },
      weekly: { status: "unavailable" }
    };
  }

  if (
    startAuthority.kind !== endAuthority.kind ||
    startAuthority.key !== endAuthority.key ||
    startAuthority.limitId !== endAuthority.limitId
  ) {
    return {
      authority: {
        status: "authority_changed",
        start: {
          kind: startAuthority.kind,
          key: startAuthority.key,
          limitId: startAuthority.limitId,
          normalModelSlug: startAuthority.normalModelSlug
        },
        end: {
          kind: endAuthority.kind,
          key: endAuthority.key,
          limitId: endAuthority.limitId,
          normalModelSlug: endAuthority.normalModelSlug
        }
      },
      fiveHour: { status: "unavailable" },
      weekly: { status: "unavailable" }
    };
  }

  return {
    authority: {
      status: "stable",
      kind: startAuthority.kind,
      key: startAuthority.key,
      limitId: startAuthority.limitId,
      normalModelSlug: startAuthority.normalModelSlug
    },
    fiveHour: calculateWindowDelta(
      startAuthority.snapshot.fiveHour,
      endAuthority.snapshot.fiveHour
    ),
    weekly: calculateWindowDelta(startAuthority.snapshot.weekly, endAuthority.snapshot.weekly)
  };
}
