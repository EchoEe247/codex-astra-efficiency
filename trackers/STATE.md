# Project State

Last updated: 2026-09-04

## Current phase

**FOUNDATION COMPLETE ENOUGH FOR INSTALLED-RUNTIME VALIDATION / PRE-ASTRA PLUS**

The repository remains private while the native Codex path is proven against a real signed-in installation and Astra continues rolling from Pro into Plus.

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

Current upstream Codex source provides a strong native integration candidate:

- hooks are currently stable/default-enabled;
- `UserPromptSubmit` and `Stop` expose `session_id`, `turn_id`, and active `model`;
- `UserPromptSubmit` supports optional additional context, which remains disabled in baseline mode;
- `CODEX_HOME` resolves from the environment override or defaults to `~/.codex`;
- global hook configuration is read from the Codex home hook file;
- app-server exposes `account/rateLimits/read`, `model/list`, and rolling limit updates;
- app-server wire messages are newline-delimited JSON and intentionally omit a JSON-RPC `jsonrpc` field;
- initialize uses `clientInfo` plus optional capabilities;
- current rate-limit responses can expose duration, used percent, reset time, plan type, per-limit buckets, ordinary-usage permission, and reset-credit summaries;
- current model catalog exposes exact native model id, display name, hidden/default state, reasoning efforts, and other picker metadata.

These remain source/protocol findings until reproduced against the installed Codex version used for validation.

## Early Astra Pro field evidence

Astra reached Pro users before the project test Plus account. Early field reports are now tracked in `docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md`.

Notable reports include:

- Pro 5x / Ultra codebase audit / no subagents: about **10% weekly in 14m22s**.
- Pro 5x / Medium browser-computer research: about **3% weekly**; the user reported computer use felt at least about 2x as fast as Sol High.
- Pro 20x / existing 19-microservice gRPC migration: about **5% weekly in 10 minutes**.
- Purchased-credit / Medium docs + Git branch scan + ~10k-line refactor assessment: **$2.48 equivalent** for the run.
- Other early users report materially faster task execution, reinforcing that burn must be judged against completed work and rework avoided rather than percentage alone.

These are anecdotal and use different plan denominators. They must not be converted directly into Plus percentages. They do, however, strengthen the hypothesis that project breadth/context, reconnaissance, computer use, reasoning effort, and repeated rediscovery all need to be measured explicitly.

OpenAI currently states that Astra can consume Work/Codex allowance faster than Sol and that task, input/output size, reasoning setting, and Fast mode affect usage. Current flexible-pricing rate cards also show Astra at a materially higher token rate than Sol. This supports CAE's decision to optimize value density rather than prompt count.

## Implemented foundation

- Exact configured Astra model targeting with strict non-Astra no-op behavior.
- Fail-open hook handler.
- Privacy-minimal local Astra observations using opaque SHA-256 session/turn correlation keys rather than raw ids.
- Raw prompt, assistant message, cwd, and transcript paths are not persisted by baseline observation.
- Non-destructive hook merge/removal primitives with idempotence tests.
- Atomic global hook setup/uninstall honoring upstream `CODEX_HOME` semantics.
- `cae setup --dry-run`, `cae uninstall --dry-run`, and hook-readiness reporting in `cae doctor`.
- Exact target compatibility control (`cae target show|set|clear`) for private/runtime validation; public zero-friction setup remains the goal.
- Short-lived local Codex app-server client.
- `cae quota` for normalized Plus rate-limit visibility.
- `cae probe` for read-only quota + native model-catalog reconnaissance.
- Conservative native Astra discovery that returns `not_found`, `single_candidate`, or `ambiguous` and never silently activates a candidate.
- Duration-based 300-minute / 10,080-minute normalization without assuming `primary` or `secondary` semantics.
- First-class `not_reported`, `partial`, `malformed`, and `conflicting` rate-limit states.
- Reset-aware snapshot delta calculation that refuses to call reset-crossing or non-monotonic changes usage burn.
- Fixture coverage for complete, missing-5h, missing-weekly, partial, malformed, and contradictory responses.
- Privacy-minimal local run-receipt primitives with start/end quota snapshots, duration, outcome, optional intervention count, and reset-aware usage deltas.
- Receipt normalization intentionally excludes raw account IDs from the persisted path.
- Prior-art authority in `docs/PRIOR_ART.md`.
- Installed-runtime execution protocol in `docs/NATIVE_RUNTIME_VALIDATION.md`.
- Updated integration authority in `docs/CODEX_INTEGRATION_RECON.md`.
- Early Pro usage research authority in `docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md`.

## Validation status

- Repository/unit integration: **PASS** on GitHub Actions Node 20/22 and Windows Node 22 through the validated setup path.
- Native installed Codex hook execution: **NOT YET PROVEN**.
- Signed-in Plus app-server quota read: **NOT YET PROVEN**.
- Side-by-side app-server read while normal Codex is active: **NOT YET PROVEN**.
- Native Astra picker/model identity on Plus: **BLOCKED UNTIL ASTRA IS AVAILABLE ON THE TEST ACCOUNT**.
- Astra efficiency improvement: **BLOCKED UNTIL OBSERVE-ONLY BASELINE EXISTS**.

## Immediate execution queue

1. Run `docs/NATIVE_RUNTIME_VALIDATION.md` Gates A-F on a real installed, signed-in Codex environment.
2. Capture exact Codex version and real `cae probe` / `cae quota` behavior.
3. Prove hook setup/idempotence/uninstall on actual user configuration.
4. Temporarily target one current exact native model only for plumbing proof, then prove another model is a strict no-op and clear the temporary target.
5. Verify whether quota/model app-server reads coexist cleanly with a normal active Codex session.
6. Add every observed response variant as a fixture without weakening unknown/conflict handling.
7. Continue collecting Pro Astra reports only when plan, task, reasoning, runtime, usage/credits, tools/subagents, or outcome make them useful evidence.
8. When Astra appears on Plus, run Gate G: native catalog candidate -> model-picker selection -> exact hook model identity.
9. Bind receipt before/after quota capture to the validated Astra turn lifecycle without adding a new user workflow.
10. Run the real-work Plus observe-only baseline using workload categories informed by the early Pro evidence: codebase audit, focused implementation, multi-service/refactor work, browser/computer research, and a high-value difficult task.
11. Test narrowly scoped efficiency interventions only after baseline review.

## Research posture

Adjacent projects already cover general quota overlays, Codex usage analytics, multi-provider spend tracking, and broad workflow optimization. CAE remains focused on the distinct intersection of Plus + Astra + native Codex + real-work efficiency. See `docs/PRIOR_ART.md` and `docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md`.

The current working optimization target is **useful completed work per unit of Astra allowance**, not prompts/week or raw runtime. A future preflight/advisory layer is plausible, but no task-routing or intervention policy should ship before Plus observations exist.

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

Public v0.1 should ship as soon as the evidence gate is satisfied after Astra reaches Plus. If measured optimizations are not yet trustworthy, a clean observability-first release is preferable to unvalidated efficiency claims.
