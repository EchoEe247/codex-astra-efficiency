# Project State

Last updated: 2026-09-04

## Current phase

**PRE-ASTRA NATIVE RUNTIME VALIDATION PASS / ASTRA PLUS LAUNCH WAIT**

The repository remains private while Astra continues rolling from Pro into Plus and the final launcher-compatibility improvement is revalidated on the Termux test environment.

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
- 5-hour and weekly limits are separate authorities when exposed.
- Missing rate-limit data is unknown, never guessed.
- Local-first privacy is mandatory.

## Native runtime validation authority

`receipts/native-runtime-validation-final-2026-09-04.md` is the authoritative A-F runtime receipt.

Validated environment:

- Android aarch64 / Termux;
- Node v24.18.0;
- Codex 0.149.0;
- ChatGPT Plus sign-in;
- default `~/.codex` home.

Result:

- Gate A package integrity: **PASS**.
- Gate B signed-in native quota/model app-server reads: **PASS with launcher caveat**.
- Gate C hook setup/idempotence/ownership: **PASS**.
- Gate D live target + strict non-target hook behavior: **PASS**.
- Gate E app-server coexistence with active Codex: **PASS**.
- Gate F CAE-only uninstall + post-uninstall Codex health: **PASS**.

Live Gate D proved `UserPromptSubmit` + `Stop` for exact model `gpt-5.6-sol`, stable opaque session/turn correlation, and strict no-op persistence for a live `gpt-5.6-luna` non-target turn.

The native first-run hook trust gate (`Hooks need review / Trust all`) is a real product UX requirement. CAE must not bypass Codex trust controls.

## Real Plus quota shape observed

The signed-in Plus account exposed:

- 300-minute 5-hour window;
- 10,080-minute weekly window;
- one shared/default `codex` quota bucket;
- `normalModelSlug=null`;
- no model-specific quota bucket in the observed account state;
- purchased-credit snapshot with `hasCredits=false`, `unlimited=false`, balance `"0"`;
- reset-credit summary;
- Astra absent from the native catalog (`not_found`).

Because the observed meter is shared/default, controlled Astra baseline experiments must avoid concurrent Codex usage unless launch-time data exposes a dedicated Astra bucket.

Catalog contents and reset-credit counts changed naturally between reads, so both are treated as dynamic observations rather than constants.

## Termux launcher compatibility

Runtime validation found one portability issue:

- direct CAE spawning of the standalone musl Codex binary could not resolve DNS because that environment had no usable `/etc/resolv.conf`;
- the user's normal `/usr/bin/codex` wrapper succeeded with the same binary, Codex home, and ChatGPT auth because its proot environment supplied working resolver state.

Issue #6 tracks this as launcher equivalence rather than an auth/protocol problem.

Implementation is now in progress/current main:

- `CAE_CODEX_COMMAND` can select the same executable/wrapper the user normally launches;
- explicit programmatic selection takes precedence over the environment override;
- ordinary platforms retain `codex` / `codex.cmd` defaults;
- the same resolved launcher is used for app-server reads and Codex version reporting;
- the value is treated as one executable path/name, not a shell command.

This launcher change still requires CI completion and one local Termux revalidation before Issue #6 can close.

## Technical foundation

Implemented:

- exact configured Astra-model targeting with strict non-Astra no-op behavior;
- fail-open hook handler;
- privacy-minimal local observations using opaque SHA-256 session/turn correlation keys;
- no raw prompt, assistant response, cwd, transcript path, or raw session/turn id in baseline events;
- non-destructive hook merge/removal with idempotence coverage;
- atomic setup/uninstall honoring `CODEX_HOME`;
- `cae doctor`, `probe`, `quota`, `events`, setup/uninstall dry-runs, and private target controls;
- native Codex app-server client for `account/rateLimits/read` and `model/list`;
- duration-based 300-minute / 10,080-minute normalization;
- explicit missing, malformed, partial, and conflicting quota states;
- reset-aware before/after allowance deltas;
- purchased-credit/reset-credit preservation without invented units;
- model-aware quota authority selection using exact `normalModelSlug` when available and labeled `shared_default` otherwise;
- receipt schema v2 for task shape, outcome quality, intervention burden, tool classes, and quota deltas;
- measurement evidence hierarchy in `docs/MEASUREMENT_MODEL.md`;
- early Astra Pro usage evidence in `docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md`;
- prior-art authority in `docs/PRIOR_ART.md`.

## Early Astra Pro evidence

Pro field reports remain research inputs, not Plus conversion formulas. Notable observations include high burn for broad audits, multi-service work, browser/computer research, and project-state/refactor assessment even when elapsed time is short.

The project therefore continues optimizing for:

**useful completed work per unit of Astra allowance**

—not prompt count or wall-clock duration.

## Validation status

- Cross-platform unit/source CI before launcher change: **PASS** on Ubuntu Node 20, Ubuntu Node 22, Windows Node 22.
- Real installed Codex A-F runtime validation: **PASS** on Termux/Codex 0.149.0.
- Signed-in Plus app-server quota read: **PASS** through the user's working wrapper path.
- Side-by-side app-server read with active Codex: **PASS**.
- Live exact-target hook observation: **PASS**.
- Live non-target strict no-op: **PASS**.
- Setup ownership/uninstall: **PASS**.
- Launcher override implementation: **CODE COMPLETE; CI/RUNTIME REVALIDATION PENDING**.
- Native Astra picker/model identity on Plus: **BLOCKED UNTIL ASTRA IS AVAILABLE ON THE TEST ACCOUNT**.
- Native Astra quota-authority shape: **BLOCKED UNTIL ASTRA IS AVAILABLE ON THE TEST ACCOUNT**.
- Astra efficiency improvement: **BLOCKED UNTIL OBSERVE-ONLY BASELINE EXISTS**.

## Immediate execution queue

1. Finish CI for the launcher override implementation.
2. Revalidate on Termux using `CAE_CODEX_COMMAND=/usr/bin/codex` with `cae doctor`, `cae probe`, and `cae quota`; close Issue #6 only if the native commands now work without the previous manual workaround.
3. Keep collecting Pro Astra reports only when plan, task, reasoning, runtime, usage/credits, tools/subagents, or outcome make them useful evidence.
4. When Astra appears on Plus, run Gate G: native catalog candidate -> picker/active model identity -> exact hook identity -> quota-authority selection.
5. Bind receipt before/after quota capture to the validated Astra turn lifecycle without creating a new user workflow.
6. Run the real-work Plus observe-only baseline from `docs/ASTRA_PLUS_TEST_PLAN.md`.
7. Test narrowly scoped efficiency interventions only after baseline review.
8. Ship v0.1 as soon as the evidence gate is satisfied; prefer an honest observability-first release over unvalidated efficiency claims.

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

CAE is now **Astra-ready at the native integration layer**. The remaining launch blocker is actual Astra availability on the Plus test account, plus completion of the small launcher portability revalidation.
