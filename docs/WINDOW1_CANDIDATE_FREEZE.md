# Window 1 Candidate Freeze — 2026-09-05

Pre-Window-1 hardening branch: `pre-window1/candidate-freeze` (PR #13).

## Candidate SHA

- Original tested merge base: `7a0c3eb3c1f06e3fad0e1ce2bcac80b15c181802` (PR #13 merge; full CI matrix green).
- Original frozen candidate SHA: `2025274d51b082c0bdbb96a0d8106f3df28ac45b` on branch `window1/candidate`.
- **CURRENT STATUS: SUSPENDED / REFREEZE REQUIRED.** A post-freeze/pre-reset Astra audit confirmed a release-critical readiness defect in the original candidate: `cae readiness` can report `ready_for_live_hook_capture` even when the CAE native hooks are not installed. `readinessProbe()` reports `nativeHooks` separately, but `summarizeAstraReadiness()` does not gate the readiness status on that native-hook installation state.
- The original candidate MUST NOT be used for the Window 1 reset/control. Fix the defect without Codex model inference, add regression coverage, pass cross-platform CI, then freeze a replacement candidate.
- No banked reset has been used; two reset credits remain.

## Candidate contract retained for replacement freeze

- MODEL: `gpt-6-astra`.
- DEFAULT REASONING: `low` (native default).
- MODEL SELECTION: native `/model` only.
- FAST: off if explicitly available; otherwise record UNKNOWN.
- CAE STARTING MODE: PASS-THROUGH / OBSERVE-ONLY CONTROL; no speculative optimization default.
- PRIVACY: local only; no raw prompt/source/transcript/account identity.
- QUOTA: 5h and weekly separate; reset crossing => UNAVAILABLE rather than guessed; authority must remain stable.
- RUNTIME: ubuntu_in_termux / codexu; workspace `/root/work/codex-astra-efficiency`.
- RESET POLICY: exactly one banked reset planned for Window 1; the second remains untouched.

## Control task selection rules retained

A qualifying control task must be genuine needed repository work, substantial, bounded, objectively validatable, not selected merely because it is cheap, and representative of real delegated professional work. No toy benchmark and no artificial CAE self-test without real product need.

## Support surface

- codexu (Ubuntu-under-Termux): authoritative; codexu health IS a Window 1 gate.
- Native Termux Codex: separate Issue #9 lane; NOT a Window 1 blocker and NOT publicly claimed until validated.

## Window 0 measurement corrections retained

- Task 2 5h burn: UNAVAILABLE — RESET_CROSSED / NO SAME-WINDOW PRE-TURN BASELINE.
- Task 2 weekly burn: 1pt.
- Sandbox 182: intermittent Codex/runtime tool failure, recovered; rootfs writes validated; not proven a CAE defect.

## Post-freeze audit effect

The supplemental Astra audit is PRE-RESET evidence only. It did not start Window 1 and did not consume a banked reset. It confirmed four findings; the native-hook readiness gate is release-critical and invalidates the original candidate until corrected and refrozen.
