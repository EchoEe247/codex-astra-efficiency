# Project State

Last updated: 2026-09-05

## Current phase

**WINDOW 0 COMPLETE / PRE-WINDOW-1 HARDENING — REOPENED AFTER POST-FREEZE AUDIT**

Window 0 remains CLOSED. No more Astra inference belongs to Window 0.

The original Window 1 candidate was frozen at:

`2025274d51b082c0bdbb96a0d8106f3df28ac45b`

A subsequent post-freeze/pre-reset Astra audit used ordinary remaining allowance only (no banked reset) and confirmed a release-critical readiness defect in that candidate. `cae readiness` can report `ready_for_live_hook_capture` while CAE native hooks are not installed because the native-hook installation state is reported separately by `readinessProbe()` but is not part of the status gate in `summarizeAstraReadiness()`.

Therefore:

- original candidate: **SUSPENDED / REFREEZE REQUIRED**;
- Window 1: **NOT STARTED**;
- banked resets consumed: **0**;
- reset credits remaining: **2**;
- previously authorized Window 1 reset: **temporarily suspended until the readiness defect is fixed, regression-covered, CI-green, and a replacement candidate is frozen**.

The post-freeze audit is supplemental pre-reset evidence, not Window 1 control and not Window 1 optimized evidence.

## Immediate queue

1. Preserve the recovered audit receipt and full four-finding disposition.
2. Fix the confirmed native-hook readiness gate without Codex model inference.
3. Add regression coverage proving `ready_for_live_hook_capture` is impossible when CAE native hooks are absent/unreadable.
4. Run full local and cross-platform CI.
5. Merge the hardening change.
6. Freeze a replacement `window1/candidate` on the final tested commit.
7. Only then reconsider the already-planned one-reset Window 1 control.

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

## Window 0 evidence summary

- Task 1: PARTIAL but useful; found limitId authority bug; exposed hook executable/setup gap and Android-mounted sandbox write failure.
- Minimal live revalidation: PASS; real hooks/privacy/rootfs writes proven.
- Task 2: PASS; uninstall ownership defect fixed; setup idempotence and cross-platform CI proven.
- Window 0 banked resets consumed: 0.

## Post-freeze pre-reset audit

Recovered session:
- model: `gpt-6-astra`;
- reasoning: low;
- normal completion;
- no subagents;
- no banked reset used;
- current reset credits remain 2.

Recovered audit classification:
`POST_FREEZE_PRE_RESET_ASTRA_AUDIT`

The audit produced four confirmed findings; one is release-critical: readiness can claim live-hook readiness without requiring the native CAE hooks to be installed. This finding invalidates the original Window 1 candidate as the reset/control authority until fixed and refrozen.

## Support boundary

- codexu (Ubuntu-under-Termux): authoritative live-validation runtime and Window 1 gate.
- Native Termux Codex: separate Issue #9 compatibility lane; not a Window 1 blocker and not publicly claimed until validated.

## Release posture

CAE remains private and pre-release. No Astra efficiency improvement is claimed. Window 1 has not started. The next valid step is zero-inference readiness hardening and candidate refreeze; no banked reset should be consumed before that completes.
