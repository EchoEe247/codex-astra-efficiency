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

## Current live authority

The zero-inference preflight on the known-good `codexu` Ubuntu-under-Termux runtime established:

- Codex `0.153.2` through `/root/.local/bin/codex`;
- one complete native Astra catalog candidate: `gpt-6-astra` / `GPT-6-Astra`;
- native default reasoning effort: `low`;
- supported reasoning efforts: `low`, `medium`, `high`, `xhigh`, `max`, `ultra`;
- Plus quota authority: `shared_default` with `normalModelSlug=null`;
- 5-hour and weekly windows readable through the native app-server;
- two reset credits still intact at the preflight checkpoint;
- no Astra inference consumed during the preflight.

Authority: [`../receipts/window-0-zero-inference-preflight-codexu-2026-09-04.md`](../receipts/window-0-zero-inference-preflight-codexu-2026-09-04.md).

Native Termux Codex is a separate compatibility lane under Issue #9. Window 0 uses `codexu` as the authoritative local Astra runtime and must not be blocked by unrelated native-Termux residue unless the same defect reproduces in `codexu`.

## Hard rules

- Do **not** use a banked reset for Window 0.
- Use the existing remaining weekly allowance only.
- Do not run concurrent Codex work on the same account while the quota authority is shared/default.
- Select Astra through the normal native model picker.
- Begin the first live task at the **native Astra default reasoning effort** unless the task itself demonstrates a need to escalate. The live catalog currently reports `low` as that default.
- Do not select `xhigh`, `max`, or `ultra` merely to probe burn.
- Use real needed engineering work; no synthetic prompt-count benchmark.
- Do not ask Astra to perform ordinary cleanup that Sol/Luna/Hermes or CI can do after the live shakedown.
- Preserve failures and unexpected behavior as evidence.
- Stop if measurement authority becomes ambiguous or CAE appears to affect non-Astra behavior.

## Gate W0-A — zero-inference preparation

The earlier authoritative A-F runtime validation used Codex `0.149.0`. The Window 0 preflight revalidated the known-good `codexu` runtime on Codex `0.153.2` and established the exact working launcher.

The required zero-inference checks are:

```text
npm test
npm run check

CAE_CODEX_COMMAND=<working-codex-launcher> node ./bin/cae.js doctor
CAE_CODEX_COMMAND=<working-codex-launcher> node ./bin/cae.js probe
CAE_CODEX_COMMAND=<working-codex-launcher> node ./bin/cae.js readiness
CAE_CODEX_COMMAND=<working-codex-launcher> node ./bin/cae.js quota
```

For the current authoritative `codexu` runtime, `<working-codex-launcher>` is `/root/.local/bin/codex`. Do not substitute bare `codex` or `/usr/bin/codex`; the preflight proved that the Ubuntu environment inherits a Termux PATH entry and that Ubuntu `/usr/bin/codex` does not exist.

`cae readiness` is read-only. It combines the native model catalog, configured Astra target, reset-credit state, and model-aware quota authority into one pre-inference result. It never silently sets a target or selects a model.

Then record, without guessing:

- Codex version;
- exact Astra candidate/model id returned by the native catalog;
- whether model discovery is unique or ambiguous;
- current 5-hour and weekly snapshots;
- quota-authority kind (`model_bucket`, `model_default`, `shared_default`, or other observed state);
- reset-credit count if natively exposed;
- CAE target configuration before the run.

If `cae readiness` returns `target_configuration_required`, execute only the exact command it reports after verifying the candidate is the native Astra entry, then re-run `cae readiness`.

If it returns `model_catalog_incomplete`, `astra_discovery_ambiguous`, `quota_authority_unresolved`, or `native_read_unavailable`, stop before Astra inference and diagnose the zero-inference path first. An incomplete catalog cannot establish a unique Astra target because a later page could contain another candidate.

Issue #6 launcher-equivalence acceptance is satisfied for the authoritative `codexu` runtime when all four commands above pass through its actual launcher. This must not be interpreted as native Termux health; native Termux remains Issue #9.

## Gate W0-B — live Astra identity

1. Set/verify the exact target only after native model discovery identifies the production Astra id.
2. Re-run `cae readiness` and require `ready_for_live_hook_capture`.
3. Review `cae setup --dry-run`, then install the CAE-owned hooks.
4. Launch normal Codex through the authoritative `codexu` runtime.
5. Select Astra through `/model`.
6. Confirm the live `UserPromptSubmit`/`Stop` hook model identity exactly matches the configured target.
7. Confirm a non-Astra model remains a strict no-op after the live Astra check.

Do not infer the slug from marketing names or documentation when the native picker/runtime exposes an exact id.

## Gate W0-C — first real Astra task

The first Astra task should improve or validate CAE itself and must be bounded enough that an early live-integration defect does not consume the entire remaining weekly allowance.

Use the native Astra default reasoning effort first. For the current catalog that is `low`. Escalate to `medium` or above only when the task shows a concrete reasoning limitation or the first result requires it. This keeps the shakedown representative of the normal picker default rather than silently changing the model economics before CAE has evidence.

Recommended task contract:

> Validate Codex Astra Efficiency against the newly available real Plus Astra runtime. Establish the actual Astra model identity and quota shape, inspect the existing Gate G assumptions, identify incompatibilities between the repository's pre-Astra fixtures/logic and the live runtime, implement only changes justified by observed live evidence, run relevant tests, and produce a concise validation receipt. Do not perform an unrelated broad repository refactor. Do not change non-Astra behavior. Preserve the native Codex model-selection experience.

This is useful product work even if the result is PARTIAL or FAIL_USEFUL.

## Gate W0-D — immediate post-task capture

At the first meaningful task boundary, capture:

- campaign: `window_0`;
- runtime: `ubuntu_in_termux/codexu`;
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
- cause class: `MODEL`, `USER_TASK`, `CAE`, `MIXED`, or `UNKNOWN`;
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
- preserve Issue #6 as completed only for the proven `codexu` launcher/runtime scope;
- pass Ubuntu, Windows, macOS, and authoritative `codexu` validation;
- keep native Termux support separate under Issue #9 and do not claim it publicly until that lane passes;
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
