# Project State

Last updated: 2026-09-04

## Current phase

**ASTRA LIVE ON TEST PLUS ACCOUNT / WINDOW 0 PRE-RELEASE SHAKEDOWN PREP**

The repository remains private while the current Codex runtime is revalidated, the exact production Astra identity/quota shape is captured, and the first partial-allowance shakedown is prepared.

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
- Product-first testing: CAE is tested with Astra from the start; a bounded pass-through/control segment precedes any promoted optimization default.
- 5-hour and weekly limits are separate authorities when exposed.
- Missing rate-limit data is unknown, never guessed.
- Local-first privacy is mandatory.

## Astra Plus availability checkpoint

Operator observation on 2026-09-04:

- Astra appeared in the native `/model` picker on the test ChatGPT Plus account at approximately 18:44 Central Time.
- A later `/status` screenshot at approximately 19:41 Central Time showed Codex `0.153.2`, active Sol High, 99% of the 5-hour allowance remaining, 18% weekly remaining, and two usage-limit resets available.
- The screenshot does not establish the exact Astra model id or Astra-specific quota-authority shape because Astra was not active in it.

Authority: `receipts/astra-plus-availability-observation-2026-09-04.md`.

Astra rollout waiting is therefore no longer the blocker. The immediate blocker is **current-version live integration capture and Window 0 readiness**.

## Campaign policy

Three stages are planned, but only two clean serious 5-hour campaigns:

1. **Window 0:** use only the currently remaining allowance before any banked reset to prove live Astra identity, quota authority, hooks, receipts, and bounded product work.
2. **Window 1:** after fixes/hardening, use one banked reset for a clean early-release campaign beginning from a documented full allowance state.
3. **Window 2:** after another hardening phase, wait for the next normal 5-hour availability and run release-candidate validation.

The second banked reset is intentionally not part of the release-test sequence.

Operational authority: `docs/ASTRA_WINDOW_0_SHAKEDOWN.md` and `docs/ASTRA_PLUS_TEST_PLAN.md`.

## Native runtime validation authority

`receipts/native-runtime-validation-final-2026-09-04.md` remains the authoritative A-F runtime receipt for Codex `0.149.0`.

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

## Current-version drift gate

The test environment now reports Codex `0.153.2`, newer than the authoritative `0.149.0` A-F validation.

Before any Astra inference, re-run on the current runtime:

```text
npm test
npm run check
CAE_CODEX_COMMAND=/usr/bin/codex cae doctor
CAE_CODEX_COMMAND=/usr/bin/codex cae probe
CAE_CODEX_COMMAND=/usr/bin/codex cae readiness
CAE_CODEX_COMMAND=/usr/bin/codex cae quota
```

Do not assume app-server, model-list, hook, or launcher behavior is unchanged merely because the previous version passed.

## Previous Plus quota shape observed

The earlier signed-in Plus account state on Codex `0.149.0` exposed:

- 300-minute 5-hour window;
- 10,080-minute weekly window;
- one shared/default `codex` quota bucket;
- `normalModelSlug=null`;
- no model-specific quota bucket in that observed state;
- purchased-credit snapshot with `hasCredits=false`, `unlimited=false`, balance `"0"`;
- reset-credit summary;
- Astra absent from the catalog at that time.

That quota shape is historical evidence, not authority for the newly available Astra runtime. Window 0 must capture the launch-time Astra shape again.

## Termux launcher compatibility

Runtime validation found one portability issue:

- direct CAE spawning of the standalone musl Codex binary could not resolve DNS because that environment had no usable `/etc/resolv.conf`;
- the user's normal `/usr/bin/codex` wrapper succeeded with the same binary, Codex home, and ChatGPT auth because its proot environment supplied working resolver state.

Issue #6 tracks this as launcher equivalence rather than an auth/protocol problem.

Implemented:

- `CAE_CODEX_COMMAND` can select the same executable/wrapper the user normally launches;
- explicit programmatic selection takes precedence over the environment override;
- ordinary platforms retain `codex` / `codex.cmd` defaults;
- the same resolved launcher is used for app-server reads and Codex version reporting;
- the value is treated as one executable path/name, not a shell command.

