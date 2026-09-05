# Pre-v0.1 Astra audit — 2026-09-05

Status: **confirmed findings / remediation required before v0.1 candidate freeze**

This audit was run against runtime commit `bae14cebc1858c4f602a5f2cf46a2428ccf932f7` with `gpt-6-astra` at low reasoning. The release-foundation PR is documentation/community work only, so these runtime findings also apply to that release line until fixed.

## Confirmed findings

1. **P1 — Windows default Codex launcher dispatch**
   - `resolveCodexCommand()` returns `codex.cmd` on Windows.
   - `requestLocalCodex()` currently passes that command directly to `spawn()` without a Windows command interpreter.
   - `codexVersion()` likewise uses direct `spawnSync()`.
   - `.cmd`/`.bat` launchers require explicit Windows command-interpreter handling.
   - **Release disposition:** blocker for claimed Windows runtime compatibility.

2. **P2 — Child stream errors are not settled**
   - Child-process `error` is handled, but stdin/stdout/stderr stream errors are not all routed through the request settlement path.
   - An asynchronous stdin `EPIPE` can escape normal CAE error handling.
   - **Release disposition:** fix before v0.1 reliability freeze.

3. **P2 — Readiness can approve an authority with no usable windows**
   - Authority selection can succeed while both normalized 5-hour and weekly windows are `not_reported`.
   - The current readiness summary gates on authority selection but not usable measurement windows.
   - **Release disposition:** fix before v0.1 because readiness must not overstate measurement readiness.

4. **P2 — Synchronous version probe has no timeout**
   - `codexVersion()` uses `spawnSync()` without a timeout.
   - A stalled launcher can block `doctor`, `readiness`, and related diagnostics indefinitely.
   - **Release disposition:** add a bounded timeout and deterministic unavailable result.

5. **P2 — Parsed config shape is not validated before dereference**
   - Valid JSON such as `null` can escape the JSON parse try/catch and then fail at `fileConfig.astraModelIds`.
   - **Release disposition:** validate the parsed config as an object and use the existing warning/fallback semantics for invalid shapes.

## Required remediation standard

- Add focused negative-control tests for all five findings.
- Preserve fail-safe/unknown semantics; do not guess quota state.
- Windows `.cmd` dispatch must be explicit and safely argumentized.
- Stream and timeout failures must settle once, clean up best-effort, and never crash/hang the CLI.
- Readiness must distinguish full measurement readiness from degraded/unavailable quota visibility.
- Invalid config shapes must return a warning/fallback rather than crash diagnostics or hooks.
- Run the full local suite, syntax check, and cross-platform CI before replacing the release candidate.

No efficiency/savings claim is affected by this audit; these are correctness/reliability fixes.
