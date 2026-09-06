# Project State

Last updated: **2026-09-06**

This is the current-state entry point for Codex Astra Efficiency. Detailed Window 0, release-candidate, and pre-v0.1 evidence remains under `receipts/` and the dated documents in `docs/`; those records should not be mistaken for the current project phase simply because they are more detailed.

## Current release

- **Latest public release:** `v0.1.0`
- **Release published:** 2026-09-05
- **Release target commit:** `29cb39eb136ed09ad2a3f2e40319a749bc568de1`
- **Package:** `codex-astra-efficiency@0.1.0`
- **GitHub release artifact:** `codex-astra-efficiency-0.1.0.tgz`
- **Release posture:** public, observability-first, no fixed Astra-savings claim

The installed release-candidate path passed live end-to-end validation before publication. The v0.1 release sign-off evidence remains in `docs/RELEASE_CRITERIA.md`, `docs/V0_1_LIVE_RC_VALIDATION.md`, and the corresponding receipts.

## Current phase

**POST-v0.1 MAINTENANCE / PASSIVE MEASUREMENT DEVELOPMENT**

The first public release established the native-Codex integration, truthful Plus-window visibility, privacy-safe hook observations, safe setup/uninstall ownership, strict non-Astra no-op behavior, and the supported runtime boundary.

The next direction is not to manufacture a bigger feature list. It is to learn from genuine Astra work, expand native token/accounting evidence, and only promote efficiency interventions after they survive useful-work validation.

### Active post-release work

PR #22, `Add passive native token-accounting foundation`, is open on `post-v0.1/token-accounting-foundation`.

Current PR disposition at this state update:

- deterministic local token-accounting foundation implemented;
- privacy-safe numeric capture and local measurement storage implemented on the branch;
- cross-platform CI reported green for the branch evidence;
- first genuine passive sample recorded;
- **not ready to merge yet** — the hardened Stop-hook extraction is waiting for the next genuine passive Astra maintenance sample before merge.

This work advances post-v0.1 measurement. It does not retroactively change what `v0.1.0` claims.

## Locked product direction

- ChatGPT Plus first.
- Codex first.
- Astra only.
- Everyday Codex users through professional developers are the primary audience.
- Preserve native Codex model selection and normal agent workflow.
- CAE remains a strict no-op for non-Astra models.
- Core v0.x does not silently route Astra work to cheaper models.
- Efficiency means reducing avoidable Astra burn while preserving useful real work.
- Product-first testing: test CAE with Astra while doing real CAE/project work rather than benchmarking Astra in isolation.
- 5-hour and weekly windows stay separate measurements.
- Missing or ambiguous quota state stays unknown.
- Local-first privacy is mandatory.

## Current compatibility authority

### Validated v0.1 campaign runtime

- runtime: `codexu` / Ubuntu-under-Termux;
- release-campaign Codex version: `0.153.2`;
- exact Astra model id: `gpt-6-astra`;
- display name: `GPT-6-Astra`;
- observed native default reasoning: `low`;
- observed Plus quota authority: `shared_default` / `default` / `limitId=codex`.

A different Codex version is **unverified**, not automatically unsupported. Current compatibility rules live in `docs/CODEX_COMPATIBILITY.md`.

### Native Termux disposition

Issue #9 is **closed / not planned** with the disposition:

> unsupported under the current upstream Android distribution

Zero-inference validation on a Pixel 6a with Codex CLI `0.153.4` showed that native Android arm64 resolves to the `aarch64-unknown-linux-musl` binary. Local commands and cached model discovery can work, but the validated native Termux environment cannot complete the external network reads CAE needs for authoritative Plus quota/readiness because the observed musl resolver path expects `/etc/resolv.conf`.

CAE fails truthfully in that environment: diagnostics can partially work, quota remains unavailable rather than zero, and readiness blocks Astra use.

`codexu` remains the supported Android path. A PRoot/Ubuntu wrapper is a `codexu`-style compatibility path, not native-Termux support.

Reconsider native support only if upstream changes the Android runtime/distribution contract enough for normal external Codex networking without PRoot or equivalent substitution.

## v0.1.0 validated boundaries

The public release evidence established:

- normal native Codex launch and `/model` selection;
- exact Astra targeting;
- strict live non-Astra no-op behavior;
- authoritative 5-hour and weekly window handling when exposed;
- reset-boundary refusal rather than invented burn;
- real `UserPromptSubmit` and `Stop` capture;
- opaque privacy-safe correlation;
- local-only default observation storage;
- setup/uninstall idempotence and CAE-owned cleanup;
- fail-open hook behavior;
- Ubuntu, Windows, and macOS CI coverage;
- installed-artifact live validation through `codexu`;
- no quota bypass/reset automation;
- no fixed percentage-savings claim.

## Historical campaign/evidence map

The pre-release campaign is intentionally kept as evidence instead of being rewritten into current state:

- `docs/ASTRA_WINDOW_0_SHAKEDOWN.md`
- `docs/ASTRA_PLUS_TEST_PLAN.md`
- `docs/WINDOW0_MINIMAL_LIVE_REVALIDATION.md`
- `docs/WINDOW0_TASK1_CONTRACT.md`
- `docs/WINDOW0_TASK2_CONTRACT.md`
- `docs/WINDOW1_CANDIDATE_FREEZE.md`
- `docs/PRE_V0_1_ASTRA_AUDIT_2026-09-05.md`
- `docs/PRE_V0_1_HARDENING_PLAN.md`
- `docs/PRE_V0_1_FIX_ACCEPTANCE.md`
- `docs/V0_1_LIVE_RC_VALIDATION.md`
- `docs/RELEASE_DECISIONS_V0_1.md`
- `docs/RELEASE_CRITERIA.md`
- `receipts/`

Those files can contain language such as `before release`, `Window 0`, `Window 1`, `READY_FOR_PUBLICATION`, or old candidate SHAs because they document the path to `v0.1.0`. They are not the authority for whether the release is public today.

## Explicitly deferred / separate lanes

- native Termux support unless upstream runtime conditions change;
- Work support;
- general Codex model optimization;
- Luna/Sol/Terra routing;
- multi-provider orchestration;
- cloud telemetry;
- dashboard/UI work;
- automatic public receipt upload;
- advanced agent-framework features.

## Current authority order

For present-tense questions, use:

1. current GitHub release/PR/issue/repository state;
2. `trackers/STATE.md`;
3. `docs/CODEX_COMPATIBILITY.md`, `docs/INSTALL.md`, `docs/PRODUCT_CHARTER.md`, and `docs/MEASUREMENT_MODEL.md` for their owned surfaces;
4. exact dated receipts for the historical claim they tested;
5. pre-release plans, shakedowns, and old chat context.

Unknown stays unknown, and historical evidence stays historical.