# Project State

Last updated: 2026-09-05

## Current phase

**WINDOW 0 COMPLETE / PRE-WINDOW-1 HARDENING**

Window 0 is CLOSED. No more Astra inference belongs to Window 0. All
substantive Window 0 evidence:

### Window 0 evidence

**Task 1** (receipt `receipts/window-0-live-task-1-2026-09-04.md`):
- PARTIAL but useful.
- 7pt 5h burn, 1pt weekly burn.
- Found the limitId authority bug (kind+key match wrongly treated as stable).
- Exposed the hook executable/setup gap (global install bin mode 600 → hooks
  never fired).
- Exposed the Android-mounted sandbox write failure (sandbox-helper 182).

**Non-Astra hardening** (2026-09-04/05, zero inference):
- limitId stability fix merged (regression-covered).
- Hook command readiness added to `cae doctor`/`readiness` (probe `--help`,
  never fires hooks).
- Windows portability fixed (PR #11: platform path semantics, PATHEXT
  injection, ComSpec dispatch for `.cmd`/`.bat`).
- Rootfs workspace `/root/work/codex-astra-efficiency` adopted for live work.

**Minimal live revalidation** (receipt `receipts/window-0-minimal-live-revalidation-2026-09-05.md`):
- PASS.
- 3pt 5h burn, 1pt weekly burn.
- Real `UserPromptSubmit` + `Stop` hooks PASS; privacy PASS.
- Rootfs sandboxed writes PASS (create/verify/delete; no sandbox-helper 182).

**Task 2** (receipt `receipts/window-0-task-2-2026-09-05.md`):
- PASS. Final substantive Window 0 task (setup/uninstall safety).
- 5h burn: UNAVAILABLE — RESET_CROSSED (old-window snapshot 95% @1788601794,
  after snapshot 93% @1788624929; no same-window pre-turn baseline; the 2pt
  numerical difference is NOT a Task 2 burn). Weekly burn 1pt (15%→14%,
  epoch 1788793830 stable).
- Uninstall ownership defect found and fixed (unrelated empty hook groups and
  event arrays were deleted without CAE ownership); two focused regressions.
- Setup idempotence PASS; no scope expansion; no rework.
- Cross-platform CI PASS on PR #12 (Ubuntu Node 20/22, Windows Node 22,
  macOS Node 22) — including the Windows validation Astra recommended.

**Banked resets: 2 remaining; 0 consumed by Window 0.**

### Next phase

PRE-WINDOW-1 HARDENING / CANDIDATE FREEZE — **COMPLETE (2026-09-05)**.

- PR #13 (pre-window1/candidate-freeze) merged at `7a0c3eb3c1f06e3fad0e1ce2bcac80b15c181802`; CI green on Ubuntu Node 20/22, Windows Node 22, macOS Node 22.
- Task 2 5h burn corrected to UNAVAILABLE — RESET_CROSSED / NO SAME-WINDOW PRE-TURN BASELINE (weekly 1pt stands).
- Sandbox 182 classified INTERMITTENT CODEX/RUNTIME TOOL FAILURE — RECOVERED (not release-blocking; rootfs writes validated; 182 not universally eliminated).
- Release criteria reconciled: 30/46 proven; remaining gaps A (public install/uninstall docs), C (unsupported Codex-version behavior), E (normal permissions/tools/plan workflow) are WINDOW_1_REQUIRED; B (live non-Astra no-op) and D (hostile state edges beyond fixtures) are WINDOW_1 candidates; F (Termux boundary) declared explicitly.
- Support boundary declared: codexu authoritative (Window 1 gate); native Termux NOT claimed until Issue #9 passes.
- Window 1 reasoning policy: control starts at `low` (native default; old Issue #5 "Start at Medium" superseded — coordination comment 5551813334).
- Candidate frozen: `docs/WINDOW1_CANDIDATE_FREEZE.md`; branch `window1/candidate` pinned to the final tested main commit; receipt `receipts/pre-window-1-candidate-freeze-2026-09-05.md`.

Window 1 remains gated on: explicit banked-reset authorization by coordination. One banked reset is planned for Window 1; the second stays untouched.

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
- live Astra `UserPromptSubmit`/`Stop` identity: **DONE — PASS (revalidation + Task 2)**
- live non-Astra no-op recheck: **covered by unit tests; live recheck optional before release**
- first bounded real Astra task: **DONE — Task 1 (PARTIAL), revalidation (PASS), Task 2 (PASS)**
- first Window 0 run receipt: **DONE — revalidation + `receipts/window-0-task-2-2026-09-05.md`**
- Astra efficiency improvement: **NOT YET CLAIMED (and not claimable from Window 0 data)**

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

## Historical: Task 2 preparation queue (superseded 2026-09-05 — Task 2 complete)

All steps executed: Task 2 branch green, checkout linked, doctor/readiness
pass, fresh baseline captured, one live Astra turn executed the contract,
after-state captured, PR #12 green across the full matrix. Retained for
history only.

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

## Post-Freeze Pre-Reset Astra Audit — Recovered (2026-09-05)

A supplemental pre-reset Astra audit was executed at 13:03Z to inspect the frozen candidate's readiness and correctness. The audit finished successfully, but the recovery was interrupted and has been recovered by Gemini CLI.

- **Banked Resets**: 2 remaining (untouched; 0 consumed).
- **Quota Burn**: 15.0% 5h burn (7.0% used before audit to 22.0% used after audit), 2.0% weekly burn (86.0% to 88% used). No separate native Termux Codex session ran during this period.
- **Findings**: 4 defects/gaps were identified and verified via safe non-inference fixtures:
  1. *Readiness live-capture vulnerability (P1)*: Readiness can falsely authorize live capture when hooks are not installed or quota data is empty. (Release-critical; blocks live execution but doesn't invalidate the frozen candidate).
  2. *CLI subprocess spawn error handling (P2)*: Uncaught ENOENT when Codex binary is missing.
  3. *CLI subprocess timeout closure (P2)*: Process kill doesn't close readline interface on stdout.
  4. *Misleading rate-limit delta status on null resets (P2)*: Status "measured" instead of "unavailable" when resetsAt is null.
- **Candidate Impact**: **CANDIDATE_VALID**. The frozen candidate `2025274d51b082c0bdbb96a0d8106f3df28ac45b` remains valid. The findings do not block Window 1 freeze status itself, but represent the immediate post-reset implementation roadmap.

## Release posture

CAE is **live-Astra validated end-to-end** (Window 0 closed 2026-09-05): exact target, real hook capture, rootfs sandboxed writes, and the full setup/uninstall safety audit all pass on the authoritative runtime, with cross-platform CI green. Post-freeze pre-reset Astra audit has been recovered; the old candidate `2025274d51b082c0bdbb96a0d8106f3df28ac45b` was **SUSPENDED** due to P1 readiness gate bug, and the interim candidate `ac194ac1b07e1c334285b797127730ed810bed73` was **SUSPENDED** to complete P2 hardening. All four findings (P1 readiness, P2 spawn error handling, P3 timeout settlement, P4 reset-boundary continuity) have been fully resolved, regression-tested, and merged to main. A final post-audit refreeze is complete; the final replacement candidate `9ee6aaa331590fdb07638fc816a194080b66d9ed` is **VALID** (pinned exactly on branch **`window1/candidate`**). Banked resets remain untouched at **2 remaining** and Window 1 has **not started**. Gaps A–F are explicit, support boundary declared (codexu authoritative; native Termux NOT claimed until Issue #9), and control starts at native-default `low`. Window 1 waits ONLY for an explicitly authorized banked reset (one planned; second untouched).
