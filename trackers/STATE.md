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
- app-server exposes turn completion/token information.

These findings are source-level reconnaissance only until reproduced against an installed Codex release.

## Immediate execution queue

1. Build a minimal safe Codex hook proof.
2. Prove native model-picker selection reaches the hook as a model identifier.
3. Prove strict non-Astra no-op behavior.
4. Validate clean setup/uninstall ownership of configuration.
5. Prove authoritative Plus rate-limit snapshot access without browser-cookie scraping or auth changes.
6. Define fixture-backed rate-limit normalization.
7. Build local receipt storage.
8. Create `cae doctor` around the validated integration surface.
9. Wait for actual Astra availability before enabling Astra-specific optimization claims.
10. Run the real-work Plus baseline immediately when Astra becomes available.

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
