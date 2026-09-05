# Release Criteria

## v0.1 purpose

The first public release should solve one narrow problem well:

> A ChatGPT Plus user can keep using Codex normally, select Astra normally, and gain trustworthy Astra-specific usage visibility plus only those efficiency behaviors that have been validated on real Plus work.

Speed does not justify incorrect quota reporting, invasive setup, or untested optimization claims.

## Required before public v0.1

### Native workflow

- [ ] Normal Codex launch remains supported.
- [ ] Native model picker remains the user's model-selection mechanism.
- [ ] CAE activates only for Astra.
- [ ] Non-Astra turns are verified no-op.
- [ ] Plan mode, permissions, tools, and normal Codex workflows remain usable.
- [ ] Install and uninstall are documented and tested.

### Usage visibility

- [ ] 5-hour window is shown when authoritatively exposed.
- [ ] Weekly window is shown when authoritatively exposed.
- [ ] Missing windows are reported as unavailable/unknown rather than guessed.
- [ ] Reset information is shown only when supplied reliably.
- [ ] Receipts include Codex version and enough provenance to interpret the measurement.
- [ ] Usage calculations are tested against recorded fixtures.
- [ ] The live production Astra model id and quota-authority shape are captured from native Codex rather than inferred from marketing names.

### Live Astra campaign evidence

- [ ] Window 0 shakedown completed using only allowance already remaining before any banked reset.
- [ ] Window 0 proved live Astra target identity, hook behavior, quota authority, and end-to-end receipt capture.
- [ ] Window 0 integration/measurement defects are fixed or explicitly dispositioned before Window 1.
- [ ] Window 1 begins from a documented clean allowance state after one banked reset.
- [ ] Window 1 includes a bounded normal-Astra pass-through/control segment before any new optimization default is promoted.
- [ ] Window 1 contains genuine real work, with multiple substantial tasks when allowance permits.
- [ ] PASS, PARTIAL, FAIL_USEFUL, and FAIL_WASTE outcomes are preserved rather than cherry-picked.
- [ ] 5-hour and weekly effects are recorded separately.
- [ ] Window 2 is run from the next normal 5-hour availability as a release-candidate validation rather than spending a second reset merely for scheduling convenience.
- [ ] Window 2 uses the intended v0.1 defaults and contains no speculative new optimization experiment.

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

- [ ] Local storage by default.
- [ ] No prompt/code/transcript upload by default.
- [ ] No browser-cookie harvesting.
- [ ] No OpenAI credential collection beyond normal Codex auth.
- [ ] No quota bypass/reset/circumvention behavior.
- [ ] No automatic termination of productive active Astra turns based solely on quota thresholds.

### Reliability and platforms

- [ ] Supported Node/runtime versions defined.
- [ ] Automated tests pass on Ubuntu.
- [ ] Automated tests pass on Windows.
- [ ] Automated tests pass on macOS.
- [ ] Real Termux/Android validation passes separately from ordinary Linux CI.
- [ ] Corrupt/malformed state fails safely.
- [ ] Unsupported Codex versions produce a clear compatibility result.
- [ ] Re-running setup is idempotent or safely repairable.
- [ ] Uninstall restores/removes only CAE-owned configuration.
- [ ] The user's real Codex launcher/wrapper path works for `cae doctor`, `cae probe`, and `cae quota` in the Termux validation environment.

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
