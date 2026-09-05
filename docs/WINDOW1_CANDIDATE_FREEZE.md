# Window 1 Candidate Freeze — 2026-09-05

Pre-Window-1 hardening branch: `pre-window1/candidate-freeze` (PR #13) — **SUSPENDED**.
P1 post-audit hardening branch: `hardening/pre-window1-native-hook-readiness` (PR #14) — **MERGED**.

## Refreeze Candidate SHAs

- **OLD_CANDIDATE**: `2025274d51b082c0bdbb96a0d8106f3df28ac45b` (Suspended due to P1 live-capture readiness gate bug identified during the supplemental pre-reset Astra audit)
- **NEW_CANDIDATE**: `cd314fa4a2755c1ab1f79209243e9351bc859240` (P1 fixed, fully tested and validated, pinned exactly by branch **`window1/candidate`**).

No commits may be added to `window1/candidate` after this final refreeze.

- **TESTS & CI**:
  - Full CI matrix green: Ubuntu Node 20/22, Windows Node 22, macOS Node 22 (PR #14 run ID 33971334662).
  - Local test suite: 87/86/0/1 (all 86 passing, 1 skipped).
  - `npm run check` and `git diff --check` both PASS.
  - Worktree clean on both native Termux and rootfs checkouts.

## Candidate contract

- MODEL: `gpt-6-astra` (exact native id observed in Window 0).
- DEFAULT REASONING: `low` (production native default; supersedes the old
  Issue #5 "Start at Medium" wording — see coordination comment
  https://github.com/EchoEe247/codex-astra-efficiency/issues/5#issuecomment-5551813334).
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
  guessed; authority must remain stable (shared_default/default/limitId=codex
  expected; any change invalidates the delta per `calculateModelUsageDelta`).
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
  BASELINE (receipt `receipts/window-0-task-2-2026-09-05.md`).
- Task 2 weekly burn: 1pt (epoch 1788793830 stable).
- Sandbox 182: INTERMITTENT CODEX/RUNTIME TOOL FAILURE — RECOVERED, NOT
  RELEASE-BLOCKING; rootfs writes validated; read-side 182 not eliminated,
  not proven a CAE defect.

## Release-criteria status at freeze

30 of 46 boxes checked as PROVEN (native workflow 3/6, visibility 7/7,
campaign evidence 5/10, efficiency 0/7 by design — no optimization is
default-enabled, privacy 6/6, reliability 9/10). Remaining release-critical
gaps: A (public install/uninstall docs), C (unsupported Codex-version
behavior), E (normal permissions/tools/plan workflow compatibility) are
WINDOW_1_REQUIRED; B (live non-Astra no-op) and D (hostile state-dir edges
beyond fixtures) are WINDOW_1 candidates; the two Window 2 boxes and seven
efficiency-claim boxes are intentionally open pending their windows.
Full audit: `docs/RELEASE_CRITERIA.md`.
