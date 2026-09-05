# Current v0.1 release blockers

As of 2026-09-05, final v0.1 runtime candidate freeze is blocked on five confirmed correctness/reliability findings from the latest Astra audit of commit `bae14cebc1858c4f602a5f2cf46a2428ccf932f7`:

1. Windows `.cmd` Codex launcher dispatch.
2. Child stdio error settlement / broken-pipe handling.
3. False-green readiness when quota windows are unavailable.
4. Unbounded synchronous Codex version probe.
5. Invalid parsed config shapes crashing load.

These are narrow deterministic fixes. They should be resolved with focused regressions and cross-platform CI without spending additional Astra allowance or a banked reset.

The release-foundation documentation/community PR may continue in parallel, but must be reconciled onto the hardened runtime before final v0.1 candidate freeze.
