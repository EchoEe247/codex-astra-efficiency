# Window 1 Candidate Freeze — 2026-09-05

Pre-Window-1 hardening branch: `pre-window1/candidate-freeze` (PR #13).

## Candidate SHA

- Tested merge base: `7a0c3eb3c1f06e3fad0e1ce2bcac80b15c181802` (PR #13 merge;
  full CI matrix green — Ubuntu Node 20/22, Windows Node 22, macOS Node 22;
  local suite 85/84/0/1; npm run check PASS; worktree clean on both the
  Termux-side and rootfs checkouts).
- Candidate: the FINAL TESTED DOCUMENTATION COMMIT on main that records this
  freeze, pinned by branch **`window1/candidate`**.
- Original frozen candidate SHA: `2025274d51b082c0bdbb96a0d8106f3df28ac45b`.
- **STATUS UPDATE:** a post-freeze/pre-reset Astra audit later confirmed a
  release-critical readiness defect in this candidate: `cae readiness` can
  report `ready_for_live_hook_capture` even when the CAE native hooks are not
  installed, because `readinessProbe()` reports `nativeHooks` separately but
  `summarizeAstraReadiness()` does not gate the status on that native-hook
  installation state. The original candidate is therefore **not authorized for
  the Window 1 reset/control until this defect is fixed, regression-covered,
  cross-platform green, and a replacement candidate is frozen**. The banked
  reset remains unspent.

## Candidate contract

- MODEL: `gpt-6-astra` (exact native id observed in Window 0).
- DEFAULT REASONING: `low` (production native default; supersedes the old
  Issue #5 "Start at Medium" wording).
- MODEL SELECTION: native `/model` only. No routing, no substitution.
- FAST: off if explicitly available; otherwise record UNKNOWN.
- SUBAGENTS: normal task behavior may be allowed only according to the
  Window 1 task contract; do not manipulate them merely to create favorable
  usage numbers.
- CAE STARTING MODE: PASS-THROUGH / OBSERVE-ONLY CONTROL. Window 0 produced
  integration and correctness fixes; it did NOT validate an efficiency
  intervention. Window 1 begins with a genuine substantial control task
  while CAE measures normal Astra behavior. Only after control evidence may
  an intervention be considered. No speculative "optimization" by default.
- PRIVACY: local only; no raw prompt/source/transcript/account identity.
- QUOTA: 5h and weekly separate; reset crossing => UNAVAILABLE rather than
  guessed; authority must remain stable.
- RUNTIME: ubuntu_in_termux / codexu; workspace `/root/work/codex-astra-efficiency`.
- RESET POLICY: exactly one banked reset planned for Window 1; the second
  banked reset remains untouched and is not part of the release-test sequence.

## Control task selection rules

Do NOT choose a toy benchmark. Do NOT choose another artificial CAE
self-test unless there is a real product need. The exact live control task
is NOT selected in this freeze if another project/repository is likely to
provide more genuine needed work.

A qualifying control task must be:

- genuine needed repository work;
- substantial enough to exercise normal Astra autonomy;
- bounded enough that success/failure is interpretable;
- not selected merely because it is cheap;
- not dependent on web research if avoidable;
- not a task whose answer is already known;
- capable of objective validation/tests;
- representative of work an ordinary/professional Codex user would delegate.

## Support surface at freeze

- codexu (Ubuntu-under-Termux): authoritative; codexu health IS a Window 1 gate.
- Native Termux Codex: separate lane (Issue #9); NOT a Window 1 blocker;
  NOT claimed publicly until Issue #9 passes.

## Window 0 measurement corrections carried into this freeze

- Task 2 5h burn: UNAVAILABLE — RESET_CROSSED / NO SAME-WINDOW PRE-TURN
  BASELINE.
- Task 2 weekly burn: 1pt.
- Sandbox 182: INTERMITTENT CODEX/RUNTIME TOOL FAILURE — RECOVERED, NOT
  RELEASE-BLOCKING; rootfs writes validated; read-side 182 not eliminated,
  not proven a CAE defect.

## Release-criteria status at original freeze

30 of 46 boxes checked as PROVEN. The post-freeze audit adds a confirmed
release-critical readiness defect that must be corrected before Window 1
reset/control. No Astra efficiency claim is validated or enabled.