Issue #6 remains open until `cae doctor`, `cae probe`, `cae readiness`, and `cae quota` pass locally through `/usr/bin/codex` on the current Termux/Codex runtime.

## Technical foundation

Implemented:

- exact configured Astra-model targeting with strict non-Astra no-op behavior;
- fail-open hook handler;
- privacy-minimal local observations using opaque SHA-256 session/turn correlation keys;
- no raw prompt, assistant response, cwd, transcript path, or raw session/turn id in baseline events;
- non-destructive hook merge/removal with idempotence coverage;
- atomic setup/uninstall honoring `CODEX_HOME`;
- `cae doctor`, `probe`, `readiness`, `quota`, `events`, setup/uninstall dry-runs, and private target controls;
- native Codex app-server client for `account/rateLimits/read` and `model/list`;
- duration-based 300-minute / 10,080-minute normalization;
- explicit missing, malformed, partial, and conflicting quota states;
- reset-aware before/after allowance deltas;
- purchased-credit/reset-credit preservation without invented units;
- model-aware quota authority selection using exact `normalModelSlug` when available and labeled `shared_default` otherwise;
- zero-inference readiness summary that refuses target authority when the model catalog is incomplete;
- receipt schema v3 with campaign and cause classification plus task shape, outcome quality, intervention burden, tool classes, and quota deltas;
- measurement evidence hierarchy in `docs/MEASUREMENT_MODEL.md`;
- early Astra Pro usage evidence in `docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md`;
- prior-art authority in `docs/PRIOR_ART.md`.

## Validation status

- Window 0 prep PR #7 CI run #86: **PASS**.
- Ubuntu Node 20: **PASS**.
- Ubuntu Node 22: **PASS**.
- Windows Node 22: **PASS**.
- macOS Node 22: **PASS**.
- Real installed Codex A-F runtime validation: **PASS on Termux/Codex 0.149.0; CURRENT 0.153.2 REVALIDATION REQUIRED**.
- Signed-in Plus app-server quota read: **PASS historically through the working wrapper; current-version revalidation required**.
- Side-by-side app-server read with active Codex: **PASS on 0.149.0**.
- Live exact-target hook observation: **PASS on Sol target; production Astra target still requires live capture**.
- Live non-target strict no-op: **PASS on 0.149.0; repeat around Astra Window 0**.
- Setup ownership/uninstall: **PASS on 0.149.0**.
- Launcher override implementation: **CODE/CI PASS; TERMUX CURRENT-RUNTIME ACCEPTANCE PENDING**.
- Astra visible in native picker on Plus: **OPERATOR OBSERVED**.
- Exact native Astra picker/runtime identity: **READY TO CAPTURE**.
- Native Astra quota-authority shape: **READY TO CAPTURE**.
- Astra efficiency improvement: **NOT YET CLAIMED**.

## Immediate execution queue

1. Merge Window 0 preparation after the green PR #7 cross-platform CI result is accepted.
2. Revalidate current Codex `0.153.2` locally with `CAE_CODEX_COMMAND=/usr/bin/codex` using `cae doctor`, `cae probe`, `cae readiness`, and `cae quota`.
3. Close Issue #6 only if that local launcher acceptance passes without the previous manual workaround.
4. Run Gate G without spending unnecessary Astra inference: native catalog candidate -> exact target config -> native picker/active model identity -> exact hook identity -> quota-authority selection.
5. Run Window 0 under Issue #8 using only the remaining pre-reset allowance.
6. Turn Astra off; fix/harden with Sol/Luna/Hermes/CI.
7. Freeze the Window 1 candidate, then use one banked reset for Issue #5's clean early-release campaign.
8. After Window 1, harden again without Astra.
9. Wait for the next normal 5-hour availability and run Window 2 release-candidate validation.
10. Publish v0.1 only after `docs/RELEASE_CRITERIA.md` passes.

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

CAE is **Astra-live but not yet Astra-validated**. Cross-platform CI now includes macOS and is green. The next blocker is current Termux/Codex `0.153.2` zero-inference acceptance before the controlled Window 0 live Astra task.
