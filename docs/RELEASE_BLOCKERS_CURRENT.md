# v0.1 Release Blocker Closure Record

Status: **HISTORICAL — all F1–F5 fixed before the public `v0.1.0` release.**

This file used to be the current blocker list during pre-release hardening. `v0.1.0` has since been published, so these findings are preserved as release evidence rather than present-tense blockers.

The five confirmed correctness/reliability findings from the 2026-09-05 Astra audit of commit `bae14cebc1858c4f602a5f2cf46a2428ccf932f7` were resolved, regression-covered, and verified in cross-platform CI:

1. **F1 — Windows `.cmd` Codex launcher dispatch** — fixed with explicit `ComSpec` dispatch for `.cmd`/`.bat` launchers while native executables and POSIX binaries retain direct execution. Real `.cmd` behavior was covered in Windows CI.
2. **F2 — Child stdio error settlement / broken-pipe handling** — fixed through unified settlement for stdin/stdout/stderr/readline errors, sanitized structured failure codes, single settlement, and clean teardown.
3. **F3 — False-green readiness with no quota windows** — fixed by separating quota-authority resolution from measurement-window visibility and exposing degraded/unavailable readiness states instead of false success.
4. **F4 — Unbounded synchronous Codex version probe** — fixed with a bounded version timeout and deterministic unavailable/error states.
5. **F5 — Invalid parsed config shapes crashing load** — fixed by validating parsed JSON structure before dereference while preserving environment fallback and fail-open hook behavior.

## Release evidence

- Pull Request: #18 — `Harden pre-v0.1 Codex runtime failure paths`
- Merge SHA: `32ff3ce4b396d784ca9a03ef143bfbbe187de72a`
- Ubuntu Node 20: PASS
- Ubuntu Node 22: PASS
- Windows Node 22: PASS, including real `.cmd` launcher tests
- macOS Node 22: PASS
- Additional model inference for these fixes: zero

For current project state, use `trackers/STATE.md`. For current runtime compatibility, use `docs/CODEX_COMPATIBILITY.md`.