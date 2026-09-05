# Pre-v0.1 fix acceptance

Status: **F1–F5 FIXED AND ACCEPTED** (PR #18 at merge SHA `32ff3ce4b396d784ca9a03ef143bfbbe187de72a`).

All acceptance criteria for the five confirmed audit findings have been met:

- [x] **Windows `.cmd` execution**: Windows app-server and version probes successfully execute `.cmd` Codex shims through explicit command-interpreter dispatch (`ComSpec /d /s /c`). Verified in Windows CI runner.
- [x] **Error resilience**: Missing Windows launcher and nonzero launcher failures return structured unavailable/error results, not process crashes.
- [x] **Stream error settlement**: `stdin`/`stdout`/`stderr`/`readline` asynchronous errors cannot escape the app-server request settlement path; all route through unified `settle()`.
- [x] **Single settlement**: Timeout, stream error, child error, protocol error, success, and premature close are single-settlement paths with guaranteed cleanup and no uncaught process errors.
- [x] **Truthful readiness**: Readiness cannot return `ready_for_live_hook_capture` when quota measurements are unavailable; partial visibility reports `quota_measurements_degraded` with structured measurement details.
- [x] **Bounded version probe**: Synchronous version probes are bounded by `CODEX_VERSION_TIMEOUT_MS = 4000` and do not block diagnostics indefinitely.
- [x] **Config shape validation**: Syntactically valid but structurally invalid config JSON, including `null`, `[]`, primitives, and invalid `astraModelIds` types, produces safe `config_invalid_shape:<reason>` warnings and preserves `CAE_ASTRA_MODEL_IDS` environment fallback.
- [x] **Focused regressions**: All 130 unit tests pass.
- [x] **Syntax check**: `npm run check` passes.
- [x] **Cross-platform CI**: Ubuntu 20, Ubuntu 22, Windows 22 (with real `.cmd` shim tests), and macOS 22 all pass.
- [x] **Security review**: Clean review for privacy, command injection/quoting, and lack of sensitive data leakage.

Zero live Astra inference or banked resets were spent for acceptance.
