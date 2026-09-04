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

1. **Native Codex workflow.** No mandatory harness migration, custom agent UI, task DSL, or repo restructuring.
2. **Astra means Astra.** The core product does not silently substitute cheaper models.
3. **Observe before optimizing.** Astra-specific changes must be justified by measured Plus usage and real-work outcomes.
4. **5-hour and weekly limits are separate.** Both are tracked independently when Codex exposes them.
5. **Missing quota data is unknown, not zero or unlimited.** Never invent usage state.
6. **Do not kill productive work.** CAE should not terminate a useful active turn merely because a threshold is crossed.
7. **Large work is not waste.** A long or expensive run can be efficient if it completes valuable work. CAE targets unnecessary work, not ambitious work.
8. **Local by default.** Usage receipts and session analysis stay local unless the user explicitly exports them.
9. **Minimal interruption.** Warnings and controls must be rare, high-value, and optional.
10. **No quota-circumvention claims.** CAE cannot increase OpenAI limits; it helps users spend the allowance they already have more deliberately.

## Initial development strategy

Before Astra reaches Plus broadly, the repository will build and validate the non-Astra foundation:

- Codex integration reconnaissance;
- Astra-only hook/filter design;
- rate-limit snapshot parsing;
- local run receipts;
- test fixtures for missing/partial quota windows;
- baseline methodology for real-work testing;
- privacy and release criteria.

When Astra becomes available on the test Plus account, the first campaign will be **observe-only**. We will measure normal Astra-in-Codex behavior before enabling any efficiency intervention. Only optimizations that survive controlled real-work testing should ship as defaults.

## Current status

**Pre-Astra foundation / private validation.**

The repository has been created and the product contract is now locked. Implementation work should preserve the native Codex experience and remain Astra-specific.

See:

- [`docs/PRODUCT_CHARTER.md`](docs/PRODUCT_CHARTER.md)
- [`docs/ASTRA_PLUS_TEST_PLAN.md`](docs/ASTRA_PLUS_TEST_PLAN.md)
- [`docs/CODEX_INTEGRATION_RECON.md`](docs/CODEX_INTEGRATION_RECON.md)
- [`docs/RELEASE_CRITERIA.md`](docs/RELEASE_CRITERIA.md)
- [`trackers/STATE.md`](trackers/STATE.md)
