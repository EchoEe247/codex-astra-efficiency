# Changelog

All notable user-facing changes to Codex Astra Efficiency (CAE) are recorded here.

## [Unreleased]

### Added

- Public install/setup/readiness/uninstall documentation.
- Contributor and security-review policies for the early public repository.
- Native Astra/Plus measurement foundations for 5-hour and weekly windows.
- Privacy-safe `UserPromptSubmit` and `Stop` observations using opaque correlation keys.
- Cross-platform CLI/test coverage on Ubuntu, Windows, and macOS.

### Fixed

- Quota authority changes now include native `limitId` stability.
- Readiness now requires both a callable CAE hook command and installed/readable native CAE hooks.
- Windows hook-command discovery/probing supports target-platform path semantics and npm `.cmd`/`.bat` shims.
- App-server spawn failures and timeouts settle cleanly instead of crashing or hanging the CLI.
- Unknown reset boundaries no longer produce misleading measured allowance deltas.
- Uninstall preserves unrelated Codex hook groups/handlers and cleans up only after actual CAE-owned handler removal.

### Security / privacy

- CAE does not persist raw prompts, responses, source code, cwd paths, account identity, or raw native session/turn ids in its observation events.
- Hook failures remain fail-open so CAE does not block productive Codex turns.

## [0.1.0] — planned

The first public release will prioritize trustworthy Astra observability, safe native-Codex integration, clean setup/uninstall, and truthful documentation. It will not claim a fixed percentage of quota savings or a validated default efficiency intervention unless the final release evidence supports one.