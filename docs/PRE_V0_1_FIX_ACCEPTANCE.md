# Pre-v0.1 fix acceptance

The five confirmed audit findings are accepted only when all of the following are true:

- Windows app-server and version probes successfully execute a `.cmd` Codex shim through explicit command-interpreter dispatch.
- Missing Windows launcher and nonzero launcher failures return structured unavailable/error results, not process crashes.
- stdin/stdout/stderr asynchronous errors cannot escape the app-server request settlement path.
- timeout, stream error, child error, protocol error, success, and premature close are single-settlement paths with cleanup.
- readiness cannot return `ready_for_live_hook_capture` when both 5-hour and weekly measurements are unavailable; partial visibility is explicit rather than silently green.
- synchronous version probes have a bounded timeout and do not block diagnostics indefinitely.
- syntactically valid but structurally invalid config JSON, including `null`, produces the existing safe warning/fallback semantics.
- focused regressions pass.
- full unit suite and syntax checks pass.
- Ubuntu, Windows, and macOS CI pass.
- final diff is reviewed for privacy, command injection/quoting, and test weakening.

No live Astra inference is required for acceptance.
