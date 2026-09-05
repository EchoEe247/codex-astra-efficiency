# Project State

Last updated: 2026-09-05

## Current phase

**WINDOW 0 TASK 1 + LIVE REVALIDATION COMPLETE / TASK 2 PREPARATION**

Non-inference status:

- PR #11 (Windows hook-command hardening) merged to main: merge commit `0a22a2a4f37fdb8572a3307bdcb13e2c71d9e6da`.
- Windows CI PASS on the merged head; full matrix (Ubuntu Node 20/22, Windows Node 22, macOS Node 22) green.
- Window 0 minimal live revalidation PASS (see history below).
- limitId stability fix merged and regression-covered.
- Real hook capture PASS (`UserPromptSubmit` + `Stop`, exact `gpt-6-astra`).
- Rootfs sandboxed writes PASS (create/verify/delete, no sandbox-helper 182).
- Task 1 outcome: PARTIAL but useful — hook-path executable-mode defect found and fixed, limitId fix validated, live hook path proven.
- Banked resets: still 2 available; 0 consumed during revalidation.
- Task 2 (setup/uninstall safety) is authorized for consideration as the intended final substantive Window 0 task.
- No Astra efficiency claim has been made yet; none may be claimed from revalidation data alone.

Pre-live Task 2 contract: `docs/WINDOW0_TASK2_CONTRACT.md`. Task 2 executes with one live Astra turn only after the Task 2 branch is green, CAE is linked to the Task 2 checkout, and readiness is `ready_for_live_hook_capture`.

Receipts: `receipts/window-0-live-task-1-2026-09-04.md`, `receipts/window-0-minimal-live-revalidation-2026-09-05.md`.

## Historical: Task 1 blocked status (superseded 2026-09-05)

Task 1 outcome: PARTIAL. 5h burn 7pt (93 -> 86), weekly burn 1pt (17 -> 16). Hooks captured 0 events despite installed config. limitId defect confirmed via Astra finding. No banked reset consumed. Task 2 was BLOCKED pending hook-path revalidation — that block is lifted by the live revalidation PASS recorded below.

## Locked product direction

- ChatGPT Plus first.
- Codex first.
- Astra only.
- Everyday Codex users through professional developers are the primary audience.
- Preserve native Codex model selection and normal agent workflow.
- CAE must remain a strict no-op for non-Astra models.
- Core v0.x does not silently route Astra work to cheaper models.
- Efficiency means reducing avoidable Astra burn while preserving useful real work.
- Product-first testing: test CAE with Astra, not Astra in isolation.
- 5-hour and weekly windows are measured separately.
- Missing or ambiguous quota data stays unknown; never guess.
- Local-first privacy is mandatory.

## Live Astra authority

Zero-inference preflight authority:

- runtime: `ubuntu_in_termux / codexu`;
- Codex: `0.153.2`;
- working launcher: `/root/.local/bin/codex`;
- exact native Astra model id: `gpt-6-astra`;
- native display name: `GPT-6-Astra`;
- native default reasoning: `low`;
- supported reasoning: `low`, `medium`, `high`, `xhigh`, `max`, `ultra`;
- model catalog: complete, 6 entries, one Astra candidate;
- Plus quota authority: `shared_default`;
- `limitId=codex`;
- `normalModelSlug=null`;
- preflight 5-hour remaining: 96%;
- preflight weekly remaining: 18%;
- reset credits available: 2;
- banked resets consumed by preflight: 0.

Receipt: `receipts/window-0-zero-inference-preflight-codexu-2026-09-04.md`.

The shared-default authority means unrelated Codex work on the same account can contaminate Window 0 deltas. Keep other Codex usage idle during controlled Astra tasks.

## Runtime distinction

### Authoritative Window 0 runtime

`codexu` is an alias that enters Ubuntu 24.04.4 under Termux/PRoot and directly executes `/root/.local/bin/codex`.

The Ubuntu environment inherits a Termux PATH entry, so bare `codex` can resolve to the Termux-side wrapper. Window 0 therefore uses the absolute `/root/.local/bin/codex` path for CAE app-server reads.

### Native Termux Codex

Native Termux Codex is a separate compatibility lane. It was observed read-only at version `0.153.4` but was not repaired or validated during Window 0 preparation.

Native Termux support is tracked in Issue #9 and must not be claimed publicly until that issue passes. Its historical instability must not block Astra testing in the known-good `codexu` environment unless the same defect reproduces there.

