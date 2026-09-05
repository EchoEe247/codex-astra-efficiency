# Pre-v0.1 hardening plan

The first public release remains intentionally narrow. The five confirmed runtime findings from the 2026-09-05 Astra audit are the current correctness/reliability hardening queue. They should be resolved before final v0.1 candidate freeze; unrelated analytics and optimization work should not expand this gate.

## Runtime fixes

- Windows Codex `.cmd` launcher dispatch for app-server and version reads.
- Child stdio error handling through deterministic single settlement.
- Readiness gating on usable quota measurements, with explicit degraded/unavailable status rather than false green.
- Bounded synchronous Codex version probe timeout.
- Parsed config-shape validation with warning/fallback behavior.

## Validation

- Focused negative controls for each defect.
- Full `npm test`.
- `npm run check`.
- `git diff --check`.
- Ubuntu Node 20/22 CI.
- Windows Node 22 CI including a real `.cmd` shim path.
- macOS Node 22 CI.
- Zero-inference CLI checks for missing/hanging launcher and malformed config.

## Release interaction

PR #16 remains the documentation/community release foundation. Runtime hardening should land independently, after which PR #16 can be rebased/updated onto the hardened main line before final candidate freeze.

Do not spend Astra or a banked reset to fix these deterministic issues.
