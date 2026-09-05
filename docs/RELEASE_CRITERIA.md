# Release Criteria

## v0.1 purpose

The first public release should solve one narrow problem well:

> A ChatGPT Plus user can keep using Codex normally, select Astra normally, and gain trustworthy Astra-specific usage visibility plus only those efficiency behaviors that have been validated on real Plus work.

v0.1 is an **observability-first release**. Speed does not justify incorrect quota reporting, invasive setup, or untested optimization claims.

## Required before public v0.1

### Native workflow

- [x] Normal Codex launch remains supported. (PROVEN: CAE never launches Codex itself; only short-lived `codex --version` + app-server socket reads via the user's real launcher; Window 0 ran entirely through native `/model` selection.)
- [x] Native model picker remains the user's model-selection mechanism. (PROVEN: no model routing code; Window 0 contract required native `/model` selection of `gpt-6-astra`.)
- [x] CAE activates only for Astra. (PROVEN: unit `non-Astra model is a strict no-op`; live hooks recorded exact `gpt-6-astra` only.)
- [x] Install and uninstall are documented and tested. (PROVEN: README, `docs/INSTALL.md`, clean artifact consumer install, setup/uninstall contract, idempotence, and byte-for-byte configuration preservation proven in preflight.)
- [ ] Non-Astra turns are verified live no-op. (Unit-covered; scheduled as Check A in the final installed-artifact live RC validation.)
- [ ] Plan mode, permissions, tools, and normal Codex workflows remain usable. (Scheduled as Check B in the final installed-artifact live RC validation.)

### Usage visibility

- [x] 5-hour window is shown when authoritatively exposed. (PROVEN: `cae quota` + receipt schema; Task 1 / revalidation live burns; reset-crossing reports UNAVAILABLE rather than guessing.)
- [x] Weekly window is shown when authoritatively exposed. (PROVEN: same; Task 2 weekly 1pt burn on stable epoch 1788793830.)
- [x] Missing windows are reported as unavailable/unknown rather than guessed. (PROVEN: unit `does not invent a missing 5-hour/weekly window`; `measurement` refuses cross-reset deltas — unit `does not call a reset-crossing change usage burn`.)
- [x] Reset information is shown only when supplied reliably. (PROVEN: resetsAt/credits surfaced from native snapshots; reset crossing invalidates the delta.)
- [x] Receipts include Codex version and enough provenance to interpret the measurement. (PROVEN: Task 2 receipt records Codex 0.153.2, model, reasoning, authority, epochs, hook event times.)
- [x] Usage calculations are tested against recorded fixtures. (PROVEN: measurement/rate-limits suites incl. malformed + authority-change fixtures.)
- [x] The live production Astra model id and quota-authority shape are captured from native Codex rather than inferred from marketing names. (PROVEN: exact `gpt-6-astra`, authority shared_default/default/limitId=codex.)

### Live validation status

- [x] Window 0 shakedown completed using only allowance already remaining before any banked reset. (PROVEN: 0 resets consumed, 2 remain; Window 0 CLOSED 2026-09-05.)
- [x] Window 0 proved live Astra target identity, hook behavior, quota authority, and end-to-end receipt capture. (PROVEN: Task 1 PARTIAL + revalidation PASS + Task 2 PASS receipts.)
- [x] Window 0 integration/measurement defects are fixed or explicitly dispositioned. (PROVEN: 4 findings — limitId instability, hook executable-mode/readiness gap, Windows portability, uninstall ownership leak — all fixed, regression-covered, cross-platform green; Task 2 5h burn corrected to UNAVAILABLE — RESET_CROSSED; sandbox 182 classified INTERMITTENT/RECOVERED.)
- [x] Pre-v0.1 runtime hardening (F1–F5) completed and verified in CI. (PROVEN: PR #18 merged; Windows .cmd ComSpec dispatch, stdio error settlement, readiness visibility, bounded version timeout, config shape validation.)
- [ ] Final installed-artifact release-candidate validation. (PENDING LIVE AUTHORIZATION: single live RC validation following `docs/V0_1_LIVE_RC_VALIDATION.md` on frozen candidate, replacing multi-window optimization campaigns for v0.1.)
- [x] PASS, PARTIAL, FAIL_USEFUL, and FAIL_WASTE outcomes are preserved rather than cherry-picked. (PROVEN: Task 1 PARTIAL preserved alongside PASSes.)
- [x] 5-hour and weekly effects are recorded separately. (PROVEN: all Window 0 receipts separate the windows; Task 2 5h UNAVAILABLE while weekly stays 1pt.)

### Efficiency claims

v0.1 ships as an **observability-first release** and makes **no unsupported claims of fixed percentage savings**. Optimization mechanisms and passive token accounting (`docs/TOKEN_ACCOUNTING.md`) are explicitly deferred post-v0.1.

### Privacy and safety

- [x] Local storage by default. (PROVEN: JSONL receipts under CAE state dir only; Task 2 privacy PASS.)
- [x] No prompt/code/transcript upload by default. (PROVEN: observations carry only opaque sessionKey/turnKey + booleans; no raw identifiers; no network path in hook handler.)
- [x] No browser-cookie harvesting. (PROVEN: no browser/cookie code in repo.)
- [x] No OpenAI credential collection beyond normal Codex auth. (PROVEN: CAE reads local app-server socket; no auth handling.)
- [x] No quota bypass/reset/circumvention behavior. (PROVEN: no reset invocation anywhere; 0 resets consumed in Window 0.)
- [x] No automatic termination of productive active Astra turns based solely on quota thresholds. (PROVEN: hook returns continue:true; fail-open behavior unit-covered.)

### Reliability and platforms

- [x] Supported Node/runtime versions defined. (PROVEN: `engines: node >= 20`; CI matrix Ubuntu 20/22, Windows 22, macOS 22.)
- [x] Automated tests pass on Ubuntu. (PROVEN: CI green on Node 20 + 22.)
- [x] Automated tests pass on Windows. (PROVEN: CI green, real `.cmd` launcher tests PASS.)
- [x] Automated tests pass on macOS. (PROVEN: CI green.)
- [x] Real Termux/Android validation passes separately from ordinary Linux CI. (PROVEN: codexu/Ubuntu-under-Termux live campaign — exact target, hooks, quota, rootfs writes. NATIVE Termux lane stays separate under Issue #9 and is explicitly declared outside v0.1 support.)
- [x] Corrupt/malformed state fails safely. (PROVEN: F5 config shape validation, missing launcher spawn errors, bounded version timeout, fail-open hook behavior.)
- [x] Codex version compatibility documented. (PROVEN: `docs/CODEX_COMPATIBILITY.md`; 0.153.2 validated; other versions unverified rather than hard-coded allowlist; failures stay unavailable/degraded.)
- [x] Re-running setup is idempotent or safely repairable. (PROVEN: preflight verified byte-for-byte idempotence across repeated cycles.)
- [x] Uninstall restores/removes only CAE-owned configuration. (PROVEN: preflight verified byte-for-byte restoration of unrelated user configurations.)
- [x] The user's real Codex launcher/wrapper path works for `cae doctor`, `cae probe`, and `cae quota`. (PROVEN: all pass through `/root/.local/bin/codex` via CAE_CODEX_COMMAND in codexu.)

### Declared v0.1 support surface (explicit)

- **Supported automated platforms:** Linux (Ubuntu 20+), Windows (Windows Server / Windows 11), macOS (13+), Node.js >= 20.
- **Authoritative Android validation runtime:** `codexu` (Ubuntu 24.04 under Termux / PRoot) using `/root/.local/bin/codex`.
- **Excluded:** Native Termux Codex is explicitly **outside** the declared v0.1 support surface (tracked separately under Issue #9).

### Reconciled status of release-critical gaps

- **Gap A (Public install/uninstall documentation):** PROVEN. Documented in `README.md` and `docs/INSTALL.md`, validated in clean tarball preflight install.
- **Gap B (Live non-Astra no-op):** Scheduled as Check A in `docs/V0_1_LIVE_RC_VALIDATION.md`.
- **Gap C (Unsupported Codex-version behavior):** PROVEN. Handled transparently and documented in `docs/CODEX_COMPATIBILITY.md`.
- **Gap D (Corrupt state handling):** PROVEN. Resolved and regression-covered via F5 runtime hardening.
- **Gap E (Normal permissions/workflow compatibility):** Scheduled as Check B in `docs/V0_1_LIVE_RC_VALIDATION.md`.
- **Gap F (Termux support boundary):** PROVEN. Explicitly declared in `README.md`, `docs/INSTALL.md`, and `docs/CODEX_COMPATIBILITY.md`.

## Public wording constraints

Allowed direction:

> Use Astra normally in Codex. Measure the work, not just the burn.

Not allowed without strong quantified evidence:

- "2x your Astra quota"
- "save 80% of Astra usage"
- "bypass Astra limits"
- "unlimited Astra"
- "free extra Astra"

CAE observes behavior around the allowance. It does not change OpenAI's entitlement or quota accounting.

## Final release sequence

1. Complete preflight audit and package metadata configuration (DONE);
2. Finalize v0.1.0 release candidate branch, run cross-platform CI, merge to main, and freeze `release/v0.1-candidate`;
3. Await owner authorization on weekly allowance / banked reset;
4. Execute final installed-artifact live validation (`docs/V0_1_LIVE_RC_VALIDATION.md`);
5. Switch repository visibility to public;
6. Enable GitHub Private Vulnerability Reporting (`OWNER_UI_ACTION_AT_RELEASE`);
7. Tag `v0.1.0` and publish GitHub Release + npm registry package from tested artifact;
8. Begin post-release monitoring.