## Campaign policy

Three stages are planned, but only two clean serious 5-hour campaigns:

1. **Window 0:** use only the remaining pre-reset allowance for live identity/hook/receipt validation and one or two bounded real CAE tasks.
2. **Window 1:** after hardening, use one banked reset for a clean early-release campaign from a documented full allowance state.
3. **Window 2:** after further hardening, wait for the next normal 5-hour availability and run release-candidate validation.

The second banked reset is intentionally outside the release-test sequence.

Operational authorities:

- `docs/ASTRA_WINDOW_0_SHAKEDOWN.md`
- `docs/ASTRA_PLUS_TEST_PLAN.md`
- Issue #8 — Window 0
- Issue #5 — Window 1
- Issue #9 — native Termux compatibility

## Validation status

### Cross-platform source/CI

- Ubuntu Node 20: **PASS**
- Ubuntu Node 22: **PASS**
- Windows Node 22: **PASS**
- macOS Node 22: **PASS**

### codexu current-runtime zero-inference gate

Repository commit tested: `41c8a2af2f7478b4c5091eff38edbc6f331aaedb`

- Node `24.18.0`: **PASS**
- npm `11.19.1`: **PASS**
- `npm test`: **PASS — 57/57**
- `npm run check`: **PASS**
- CAE `doctor`: **PASS**
- CAE `probe`: **PASS**
- CAE `readiness`: **PASS as `target_configuration_required`**
- CAE `quota`: **PASS**
- exact native Astra discovery: **PASS**
- complete model catalog: **PASS**
- shared-default quota authority: **PASS / understood**
- privacy check: **PASS**
- Astra inference used: **0**
- banked resets used: **0**

### Remaining Window 0 gates

- exact target configuration: **DONE (revalidated live 2026-09-05)**
- readiness after target set: **DONE — `ready_for_live_hook_capture`**
- hook dry-run/setup: **DONE (installed, ownership reviewed)**
- live Astra `UserPromptSubmit`/`Stop` identity: **DONE — PASS (revalidation)**
- live non-Astra no-op recheck: **covered by unit tests; live recheck optional before release**
- first bounded real Astra task: **Task 1 done (PARTIAL); Task 2 authorized as final substantive Window 0 task**
- first Window 0 run receipt: **DONE — `receipts/window-0-minimal-live-revalidation-2026-09-05.md`**
- Astra efficiency improvement: **NOT YET CLAIMED**

## Launcher issue disposition

Issue #6's implementation goal is satisfied for the authoritative `codexu` runtime: CAE can use the actual working launcher `/root/.local/bin/codex`, and `doctor`, `probe`, `readiness`, and `quota` all pass through it.

This acceptance is explicitly scoped to `codexu`; it is not evidence that native Termux Codex is healthy. Native Termux remains Issue #9.

## Reasoning policy update

Pre-launch planning assumed Medium as a conservative starting point. Native discovery now shows the production Astra picker default is `low`.

Window 0 should therefore begin the first real task at the native default `low`, not silently override the product default to Medium. Escalation to `medium` or above should occur only when the task demonstrates a concrete reasoning limitation. `xhigh`, `max`, and `ultra` are not burn-probe settings and should not be selected merely to measure consumption.

This keeps the first live CAE shakedown representative of how ordinary Codex users encounter Astra.

## Hardening after Task 1 (non-Astra, 2026-09-05)

Root causes found without any model inference:

1. Hook PATH/exec gap: hook command `cae hook --cae-owned` resolved inside
   codexu to a global install whose `bin/cae.js` carried mode 600, so the
   sandboxed hook handler could not execute (permission denied). Absolute-path
   `node ./bin/cae.js hook` worked; bare `cae` failed before chmod 755 and
   passed after, in both Termux and Ubuntu. Session log shows no hook dispatch
   entries, consistent with handler launch failure rather than an Astra defect.
2. limitId stability: `calculateModelUsageDelta` treated kind+key match as
   stable even when `limitId` changed. Fixed to also invalidate on limitId
   change, with a regression test.
3. Sandbox 182: both Astra patch attempts failed as
   `apply_patch verification failed ... fs sandbox helper failed with status
   exit status: 182` when reading/writing the Android-mounted workspace path
   `/data/data/com.termux/files/home/codex-astra-efficiency`. Reads and exec
   worked; only sandboxed file writes failed. Disposable rootfs clone prepared
   at `/root/work/codex-astra-efficiency` for future live validation.

