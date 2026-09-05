# Pre-v0.1 hardening plan

Status: **F1–F5 FIXED** (PR #18 at merge SHA `32ff3ce4b396d784ca9a03ef143bfbbe187de72a`).

The first public release remains intentionally narrow. All five confirmed runtime findings from the 2026-09-05 Astra audit have been fully resolved, regression-tested, and merged to main prior to final candidate freeze.

## Runtime fixes

- **F1**: Windows Codex `.cmd`/`.bat` launcher dispatch via ComSpec `/d /s /c` for app-server and version reads, preserving native `.exe` and POSIX direct execution.
- **F2**: Child stdio error handling through deterministic single settlement across `stdin`, `stdout`, `stderr`, and `readline` streams.
- **F3**: Readiness gating on usable quota measurements, reporting truthful `quota_measurements_unavailable` and `quota_measurements_degraded` states rather than false green.
- **F4**: Bounded synchronous Codex version probe timeout (`CODEX_VERSION_TIMEOUT_MS = 4000`) and safe status reporting.
- **F5**: Parsed config-shape validation with `config_invalid_shape:<reason>` warning, preserving environment fallback and fail-open hook behavior.

## Validation evidence

- Focused negative controls for each defect: PASS.
- Full `npm test`: PASS (130 tests).
- `npm run check`: PASS.
- `git diff --check`: PASS.
- GitHub Actions CI (PR #18):
  - Ubuntu Node 20: PASS
  - Ubuntu Node 22: PASS
  - Windows Node 22: PASS (real `.cmd` shim e2e test verified)
  - macOS Node 22: PASS
- Zero-inference CLI checks for missing/hanging launcher and malformed config: PASS.

## Release interaction

PR #16 has been reconciled with the hardened main line (`32ff3ce4b396d784ca9a03ef143bfbbe187de72a`). PR #16 remains draft until all release-foundation reviews complete.

Zero Astra model inference or banked resets were spent on these deterministic fixes.
