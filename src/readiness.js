import { parseModelIds } from "./config.js";
import { HOOK_COMMAND_UNAVAILABLE } from "./hook-command.js";
import { summarizeAstraDiscovery } from "./model-discovery.js";
import { normalizeRateLimitResponse, selectUsageAuthority } from "./rate-limits.js";

function sameModel(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function summarizeAuthority(authority) {
  if (!authority || typeof authority !== "object") {
    return { status: "unavailable", reason: "missing_authority" };
  }
  if (authority.status !== "selected") {
    return {
      status: authority.status ?? "unavailable",
      reason: authority.reason ?? null,
      candidateKeys: Array.isArray(authority.candidateKeys) ? authority.candidateKeys : undefined,
      defaultModelSlug: authority.defaultModelSlug ?? undefined
    };
  }

  return {
    status: "selected",
    kind: authority.kind,
    key: authority.key,
    limitId: authority.limitId ?? null,
    normalModelSlug: authority.normalModelSlug ?? null,
    fiveHour: authority.snapshot?.fiveHour ?? { status: "not_reported" },
    weekly: authority.snapshot?.weekly ?? { status: "not_reported" }
  };
}

/**
 * Summarize the zero-inference state needed immediately before a live Astra
 * hook check. This function never mutates CAE configuration or Codex state.
 */
export function summarizeAstraReadiness({
  modelPayload,
  rateLimitPayload,
  configuredModelIds = [],
  hookCommand = null,
  nativeHooks = null
} = {}) {
  const discovery = summarizeAstraDiscovery(modelPayload);
  const quota = normalizeRateLimitResponse(rateLimitPayload);
  const configured = parseModelIds(configuredModelIds);

  // A later catalog page could contain another Astra entry and change a
  // single candidate into an ambiguous result, so an incomplete catalog is
  // never sufficient authority for target configuration.
  if (discovery.nextCursorPresent) {
    return {
      status: "model_catalog_incomplete",
      discovery,
      configuredModelIds: configured,
      resetCreditsAvailable: quota.resetCreditsAvailable,
      authority: { status: "unavailable", reason: "model_catalog_has_more_pages" },
      nextAction: "read the complete native model catalog before configuring Astra"
    };
  }

  if (discovery.status === "not_found") {
    return {
      status: "astra_not_found",
      discovery,
      configuredModelIds: configured,
      resetCreditsAvailable: quota.resetCreditsAvailable,
      authority: { status: "unavailable", reason: "astra_not_found" }
    };
  }

  if (discovery.status === "ambiguous") {
    return {
      status: "astra_discovery_ambiguous",
      discovery,
      configuredModelIds: configured,
      resetCreditsAvailable: quota.resetCreditsAvailable,
      authority: { status: "unavailable", reason: "multiple_astra_candidates" }
    };
  }

  const candidate = discovery.candidates[0];
  const targetConfigured = configured.some((model) => sameModel(model, candidate.model));
  const authority = summarizeAuthority(selectUsageAuthority(quota, candidate.model));

  let status = "ready_for_live_hook_capture";
  if (!targetConfigured) status = "target_configuration_required";
  else if (authority.status !== "selected") status = "quota_authority_unresolved";
  else if (hookCommand && hookCommand.available !== true) {
    status = HOOK_COMMAND_UNAVAILABLE;
  } else if (nativeHooks && nativeHooks.readable !== true) {
    status = "native_hooks_unavailable";
  } else if (nativeHooks && nativeHooks.installed !== true) {
    status = "native_hooks_not_installed";
  }

  const result = {
    status,
    candidate,
    targetConfigured,
    configuredModelIds: configured,
    resetCreditsAvailable: quota.resetCreditsAvailable,
    authority,
    nextAction:
      status === "target_configuration_required"
        ? `cae target set ${candidate.model}`
        : status === "ready_for_live_hook_capture"
          ? "select Astra in native /model and capture live hook identity"
          : status === HOOK_COMMAND_UNAVAILABLE
            ? "repair the CAE hook command installation before live capture"
            : status === "native_hooks_unavailable"
              ? "repair/read the native Codex hook configuration before live capture"
              : status === "native_hooks_not_installed"
                ? "run cae setup and complete native Codex hook review before live capture"
                : "resolve quota authority before interpreting Astra usage deltas"
  };
  if (hookCommand !== null) result.hookCommand = hookCommand;
  if (nativeHooks !== null) result.nativeHooks = nativeHooks;
  return result;
}
