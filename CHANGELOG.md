# Changelog

All notable user-facing changes to Codex Astra Efficiency (CAE) are recorded here.

## [Unreleased]

Future patch/minor changes will be recorded here after the first public release.

## [0.1.0] — 2026-09-05

First public early release. v0.1.0 focuses on trustworthy Astra observability, safe native-Codex integration, clean setup/uninstall, and truthful documentation. It does not claim a fixed percentage of quota savings or a validated default efficiency intervention.

### Added

- Public install/setup/readiness/uninstall documentation.
- Contributor and security-review policies for the early public repository.
- Native Astra/Plus measurement foundations for 5-hour and weekly windows.
- Privacy-safe `UserPromptSubmit` and `Stop` observations using opaque correlation keys.
- Cross-platform CLI/test coverage on Ubuntu, Windows, and macOS.

### Fixed

- Windows `.cmd`/`.bat` Codex launcher execution uses explicit ComSpec `/d /s /c` dispatch with safe argument preservation, while native Windows binaries and POSIX executables retain direct process execution (F1).
- Child process stdin/stdout/stderr and readline error paths route deterministically through unified single-settlement logic with sanitized error codes (F2).
- Readiness gates on truthful quota measurement visibility, distinguishing `quota_measurements_unavailable` and `quota_measurements_degraded` from full readiness (F3).
- Synchronous Codex version probe is bounded by a documented timeout (`CODEX_VERSION_TIMEOUT_MS = 4000`) and reports structured `codexVersionStatus` (F4).
- Config loading strictly validates parsed JSON object shape before dereference, preserving environment fallback and fail-open hook behavior (F5).
- Quota authority changes now include native `limitId` stability.
- Readiness now requires both a callable CAE hook command and installed/readable native CAE hooks.
- Windows hook-command discovery/probing supports target-platform path semantics and npm `.cmd`/`.bat` shims.
- App-server spawn failures and timeouts settle cleanly instead of crashing or hanging the CLI.
- Unknown reset boundaries no longer produce misleading measured allowance deltas.
- Uninstall preserves unrelated Codex hook groups/handlers and cleans up only after actual CAE-owned handler removal.

### Security / privacy

- CAE does not persist raw prompts, responses, source code, cwd paths, account identity, or raw native session/turn ids in its observation events.
- Hook failures remain fail-open so CAE does not block productive Codex turns.

### Deferred beyond v0.1.0

- Native per-turn token accounting and automatic task classification.
- Richer usage analytics/dashboards.
- Evidence-backed default efficiency interventions.
- Native Termux Codex support pending its separate compatibility lane.
