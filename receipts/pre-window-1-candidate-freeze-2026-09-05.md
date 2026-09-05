# Pre-Window-1 Candidate Freeze — 2026-09-05

Zero Codex model inference consumed in this phase. No banked reset consumed.

## WINDOW 0

- closed: yes (2026-09-05; PR #12 merged at `6fb5cff`)
- banked resets consumed: 0
- remaining resets: 2

## TASK 2 MEASUREMENT CORRECTION

5h: UNAVAILABLE — RESET_CROSSED / NO SAME-WINDOW PRE-TURN BASELINE.
The baseline snapshot (95% remaining, resetsAt 1788601794 =
2026-09-05T09:49:54Z) belongs to the window that expired ~1.4h before the
live turn (UserPromptSubmit 2026-09-05T11:15:23Z). The after snapshot
(93%, resetsAt 1788624929) belongs to the new window. Searched
authoritatively: /tmp/cae-window0-task2* (Ubuntu rootfs), repository
receipts, and the coordination session message store — only the two
boundary snapshots exist; no snapshot with resetsAt == 1788624929 predates
the turn. The 95%→93% (2pt) difference is a cross-window difference and
must not be read as Task 2 turn burn. (The turn itself ran entirely inside
the new window; only a same-window pre-turn snapshot could quantify it,
and none exists.)

weekly: 1pt (15% → 14%; reset epoch 1788793830 unchanged).

reset crossing: 5h resetsAt 1788601794 → 1788624929 between the baseline
snapshot (2026-09-05T07:29:09Z) and the after capture (2026-09-05T11:23Z);
weekly epoch stable.

authority: shared_default / key default / limitId codex — unchanged across
snapshots; model-aware delta logic already refuses authority changes.

## SANDBOX

rootfs writes: VALIDATED (Task 2: intended 3-file patch landed exactly,
61 insertions / 0 deletions; revalidation: create/verify/delete probe PASS;
no write failure on either rootfs task).

transient 182: 2 occurrences at Task 2 session start on early exploratory
reads (empty output), both recovered by retry within the turn. Task 1
raw evidence preserved (Android-mounted WRITE failures); Task 2 raw
evidence preserved (read-side transients).

classification: INTERMITTENT CODEX/RUNTIME TOOL FAILURE — RECOVERED.
NOT release-blocking unless persistent or causing failed useful work.
sandbox-helper 182 is NOT universally eliminated; rootfs does not claim to
eliminate it; Android mount is not claimed as sole cause; not proven a CAE
defect.

## RELEASE CRITERIA

proven: 30 of 46 boxes (docs/RELEASE_CRITERIA.md audit of 2026-09-05):
native workflow 3/6, usage visibility 7/7, campaign evidence 5/10,
efficiency claims 0/7 (by design — none default-enabled), privacy 6/6,
reliability 9/10.

partial: non-Astra live no-op recheck (unit-covered only); install/uninstall
documentation (tested, not publicly documented).

remaining (release-critical, pre-v0.1):
- A. public install/uninstall documentation — WINDOW_1_REQUIRED
- B. live strict non-Astra no-op evidence — WINDOW_1 candidate
- C. unsupported Codex-version behavior — WINDOW_1_REQUIRED
- D. hostile corrupt/malformed CAE state beyond fixtures — WINDOW_1
  candidate (fixture-level safe-fail proven: corrupt config.json degrades
  to config_unreadable warning; config-as-directory same; file-as-state-dir
  throws clean EEXIST without data corruption; tested live 2026-09-05)
- E. normal permissions/tools/plan workflow compatibility — WINDOW_1_REQUIRED
- F. Termux support boundary declared explicitly (codexu authoritative,
  native Termux NOT claimed until Issue #9) — DONE in this freeze
  (README + RELEASE_CRITERIA + this receipt)

## SUPPORT SURFACE

codexu: AUTHORITATIVE (Ubuntu-under-Termux, `/root/.local/bin/codex`,
Codex 0.153.2). codexu health IS a Window 1 gate.

native Termux: separate compatibility lane under Issue #9. NOT a Window 1
campaign blocker. NOT publicly claimed until Issue #9 passes. Before
public v0.1: either Issue #9 passes or native Termux is explicitly outside
the declared support surface.

## WINDOW 1

candidate model: gpt-6-astra
reasoning: low (native production default; supersedes old Issue #5
"Start at Medium" — coordination comment posted 2026-09-05,
issues/5#issuecomment-5551813334)
CAE mode: PASS-THROUGH / OBSERVE-ONLY CONTROL (no speculative optimization
default; control task first; intervention only after control evidence)
candidate reset policy: exactly one banked reset planned for Window 1;
second banked reset remains untouched
control policy: genuine needed repository work; substantial; bounded;
not cheap-selected; no web-research dependence if avoidable; not
already-known answers; objective validation possible; representative of
real delegated professional work. Exact live control task NOT yet selected
(selection rules frozen in docs/WINDOW1_CANDIDATE_FREEZE.md).

## NO EFFICIENCY CLAIM: true

Window 0 produced integration and correctness fixes only. No efficiency
intervention was validated. None is claimed.

## Zero-inference gap review (Phase 9)

Verdict: PASS / NO CHANGE. Probed without model inference: corrupt
config.json (config_unreadable warning, no crash); config.json as
directory (same safe degradation); state-dir path as file (clean EEXIST
throw, no corruption); nested state-dir creation OK; unknown CLI command
(help text, exit 0 — acceptable for a private dev CLI); `cae target set`
accepts arbitrary ids by design (validation control, gated by readiness
ambiguity checks before live use); reset-crossing delta behavior and
authority-change behavior already unit-covered (does not call a
reset-crossing change usage burn; limitId change invalidates). No
release-critical defect found; no speculative refactor performed.

## Validation performed in this phase

- npm test: 85 tests, 84 pass, 0 fail, 1 platform skip (Ubuntu rootfs:
  PASS; Termux-side checkout: PASS)
- npm run check: PASS
- git diff --check: clean
- Worktree clean at freeze commit

## RESET AUTHORIZATION BOUNDARY

The banked reset is NOT executed. Window 1 is NOT started. The
user/coordination session must explicitly authorize spending the first
banked reset after reviewing this receipt.

ASTRA USED: NO
OTHER CODEX INFERENCE: NO
BANKED RESET CONSUMED: 0
RESET CREDITS REMAINING: 2
