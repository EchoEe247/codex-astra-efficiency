export function safeObservation(input, observedAt = new Date().toISOString()) {
  return {
    schemaVersion: 1,
    observedAt,
    event: typeof input?.hook_event_name === "string" ? input.hook_event_name : "unknown",
    model: typeof input?.model === "string" ? input.model : null,
    sessionId: typeof input?.session_id === "string" ? input.session_id : null,
    turnId: typeof input?.turn_id === "string" ? input.turn_id : null,
    permissionMode: typeof input?.permission_mode === "string" ? input.permission_mode : null,
    cwdPresent: typeof input?.cwd === "string" && input.cwd.length > 0,
    transcriptPresent:
      typeof input?.transcript_path === "string" && input.transcript_path.length > 0
  };
}
