# Release Criteria

## v0.1 purpose

The first public release should solve one narrow problem well:

> A ChatGPT Plus user can keep using Codex normally, select Astra normally, and gain trustworthy Astra-specific usage visibility plus only those efficiency behaviors that have been validated on real Plus work.

Speed does not justify incorrect quota reporting, invasive setup, or untested optimization claims.

## Required before public v0.1

### Native workflow

- [x] Normal Codex launch remains supported. (PROVEN: CAE never launches Codex itself; only short-lived `codex --version` + app-server socket reads via the user's real launcher; Window 0 ran entirely through native `/model` selection.)
- [x] Native model picker remains the user's model-selection mechanism. (PROVEN: no model routing code; Window 0 contract required native `/model` selection of `gpt-6-astra`.)
- [x] CAE activates only for Astra. (PROVEN: unit `non-Astra model is a strict no-op`; live hooks recorded exact `gpt-6-astra` only.)
- [ ] Non-Astra turns are verified no-op. (PARTIAL: unit-covered; live non-Astra no-op recheck not yet run — acceptable pre-release, WINDOW_1 candidate.)
- [ ] Plan mode, permissions, tools, and normal Codex workflows remain usable. (NOT PROVEN live: Window 0 tasks ran in bypassPermissions sandbox reads; normal permissions/tools/plan workflow compatibility is a release-critical gap — WINDOW_1_REQUIRED.)
- [ ] Install and uninstall are documented and tested. (PARTIAL: tested — idempotence + CAE-owned-only uninstall regression-covered, cross-platform CI green; documented only as dev CLI, no public install/uninstall doc yet — gap A, WINDOW_1_REQUIRED.)

### Usage visibility

- [x] 5-hour window is shown when authoritatively exposed. (PROVEN: `cae quota` + receipt schema; Task 1 / revalidation live burns; reset-crossing now reports UNAVAILABLE rather than guessing.)
- [x] Weekly window is shown when authoritatively exposed. (PROVEN: same; Task 2 weekly 1pt burn on stable epoch 1788793830.)
- [x] Missing windows are reported as unavailable/unknown rather than guessed. (PROVEN: unit `does not invent a missing 5-hour/weekly window`; `measurement` refuses cross-reset deltas — unit `does not call a reset-crossing change usage burn`.)
- [x] Reset information is shown only when supplied reliably. (PROVEN: resetsAt/credits surfaced from native snapshots; reset crossing invalidates the delta.)
- [x] Receipts include Codex version and enough provenance to interpret the measurement. (PROVEN: Task 2 receipt records Codex 0.153.2, model, reasoning, authority, epochs, hook event times.)
- [x] Usage calculations are tested against recorded fixtures. (PROVEN: measurement/rate-limits suites incl. malformed + authority-change fixtures.)
- [x] The live production Astra model id and quota-authority shape are captured from native Codex rather than inferred from marketing names. (PROVEN: exact `gpt-6-astra`, authority shared_default/default/limitId=codex.)

### Live Astra campaign evidence

- [x] Window 0 shakedown completed using only allowance already remaining before any banked reset. (PROVEN: 0 resets consumed, 2 remain; Window 0 CLOSED 2026-09-05.)
- [x] Window 0 proved live Astra target identity, hook behavior, quota authority, and end-to-end receipt capture. (PROVEN: Task 1 PARTIAL + revalidation PASS + Task 2 PASS receipts.)
- [x] Window 0 integration/measurement defects are fixed or explicitly dispositioned before Window 1. (PROVEN: 4 defects — limitId instability, hook executable-mode/readiness gap, Windows portability, uninstall ownership leak — all fixed, regression-covered, cross-platform green; Task 2 5h burn corrected to UNAVAILABLE — RESET_CROSSED; sandbox 182 classified INTERMITTENT/RECOVERED.)
- [ ] Window 1 begins from a documented clean allowance state after one banked reset. (WINDOW_1_REQUIRED — candidate frozen here; reset NOT yet authorized.)
- [ ] Window 1 includes a bounded normal-Astra pass-through/control segment before any new optimization default is promoted. (WINDOW_1_REQUIRED — control-task selection rules defined in `docs/WINDOW1_CANDIDATE_FREEZE.md`.)
- [ ] Window 1 contains genuine real work, with multiple substantial tasks when allowance permits. (WINDOW_1_REQUIRED.)
- [x] PASS, PARTIAL, FAIL_USEFUL, and FAIL_WASTE outcomes are preserved rather than cherry-picked. (PROVEN: Task 1 PARTIAL preserved alongside PASSes.)
- [x] 5-hour and weekly effects are recorded separately. (PROVEN: all Window 0 receipts separate the windows; Task 2 5h UNAVAILABLE while weekly stays 1pt.)
- [ ] Window 2 is run from the next normal 5-hour availability as a release-candidate validation rather than spending a second reset merely for scheduling convenience. (WINDOW_2_REQUIRED.)
- [ ] Window 2 uses the intended v0.1 defaults and contains no speculative new optimization experiment. (WINDOW_2_REQUIRED.)

### Efficiency claims

Any optimization enabled by default must satisfy all of the following:

- [ ] mechanism is documented;
- [ ] tested on real Astra Plus work;
- [ ] comparison against a pass-through/control segment exists;
- [ ] does not materially reduce completion quality;
- [ ] does not require the user to change normal Codex task style;
- [ ] can be disabled cleanly;
- [ ] does not affect non-Astra models.

If no optimization meets this bar by launch day, v0.1 may ship as a trustworthy Astra observability/measurement release rather than inventing an efficiency claim.

### Privacy and safety

- [x] Local storage by default. (PROVEN: JSONL receipts under CAE state dir only; Task 2 privacy PASS.)
- [x] No prompt/code/transcript upload by default. (PROVEN: observations carry only opaque sessionKey/turnKey + booleans; no raw identifiers; no network path in hook handler.)
- [x] No browser-cookie harvesting. (PROVEN: no browser/cookie code in repo.)
- [x] No OpenAI credential collection beyond normal Codex auth. (PROVEN: CAE reads local app-server socket; no auth handling.)
- [x] No quota bypass/reset/circumvention behavior. (PROVEN: no reset invocation anywhere; 0 resets consumed in Window 0.)
- [x] No automatic termination of productive active Astra turns based solely on quota thresholds. (PROVEN: hook returns continue:true; fail-open behavior unit-covered.)

### Reliability and platforms

- [x] Supported Node/runtime versions defined. (PROVEN: `engines: node >= 20`; CI matrix Ubuntu 20/22, Windows 22, macOS 22.)
- [x] Automated tests pass on Ubuntu. (PROVEN: CI green on Node 20 + 22; local 85/84/0/1.)
- [x] Automated tests pass on Windows. (PROVEN: CI green; 83 pass / 2 POSIX-host skips.)
- [x] Automated tests pass on macOS. (PROVEN: CI green.)
- [x] Real Termux/Android validation passes separately from ordinary Linux CI. (PROVEN: codexu/Ubuntu-under-Termux live campaign — exact target, hooks, quota, rootfs writes. NATIVE Termux lane stays separate under Issue #9 and must NOT be publicly claimed until it passes — see support boundary below.)
- [x] Corrupt/malformed state fails safely. (PROVEN: malformed purchased-credit/windows surfaced not coerced; malformed hooks event array rejected not overwritten; unreadable CAE config degrades to `config_unreadable` warning. Residual gap D recorded below: hostile/missing CAE state-dir edge cases beyond fixtures remain WINDOW_1 candidate review, not release-proven.)
- [ ] Unsupported Codex versions produce a clear compatibility result. (NOT PROVEN: version is recorded (`codex --version`, app-server client version) but no unsupported-version gate/result is implemented or tested — gap C, WINDOW_1_REQUIRED.)
- [x] Re-running setup is idempotent or safely repairable. (PROVEN: idempotence + 2-cycle byte-for-byte, cross-platform green.)
- [x] Uninstall restores/removes only CAE-owned configuration. (PROVEN: Task 2 ownership fix + regressions.)
- [x] The user's real Codex launcher/wrapper path works for `cae doctor`, `cae probe`, and `cae quota` in the Termux validation environment. (PROVEN: all pass through `/root/.local/bin/codex` via CAE_CODEX_COMMAND in codexu.)

### Declared v0.1 support surface (explicit)

- codexu (Ubuntu-under-Termux, `/root/.local/bin/codex`): the authoritative Android development + live Astra validation runtime. codexu health IS a Window 1 gate.
- Native Termux Codex: a SEPARATE compatibility lane under Issue #9. Native repair is NOT a Window 1 campaign blocker. Native Termux support must NOT be publicly claimed until Issue #9 passes. Before public v0.1, either (a) Issue #9 passes, or (b) native Termux is explicitly declared outside the support surface. No silent weakening: this freeze does NOT claim native Termux.

### Remaining release-critical gaps (pre-Window-1)

A. Public install/uninstall documentation: tested but no public install contract yet (README states dev-CLI only). WINDOW_1_REQUIRED.
B. Live strict non-Astra no-op evidence: unit-covered only; live recheck optional before release. WINDOW_1 candidate.
C. Unsupported Codex-version behavior: no clear compatibility result implemented/tested. WINDOW_1_REQUIRED.
D. Corrupt/malformed CAE state handling: fixture-level safe-fail proven; hostile real-world state-dir corruption beyond fixtures unreviewed. WINDOW_1 candidate review (Phase 9 verdict below).
E. Normal permissions/tools/plan workflow compatibility: Window 0 ran bypassPermissions sandbox reads; ordinary-user workflow compatibility NOT proven live. WINDOW_1_REQUIRED.
F. Final declared Termux support boundary: stated above; must be mirrored in README before public v0.1 (done in this freeze — verify).

## Public wording constraints

Allowed direction:

> Use Astra normally in Codex. Waste less of your Plus allowance.

Not allowed without strong quantified evidence:

- "2x your Astra quota"
- "save 80% of Astra usage"
- "bypass Astra limits"
- "unlimited Astra"
- "free extra Astra"

CAE optimizes behavior around the allowance. It does not change OpenAI's entitlement or quota accounting.

## Release sequence

1. complete zero-Astra readiness and cross-platform CI;
2. run Window 0 live shakedown on remaining allowance;
3. fix/harden without Astra;
4. freeze the Window 1 candidate;
5. use one banked reset and run the clean early-release campaign;
6. fix/harden without Astra;
7. wait for the next normal 5-hour availability and run Window 2 release-candidate validation;
8. run final install/uninstall and non-Astra regressions;
9. create release receipt;
10. publish v0.1 only when the release gate is satisfied.

The second banked reset is not part of the planned release-test sequence.

## Post-v0.1

Possible later work includes richer local diagnostics, optional exported anonymized receipts, broader Codex surfaces, and eventually Work support. These are secondary to keeping the v0.1 Astra-on-Plus Codex experience simple and trustworthy.