Product gap recorded: `node ./bin/cae.js setup` reported hooks installed
without proving the configured hook executable callable. Recommended minimal
pre-Window-1 change: `cae doctor`/`readiness` must verify the configured hook
command resolves and is executable.

~~Task 2 remains BLOCKED pending one minimal live revalidation turn from the
rootfs workspace after hook-path fix.~~ Superseded: the live revalidation turn
below passed, and Task 2 is now authorized for consideration.

## Window 0 minimal live revalidation — PASS (2026-09-05)

**WINDOW 0 MINIMAL LIVE REVALIDATION PASS.**

One real Astra turn (`gpt-6-astra`, reasoning `low`, 0 subagents) from
`/root/work/codex-astra-efficiency`:

- real `UserPromptSubmit` + `Stop` persisted, exact model, opaque session/turn
  correlation stable, privacy clean;
- rootfs sandboxed writes proven: probe created with exact content
  `CAE_WINDOW0_WRITE_OK`, verified, removed via `apply_patch`;
- no sandbox-helper 182; worktree clean afterward;
- quota: 5h 100% -> 97% (3pt burn), weekly 16% -> 15% (1pt burn),
  authority `shared_default/default/limitId=codex`, reset credits 2 untouched;
- product fix validated: `cae doctor`/`readiness` confirm hook command
  callable, no false `hook_command_unavailable`;
- `npm test` 68/68, `npm run check` clean.

Receipt: `receipts/window-0-minimal-live-revalidation-2026-09-05.md`.

Real Astra hook path is now proven after executable-mode remediation.
limitId fix remains validated. Task 2 may now be reconsidered by
coordination. No banked reset consumed. No Task 2 started.

## Historical: immediate execution queue (superseded 2026-09-05)

The pre-revalidation queue below is complete/superseded. Steps 1–7 are done
(merge, exact target configuration, readiness, hook install, live hook
identity, receipt). It is retained for history only.

1. Merge the live-preflight authority update after CI passes.
2. In `codexu`, configure exactly `gpt-6-astra` using the native-discovery command.
3. Re-run `cae readiness`; require `ready_for_live_hook_capture`.
4. Run `cae setup --dry-run`, review ownership, then install the CAE hooks.
5. Keep all other Codex usage idle while the shared meter is being measured.
6. Select Astra normally through `/model` and use native default reasoning `low` for the first bounded real task.
7. Capture the live Astra hook identity and the full before/after Window 0 receipt.
8. If weekly burn is small and interpretable, consider one second bounded task; otherwise stop Astra and harden with non-Astra tools.
9. After Window 0, fix/disposition defects with Sol/Luna/Hermes/CI.
10. Freeze the Window 1 candidate before using one banked reset.

## Current queue: Window 0 Task 2 preparation

1. Task 2 branch `window0/task2-install-safety` green locally (`npm test` ~83, `npm run check`).
2. `npm link` the Task 2 checkout so the live CAE CLI is this checkout.
3. `cae doctor` and `cae readiness` must pass through `/root/.local/bin/codex` with hook command available, hooks installed, and `ready_for_live_hook_capture`.
4. Capture the fresh Task 2 baseline (`cae quota`, `cae events`) immediately before the single live turn.
5. One live Astra turn executes `docs/WINDOW0_TASK2_CONTRACT.md` (setup/uninstall safety audit, at most one defect fix).
6. Capture the after-state, verify hooks/privacy/worktree, compute 5h and weekly burn separately.
7. Task 2 is the intended final substantive Window 0 task regardless of outcome; harden afterward without Astra. No Window 1 start; no banked reset.

## Explicitly deferred

- Native Termux repair beyond Issue #9.
- Work support.
- General Codex model optimization.
- Luna/Sol/Terra routing.
- Multi-provider orchestration.
- Cloud telemetry.
- Dashboard/UI work.
- Automatic public receipt upload.
- Advanced agent framework features.

## Release posture

CAE is **live-Astra validated** (revalidation PASS, 2026-09-05): exact target, hook capture, and rootfs sandboxed writes are proven on the authoritative runtime. Not yet claimed: any Astra efficiency improvement. Next: Window 0 Task 2 (setup/uninstall safety, one live turn), then non-Astra hardening only. Window 1 waits for a banked reset decision.
