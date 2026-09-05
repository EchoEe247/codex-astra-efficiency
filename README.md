# Codex Astra Efficiency

**Use Astra normally in Codex. Waste less of your Plus allowance.**

Codex Astra Efficiency (CAE) is a lightweight, Astra-specific efficiency layer for ChatGPT Plus users working in Codex.

The project has one product constraint above all others:

> **Codex should still feel like Codex.**

Users should keep the normal Codex experience: open Codex, select Astra from the normal model picker, give it real work, and let the agent operate normally. CAE exists to make that Astra usage more observable and, where validated, more efficient without turning Codex into a new agent framework.

## Scope

CAE is intentionally narrow.

- **Plan:** ChatGPT Plus first.
- **Surface:** Codex first.
- **Model:** Astra only.
- **Users:** everyday Codex users through professional developers.
- **Workload:** real software work, including substantial and long-running tasks.
- **Goal:** increase useful completed work per unit of Astra allowance by reducing avoidable burn, not by making Astra do trivial work.

CAE does **not** manage, route, tune, or replace the user's other Codex models. When Astra is not active, CAE should stay out of the way.

## Product principles

1. **Native Codex workflow.** No mandatory harness migration, custom agent UI, task DSL, proxy, or repo restructuring.
2. **Astra means Astra.** The core product does not silently substitute cheaper models.
3. **Measure before promoting defaults.** Astra-specific changes must be justified by measured Plus usage and real-work outcomes.
4. **5-hour and weekly limits are separate.** Both are tracked independently when Codex exposes them.
5. **Missing quota data is unknown, not zero or unlimited.** Never invent usage state.
6. **Do not kill productive work.** CAE should not terminate a useful active turn merely because a threshold is crossed.
7. **Large work is not waste.** A long or expensive run can be efficient if it completes valuable work. CAE targets unnecessary work, not ambitious work.
8. **Local by default.** Usage receipts and session analysis stay local unless the user explicitly exports them.
9. **Minimal interruption.** Warnings and controls must be rare, high-value, and optional.
10. **No quota-circumvention claims.** CAE cannot increase OpenAI limits; it helps users spend the allowance they already have more deliberately.

## Current private foundation

Implemented:

- exact configured Astra-model targeting with strict non-Astra no-op behavior;
- native Codex `UserPromptSubmit` / `Stop` hook handling with fail-open behavior;
- privacy-safe opaque session/turn correlation rather than persisted raw identifiers;
- non-destructive, idempotent hook setup and CAE-owned-only uninstall;
- native Codex app-server reads for rate-limit state and model catalog discovery;
- 5-hour / weekly normalization by actual window duration;
- explicit missing, malformed, partial, and conflicting quota states;
- reset-aware before/after allowance deltas;
- native purchased-credit snapshot preservation when Codex reports it, without inventing a unit or dollar conversion;
- model-aware quota authority selection using exact native model metadata when available;
- privacy-safe measurement descriptors for task shape and outcome quality;
- local Astra run-receipt schema v2 with allowance, workload, objective, validation, subagent/tool, intervention, scope, and rework evidence;
- read-only native-model discovery that never silently activates an Astra candidate;
- explicit Codex launcher override for environments where the user's normal wrapper provides required runtime setup;
- Ubuntu and Windows CI, with macOS coverage added to the Window 0 preparation lane.

CAE does **not** claim a validated Astra efficiency improvement yet. The first defaults will be driven by live Plus evidence from the staged pre-release campaigns.

## Real native Codex validation

CAE completed Gates A-F against a real signed-in ChatGPT Plus Codex installation on Android/Termux with Codex `0.149.0`.

Validated:

- package integrity;
- signed-in quota/model app-server reads;
- hook setup and idempotence;
- live exact-target `UserPromptSubmit` + `Stop` observations;
- strict live non-target no-op behavior;
- app-server coexistence with an active Codex process;
- CAE-only uninstall and healthy post-uninstall Codex operation.

The native Codex hook trust prompt (`Hooks need review / Trust all`) is a real first-run UX step and is not bypassed by CAE.

See [`receipts/native-runtime-validation-final-2026-09-04.md`](receipts/native-runtime-validation-final-2026-09-04.md).

The live test environment now reports Codex `0.153.2`, so current-version revalidation is required before spending Astra allowance. See [`receipts/astra-plus-availability-observation-2026-09-04.md`](receipts/astra-plus-availability-observation-2026-09-04.md).

## Codex launcher compatibility

Ordinary installations use the normal platform command automatically:

- Unix-like: `codex`
- Windows: `codex.cmd`

If the user's working Codex command is a wrapper or a different executable path, CAE can use the same launcher:

```text
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae doctor
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae probe
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae quota
```

