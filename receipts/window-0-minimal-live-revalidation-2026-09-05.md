# Window 0 Minimal Live Revalidation — 2026-09-05

PASS. One real Astra turn from the rootfs workspace after hook-path hardening.

## Timing

- before: 2026-09-04T23:46:34-05:00 (quota 100% / 16%)
- after: 2026-09-05T00:03:32-05:00 (quota 97% / 15%)
- duration: ~17 min wall (single live turn + user /status read)

## Model

- model: gpt-6-astra (exact native id, display GPT-6-Astra)
- reasoning: low (native default)
- Fast: UNKNOWN (not explicitly exposed; left unchanged per contract)
- subagents: 0

## Allowance (native CAE quota, authoritative)

- authority: shared_default
- key: default
- limitId: codex
- 5h before: 100% remaining (used 0%)
- 5h after: 97% remaining (used 3%)
- 5h burn: 3pt
- 5h reset epoch: 1788601594 (stable window, no reset crossing)
- weekly before: 16% remaining (used 84%)
- weekly after: 15% remaining (used 85%)
- weekly burn: 1pt
- weekly reset epoch: 1788793830 (unchanged)
- reset credits before: 2
- reset credits after: 2 (untouched)

## Real hook observations

Two newly persisted real events (before-state was empty: "No Astra observations recorded"):

- UserPromptSubmit: model gpt-6-astra, opaque sessionKey + turnKey
- Stop: model gpt-6-astra, same opaque sessionKey, same opaque turnKey
- correlation: session-stable TRUE, turn-stable TRUE, keys 64-hex opaque
- privacy: no raw prompt, response, session id, turn id, cwd, transcript, source, or account fields; raw_field_leaks NONE

## Rootfs sandboxed writes

- workspace: /root/work/codex-astra-efficiency
- probe create (apply_patch, exact content CAE_WINDOW0_WRITE_OK): SUCCEEDED
- probe verify (content read-back): SUCCEEDED
- probe delete (apply_patch): SUCCEEDED
- probe leftover (.cae-window0-write-probe absent): PROBE_CLEAN_PASS
- session log (54 lines, task_complete): zero failed statuses, zero nonzero exits, zero permission-denied; "182" mentions are contract text only
- sandbox-helper 182: NONE
- worktree: clean (git status empty aside from this receipt cycle, git diff --check clean)

This strongly supports the Android-mounted workspace as the contributor to the
Task 1 write failure; not claimed as sole-cause proof.

## Product hook-command readiness

- cae doctor: hooks installed, hookCommand available=true, reason=null, target [gpt-6-astra]
- cae readiness: ready_for_live_hook_capture, no false hook_command_unavailable
- hook binary: /data/data/com.termux/files/usr/bin/cae -> /root/work checkout, mode 755

## Validation

- npm test: 68/68 PASS
- npm run check: PASS
- git diff --check: clean
- commit: hook-command product fix (src/hook-command.js, test/hook-command.test.js, readiness gate, doctor/readiness wiring)

## Inference / resets

- Astra turns after the single revalidation turn: NO
- Other Codex model inference: NO (/status read only, native, no work turn)
- Banked reset consumed: NO

## Decision

PASS. Window 0 infrastructure revalidation complete. Task 2 may be reconsidered by coordination. No Task 2 started.
