# Project State

Last updated: 2026-09-04

## Current phase

**FOUNDATION / PRE-ASTRA VALIDATION**

The repository is private while the core integration and test methodology are established.

## Locked product direction

- ChatGPT Plus first.
- Codex first.
- Astra only.
- Everyday Codex users through professional developers are the primary audience.
- Native Codex workflow must remain recognizable and simple.
- Users select Astra through the normal Codex model picker.
- CAE must not manage or modify behavior for non-Astra models.
- Core v0.x does not silently route Astra work to cheaper models.
- Efficiency means reducing avoidable Astra burn while preserving useful real work.
- Observe-only baseline precedes optimization.
- 5-hour and weekly windows are separate authorities when exposed.
- Missing rate-limit data is unknown, never guessed.
- Local-first privacy is mandatory.

## Technical findings so far

Current upstream Codex source provides a promising native integration path:

- hook events include `UserPromptSubmit` and `Stop`;
- current hook schemas expose the active `model` on those turn-scoped events;
- `UserPromptSubmit` can optionally return additional context;
- Codex app-server exposes `account/rateLimits/read` and rolling limit updates;
- the app-server wire protocol is newline-delimited JSON objects and intentionally omits the JSON-RPC `jsonrpc` field;
- current initialize parameters use `clientInfo` plus optional capabilities;
- current rate-limit responses expose window duration, used percent, reset time, plan type, multi-bucket data, ordinary-usage permission, and optional reset-credit summaries.

These upstream findings are source-level reconnaissance until reproduced against an installed Codex release.

## Implemented foundation

- Exact configured Astra model targeting with strict non-Astra no-op behavior.
- Fail-open hook handler and privacy-minimal local Astra observation events.
- Non-destructive hook merge/removal primitives with idempotence tests.
- `cae doctor` and local event inspection.
- Short-lived local Codex app-server quota client and `cae quota` command, pending real installed-Codex validation.
- Duration-based 300-minute / 10,080-minute normalization without assuming `primary` or `secondary` semantics.
- First-class `not_reported`, `partial`, `malformed`, and `conflicting` rate-limit states.
- Reset-aware snapshot delta calculation that refuses to call reset-crossing or non-monotonic changes usage burn.
- Fixture coverage for complete, missing-5h, missing-weekly, partial, malformed, and contradictory responses.
- Privacy-minimal local run-receipt primitives with start/end quota snapshots, duration, outcome, optional intervention count, and reset-aware usage deltas.
- Receipt normalization intentionally excludes raw account IDs from the persisted path.
- Prior-art authority in `docs/PRIOR_ART.md` documenting adjacent quota/usage/optimization projects and CAE's narrower product boundary.

## Immediate execution queue

1. Prove native Codex hook execution against a real installed Codex build.
2. Prove native model-picker selection reaches the hook as the exact active model identifier.
3. Prove strict non-Astra no-op behavior in that real runtime.
4. Run `cae quota` against the signed-in Plus account and capture the actual app-server response shape and Codex version.
5. Verify whether quota reads coexist cleanly with a normal active Codex session.
6. Add any observed response variants as fixtures; do not weaken unknown/conflict handling.
7. Validate clean setup/disable/uninstall ownership of actual user configuration.
8. Bind receipt start/end capture to validated native Astra turn boundaries without adding a new user workflow.
9. Wait for actual Astra availability before enabling Astra-specific optimization claims.
10. Run the real-work Plus baseline immediately when Astra becomes available.

## Research posture

Adjacent projects already cover general quota overlays, Codex usage analytics, multi-provider spend tracking, and broad workflow optimization. CAE remains focused on the still-distinct intersection of Plus + Astra + native Codex + real-work efficiency. See `docs/PRIOR_ART.md`.

## Explicitly deferred

- Work support.
- General Codex model optimization.
- Luna/Sol/Terra routing.
- Multi-provider orchestration.
- Cloud telemetry.
- Dashboard/UI work.
- Automatic public receipt upload.
- Advanced agent framework features.

## Release posture

Public v0.1 should ship as soon as the evidence gate is satisfied after Astra reaches Plus. If the measured optimizations are not yet trustworthy, a clean observability-first release is preferable to unvalidated efficiency claims.
