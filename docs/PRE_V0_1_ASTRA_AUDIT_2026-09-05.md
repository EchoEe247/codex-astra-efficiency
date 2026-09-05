# Pre-v0.1 Astra audit — 2026-09-05

Status: **F1–F5 FIXED** (PR #18 at merge SHA `32ff3ce4b396d784ca9a03ef143bfbbe187de72a`).

This audit was run against runtime commit `bae14cebc1858c4f602a5f2cf46a2428ccf932f7` with `gpt-6-astra` at low reasoning. All five confirmed runtime findings have been resolved, regression-covered, and verified in cross-platform CI via PR #18.

## Confirmed findings and resolutions

1. **P1 — Windows default Codex launcher dispatch (F1)**
   - **Finding:** `.cmd`/`.bat` launchers require explicit Windows command-interpreter handling. Direct `spawn(command, args)` failed to launch `.cmd` shims on Windows.
   - **Resolution:** Added `prepareProcessInvocation()` with explicit `ComSpec /d /s /c` dispatch for `.cmd`/`.bat` shims while keeping direct process execution for native Windows binaries (`.exe`) and POSIX binaries. Verified on real `.cmd` shims under Windows CI.

2. **P2 — Child stream errors are not settled (F2)**
   - **Finding:** Child `stdin`, `stdout`, and `stderr` stream errors (such as async `EPIPE`) could escape without settlement and cause unhandled process errors.
   - **Resolution:** Attached comprehensive error handlers across `stdin`, `stdout`, `stderr`, and `readline.Interface` streams, routing all errors through the single `settle()` path with sanitized error codes (`codex_app_server_stream_failed:<stream>:<code/reason>`), guaranteed single rejection, timer cleanup, and child termination.

3. **P2 — Readiness can approve an authority with no usable windows (F3)**
   - **Finding:** Authority selection could succeed while both normalized 5-hour and weekly windows were `not_reported`, producing false-green readiness.
   - **Resolution:** Separated authority resolution from measurement readiness in `summarizeAstraReadiness()`. Implemented explicit `quota_measurements_unavailable` and `quota_measurements_degraded` states with structured detail for 5h visibility, weekly visibility, and delta-readiness.

4. **P2 — Synchronous version probe has no timeout (F4)**
   - **Finding:** `codexVersion()` called `spawnSync()` without a timeout, allowing a hung launcher to block diagnostics indefinitely.
   - **Resolution:** Added `probeCodexVersion()` bounded by `CODEX_VERSION_TIMEOUT_MS = 4000`, returning deterministic unavailable results (`codex: null`) and exposing structured `codexVersionStatus` (`ok`, `timeout`, `spawn_error`, `nonzero_exit`, `signal`).

5. **P2 — Parsed config shape is not validated before dereference (F5)**
   - **Finding:** Valid JSON such as `null` escaped the JSON parse try/catch and crashed on dereference of `fileConfig.astraModelIds`.
   - **Resolution:** Validated parsed JSON object shape before dereferencing. Corrupt shapes (`null`, `[]`, primitives, invalid `astraModelIds` types) emit `config_invalid_shape:<reason>` warnings, preserve `CAE_ASTRA_MODEL_IDS` environment fallback, and fail-open in hook processing.

## Validation summary
- Full test suite: 130 tests passing.
- `npm run check`: clean.
- Cross-platform CI (Ubuntu 20, Ubuntu 22, Windows 22, macOS 22): all green.
- Zero additional model inference or banked resets spent.