The override is one executable path/name, not a shell command. CAE uses the same resolved launcher for Codex version checks and short-lived app-server reads.

This was added after Termux validation showed that the user's normal Codex wrapper supplied resolver environment required by the standalone musl binary. Final Issue #6 acceptance requires the commands above to pass through `/usr/bin/codex` on the current Termux runtime.

## How CAE measures before it optimizes

CAE separates:

1. observed facts;
2. deterministic measurements;
3. signals;
4. efficiency hypotheses;
5. validated interventions.

A short run is not automatically efficient, and an expensive run is not automatically wasteful. CAE records task shape and outcome alongside quota movement rather than reducing everything to prompts or minutes.

Material burn/failure events are classified as best supported by evidence: model, user/task shape, CAE, mixed, or unknown. This exists to avoid implementing the wrong fix, not to blame users.

See [`docs/MEASUREMENT_MODEL.md`](docs/MEASUREMENT_MODEL.md), [`docs/ASTRA_PLUS_TEST_PLAN.md`](docs/ASTRA_PLUS_TEST_PLAN.md), and [`docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md`](docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md).

## Private validation CLI

These commands exist for development and compatibility validation; they are not yet a public installation contract.

```text
cae doctor
cae probe
cae quota
cae setup --dry-run
cae setup
cae uninstall --dry-run
cae uninstall
cae target show
cae target set <exact-model-id>
cae target clear
cae events
```

Key behavior:

- `cae probe` is read-only and checks the local Codex app-server quota/model surfaces.
- `cae setup` adds only CAE-owned `UserPromptSubmit` and `Stop` hooks to the normal Codex home.
- `cae target ...` is a private validation/compatibility control; the public product goal is zero-friction Astra targeting after the exact production picker identity is validated.
- `cae events` contains only targeted-model baseline observations and excludes raw prompt/response/path content.

## Pre-release campaign

Astra has now been operator-observed in the native `/model` picker on the test Plus account. The project has moved from launch waiting to controlled live validation.

The release path is:

1. **Zero-Astra current-version gate** — revalidate Codex `0.153.2`, launcher behavior, quota/model reads, and cross-platform CI.
2. **Window 0** — use only the allowance already remaining before any banked reset to prove the exact Astra identity, quota authority, hooks, receipts, and one or two bounded real product tasks.
3. **Harden without Astra** — use Sol/Luna/Hermes/CI for ordinary fixes.
4. **Window 1** — use one banked reset for a clean early-release campaign. Begin with a small pass-through/control segment, then test only evidence-backed efficiency interventions on genuine work.
5. **Harden without Astra** again.
6. **Window 2** — wait for the next normal 5-hour availability and validate the release-candidate build. Do not spend the second banked reset merely to accelerate testing.
7. Publish v0.1 only when [`docs/RELEASE_CRITERIA.md`](docs/RELEASE_CRITERIA.md) passes.

See [`docs/ASTRA_WINDOW_0_SHAKEDOWN.md`](docs/ASTRA_WINDOW_0_SHAKEDOWN.md) and [`docs/ASTRA_PLUS_TEST_PLAN.md`](docs/ASTRA_PLUS_TEST_PLAN.md).

## Current status

**Astra live on the test Plus account; Window 0 preparation in progress.**

The exact native Astra model id and Astra quota-authority shape still require CAE-native capture. No Astra efficiency improvement is claimed yet.

The repository remains private until the real-work evidence and release gates are satisfied.

## Authorities

- [`docs/PRODUCT_CHARTER.md`](docs/PRODUCT_CHARTER.md)
- [`docs/CODEX_INTEGRATION_RECON.md`](docs/CODEX_INTEGRATION_RECON.md)
- [`docs/NATIVE_RUNTIME_VALIDATION.md`](docs/NATIVE_RUNTIME_VALIDATION.md)
- [`docs/ASTRA_WINDOW_0_SHAKEDOWN.md`](docs/ASTRA_WINDOW_0_SHAKEDOWN.md)
- [`docs/ASTRA_PLUS_TEST_PLAN.md`](docs/ASTRA_PLUS_TEST_PLAN.md)
- [`docs/MEASUREMENT_MODEL.md`](docs/MEASUREMENT_MODEL.md)
- [`docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md`](docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md)
- [`docs/PRIOR_ART.md`](docs/PRIOR_ART.md)
- [`docs/RELEASE_CRITERIA.md`](docs/RELEASE_CRITERIA.md)
- [`trackers/STATE.md`](trackers/STATE.md)
- [`receipts/native-runtime-validation-final-2026-09-04.md`](receipts/native-runtime-validation-final-2026-09-04.md)
- [`receipts/astra-plus-availability-observation-2026-09-04.md`](receipts/astra-plus-availability-observation-2026-09-04.md)
