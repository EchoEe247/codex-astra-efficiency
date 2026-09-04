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
3. **Observe before optimizing.** Astra-specific changes must be justified by measured Plus usage and real-work outcomes.
4. **5-hour and weekly limits are separate.** Both are tracked independently when Codex exposes them.
5. **Missing quota data is unknown, not zero or unlimited.** Never invent usage state.
6. **Do not kill productive work.** CAE should not terminate a useful active turn merely because a threshold is crossed.
7. **Large work is not waste.** A long or expensive run can be efficient if it completes valuable work. CAE targets unnecessary work, not ambitious work.
8. **Local by default.** Usage receipts and session analysis stay local unless the user explicitly exports them.
9. **Minimal interruption.** Warnings and controls must be rare, high-value, and optional.
10. **No quota-circumvention claims.** CAE cannot increase OpenAI limits; it helps users spend the allowance they already have more deliberately.

## Current private foundation

CAE currently has a zero-runtime-dependency Node foundation for validating the least-invasive Codex integration path.

Implemented:

- exact configured Astra-model targeting with strict non-Astra no-op behavior;
- native Codex `UserPromptSubmit` / `Stop` hook handling with fail-open behavior;
- privacy-safe opaque session/turn correlation rather than persisted raw identifiers;
- non-destructive, idempotent hook setup and CAE-owned-only uninstall;
- native Codex app-server reads for rate-limit state and model catalog discovery;
- 5-hour / weekly normalization by actual window duration;
- explicit missing, malformed, partial, and conflicting quota states;
- reset-aware before/after allowance deltas;
- local Astra run-receipt primitives;
- read-only native-model discovery that never silently activates an Astra candidate;
- Linux and Windows CI coverage.

The implementation is deliberately **not** an Astra optimizer yet. The next evidence gate is real installed-Codex validation, followed by the first normal Astra real-work baseline when Plus access reaches the test account.

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

## Development and validation sequence

Before Astra reaches Plus broadly, CAE validates the non-Astra foundation without pretending that source-level compatibility is runtime proof.

The remaining sequence is:

1. validate the package against a real installed, signed-in Codex environment;
2. prove native hook setup, exact picker model identity, strict non-target no-op behavior, quota/model reads, coexistence, and clean uninstall;
3. when Astra is available, prove the exact native Astra model identifier;
4. run an **observe-only** Astra campaign on needed real work;
5. measure 5-hour and weekly allowance changes alongside task outcomes and human intervention;
6. only then test narrowly scoped Astra-specific efficiency interventions;
7. ship defaults only when real-work evidence shows they reduce avoidable burn without degrading completion quality.

See [`docs/NATIVE_RUNTIME_VALIDATION.md`](docs/NATIVE_RUNTIME_VALIDATION.md) for the installed-runtime gate and [`docs/ASTRA_PLUS_TEST_PLAN.md`](docs/ASTRA_PLUS_TEST_PLAN.md) for the later real-work campaign.

## Current status

**Foundation complete enough for installed-runtime validation / pre-Astra.**

Cross-platform source/unit validation currently passes on Ubuntu Node 20, Ubuntu Node 22, and Windows Node 22. This does **not** yet prove behavior against a real signed-in Codex installation or the production Astra model identity.

The project remains private until those runtime and real-work evidence gates are satisfied.

## Authorities

- [`docs/PRODUCT_CHARTER.md`](docs/PRODUCT_CHARTER.md)
- [`docs/CODEX_INTEGRATION_RECON.md`](docs/CODEX_INTEGRATION_RECON.md)
- [`docs/NATIVE_RUNTIME_VALIDATION.md`](docs/NATIVE_RUNTIME_VALIDATION.md)
- [`docs/ASTRA_PLUS_TEST_PLAN.md`](docs/ASTRA_PLUS_TEST_PLAN.md)
- [`docs/PRIOR_ART.md`](docs/PRIOR_ART.md)
- [`docs/RELEASE_CRITERIA.md`](docs/RELEASE_CRITERIA.md)
- [`trackers/STATE.md`](trackers/STATE.md)
- [`receipts/pre-runtime-readiness-2026-09-04.md`](receipts/pre-runtime-readiness-2026-09-04.md)
