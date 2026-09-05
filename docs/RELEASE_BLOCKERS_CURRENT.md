# Current v0.1 release blockers

Status: **F1–F5 FIXED** (PR #18 at merge SHA `32ff3ce4b396d784ca9a03ef143bfbbe187de72a`).

The five confirmed correctness/reliability findings from the 2026-09-05 Astra audit of commit `bae14cebc1858c4f602a5f2cf46a2428ccf932f7` have all been resolved, regression-covered, and verified in cross-platform CI:

1. **F1 — Windows `.cmd` Codex launcher dispatch**: Fixed via explicit `ComSpec /d /s /c` dispatch for `.cmd`/`.bat` files with safe argument preservation; native Windows binaries (`.exe`) and POSIX binaries retain direct execution. Verified end-to-end on real `.cmd` shim in Windows CI.
2. **F2 — Child stdio error settlement / broken-pipe handling**: Fixed via unified `settle()` routing for `stdin`, `stdout`, `stderr`, and `readline.Interface` error events with sanitized structured error codes (`codex_app_server_stream_failed:<stream>:<code/reason>`), guaranteed single settlement, and clean process teardown.
3. **F3 — False-green readiness with no quota windows**: Fixed by separating quota authority resolution from measurement window visibility. Implemented explicit states (`quota_measurements_unavailable`, `quota_measurements_degraded`, and `ready_for_live_hook_capture`) with structured detail for five-hour visibility, weekly visibility, and delta-readiness.
4. **F4 — Unbounded synchronous Codex version probe**: Fixed with bounded timeout (`CODEX_VERSION_TIMEOUT_MS = 4000`) in `probeCodexVersion()`, returning deterministic unavailable results and surfacing `codexVersionStatus` (`ok`, `timeout`, `spawn_error`, `nonzero_exit`, `signal`).
5. **F5 — Invalid parsed config shapes crashing load**: Fixed by validating parsed JSON structure before dereference in `loadConfig()`, rejecting corrupt shapes (`null`, `[]`, primitives, invalid `astraModelIds` types) with `config_invalid_shape:<reason>` warnings while preserving `CAE_ASTRA_MODEL_IDS` environment fallback and fail-open hook behavior.

## Evidence & Verification
- Pull Request: #18 (`Harden pre-v0.1 Codex runtime failure paths`)
- Merge SHA: `32ff3ce4b396d784ca9a03ef143bfbbe187de72a`
- Full CI Matrix Green:
  - Ubuntu Node 20: PASS
  - Ubuntu Node 22: PASS
  - Windows Node 22: PASS (real `.cmd` launcher tests PASS)
  - macOS Node 22: PASS
- Model Inference: Zero additional Codex model inference used.
- Reset Credits: 2 remaining; banked resets untouched; Window 1 not started.
