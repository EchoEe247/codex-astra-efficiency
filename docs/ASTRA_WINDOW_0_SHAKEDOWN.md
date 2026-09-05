# Astra Window 0 Pre-Release Shakedown

## Purpose

Window 0 uses only the Plus allowance already remaining before any banked reset. It is a **product shakedown for Codex Astra Efficiency (CAE)**, not a model benchmark and not release evidence by itself.

The objective is to remove live-runtime uncertainty before spending a clean 100% 5-hour / 100% weekly reset on the first serious early-release campaign.

Window 0 should answer:

1. Does CAE recognize the exact production Astra model selected through normal Codex `/model`?
2. Does CAE choose the correct Astra quota authority from the live Plus account shape?
3. Do CAE hooks remain fail-open and Astra-only with real Astra?
4. Can a complete before/after receipt be produced around useful work without changing the normal Codex workflow?
5. What product or measurement defects should be fixed before Window 1?

## Hard rules

- Do **not** use a banked reset for Window 0.
- Use the existing remaining weekly allowance only.
- Do not run concurrent Codex work on the same account while the quota authority is shared/default.
- Select Astra through the normal native model picker.
- Start at Astra **Medium** reasoning unless live evidence requires escalation.
- Do not use Very High merely to probe burn.
- Use real needed engineering work; no synthetic prompt-count benchmark.
- Do not ask Astra to perform ordinary cleanup that Sol/Luna/Hermes or CI can do after the live shakedown.
- Preserve failures and unexpected behavior as evidence.
- Stop if measurement authority becomes ambiguous or CAE appears to affect non-Astra behavior.

## Gate W0-A — zero-inference preparation

Complete before sending a prompt to Astra:

```text
npm test
npm run check

CAE_CODEX_COMMAND=/usr/bin/codex cae doctor
CAE_CODEX_COMMAND=/usr/bin/codex cae probe
CAE_CODEX_COMMAND=/usr/bin/codex cae quota
```

Then record, without guessing:

- Codex version;
- exact Astra candidate/model id returned by the native catalog;
- whether model discovery is unique or ambiguous;
- current 5-hour and weekly snapshots;
- quota-authority kind (`exact_model`, `shared_default`, or other observed state);
- reset-credit count if natively exposed;
- CAE target configuration before the run.

Issue #6 remains open unless the launcher commands above pass through the normal wrapper without the prior manual workaround.

## Gate W0-B — live Astra identity

1. Set/verify the exact target only after native model discovery identifies the production Astra id.
2. Launch normal Codex.
3. Select Astra through `/model`.
4. Confirm the live `UserPromptSubmit`/`Stop` hook model identity exactly matches the configured target.
5. Confirm a non-Astra model remains a strict no-op after the live Astra check.

Do not infer the slug from marketing names or documentation when the native picker/runtime exposes an exact id.

## Gate W0-C — first real Astra task

The first Astra task should improve or validate CAE itself and must be bounded enough that an early live-integration defect does not consume the entire remaining weekly allowance.

Recommended task contract:

> Validate Codex Astra Efficiency against the newly available real Plus Astra runtime. Establish the actual Astra model identity and quota shape, inspect the existing Gate G assumptions, identify incompatibilities between the repository's pre-Astra fixtures/logic and the live runtime, implement only changes justified by observed live evidence, run relevant tests, and produce a concise validation receipt. Do not perform an unrelated broad repository refactor. Do not change non-Astra behavior. Preserve the native Codex model-selection experience.

This is useful product work even if the result is PARTIAL or FAIL_USEFUL.

## Gate W0-D — immediate post-task capture

At the first meaningful task boundary, capture:

- 5-hour before/after and delta;
- weekly before/after and delta;
- quota-authority kind and stability;
- model id;
- reasoning effort;
- service tier if reliably exposed;
- wall-clock duration;
- task class/project-scale/continuity;
- tool classes;
- human interventions;
- scope expansion;
- validation result;
- outcome: `PASS`, `PARTIAL`, `FAIL_USEFUL`, or `FAIL_WASTE`;
- rework required.

Do not convert a partial-window percentage into a claim about full-window capacity.

## Window 0 continuation rule

The remaining allowance is for reducing uncertainty, not exhausting a quota for its own sake.

After the first task:

- **small, interpretable burn + clean measurement:** one additional bounded real task may be run;
- **material burn or ambiguous measurement:** stop Astra and analyze with cheaper tools/models;
- **large burn, runaway scope, hook/measurement defect, or non-Astra interference:** stop immediately and preserve the evidence.

A useful rule of thumb for this one shakedown is:

- <= ~5 percentage points of weekly allowance: a second bounded task may be justified;
- ~5-10 points: analyze before deciding;
- > ~10 points: stop Astra work for Window 0.

These are experimental safeguards, **not** public product thresholds and not claims about Astra's normal cost.

## After Window 0

Turn Astra off and use Sol/Luna/Hermes/CI for ordinary fixes.

Before Window 1:

- close or explicitly disposition all Window 0 measurement/integration defects;
- finish Issue #6 Termux launcher acceptance;
- pass Ubuntu, Windows, macOS, and local Termux validation;
- freeze the exact Window 1 candidate commit;
- document the production Astra model identity and quota-authority shape;
- verify non-Astra no-op behavior;
- verify receipts are complete and privacy-safe.

Only then use one banked reset for Window 1.

## Campaign sequence

```text
Window 0
remaining existing allowance only
        |
        v
fix/harden without Astra
        |
        v
Window 1
one banked reset -> clean early-release campaign
        |
        v
fix/harden without Astra
        |
        v
Window 2
wait for the next normal 5-hour window -> release-candidate validation
        |
        v
public v0.1 only if release criteria pass
```

The second banked reset is not part of the planned CAE release test sequence.
