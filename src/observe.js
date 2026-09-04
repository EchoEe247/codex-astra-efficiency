import crypto from "node:crypto";

function opaqueKey(namespace, value) {
  if (typeof value !== "string" || !value) return null;
  return crypto
    .createHash("sha256")
    .update(`cae-observation-v1:${namespace}:`, "utf8")
    .update(value, "utf8")
    .digest("hex");
}

export function safeObservation(input, observedAt = new Date().toISOString()) {
  return {
    schemaVersion: 2,
    observedAt,
    event: typeof input?.hook_event_name === "string" ? input.hook_event_name : "unknown",
    model: typeof input?.model === "string" ? input.model : null,
    sessionKey: opaqueKey("session", input?.session_id),
    turnKey: opaqueKey("turn", input?.turn_id),
    permissionMode: typeof input?.permission_mode === "string" ? input.permission_mode : null,
    subagent: typeof input?.agent_id === "string" && input.agent_id.length > 0,
    cwdPresent: typeof input?.cwd === "string" && input.cwd.length > 0,
    transcriptPresent:
      typeof input?.transcript_path === "string" && input.transcript_path.length > 0
  };
}
