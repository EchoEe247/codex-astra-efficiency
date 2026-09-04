# Release Criteria

## v0.1 purpose

The first public release should solve one narrow problem well:

> A ChatGPT Plus user can keep using Codex normally, select Astra normally, and gain trustworthy Astra-specific usage visibility plus only those efficiency behaviors that have been validated on real Plus work.

The release should arrive quickly after Astra reaches Plus, but speed does not justify incorrect quota reporting, invasive setup, or untested optimization claims.

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

### Astra baseline evidence

- [ ] At least one full real-work Astra Plus campaign is captured.
- [ ] Multiple substantial tasks are represented unless the allowance itself prevents that.
- [ ] PASS, PARTIAL, and failure outcomes are preserved rather than cherry-picked.
- [ ] Baseline sessions use normal Astra behavior before optimization.
- [ ] 5-hour and weekly effects are recorded separately.

### Efficiency claims

Any optimization enabled by default must satisfy all of the following:

- [ ] mechanism is documented;
- [ ] tested on real Astra Plus work;
- [ ] comparison against baseline exists;
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

### Reliability

- [ ] Supported Node/runtime versions defined.
- [ ] Automated tests pass.
- [ ] Corrupt/malformed state fails safely.
- [ ] Unsupported Codex versions produce a clear compatibility result.
- [ ] Re-running setup is idempotent or safely repairable.
- [ ] Uninstall restores/removes only CAE-owned configuration.

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

## Fast-release sequence

When Astra becomes available on the test Plus account:

1. verify current Codex/Astra model identity and integration compatibility;
2. run observe-only real work;
3. review allowance burn and failure modes;
4. test the highest-confidence efficiency hypotheses;
5. promote only validated changes;
6. run install/uninstall and non-Astra regression checks;
7. create release receipt;
8. publish v0.1 as soon as the release gate is satisfied.

## Post-v0.1

Possible later work includes richer local diagnostics, optional exported anonymized receipts, broader Codex surfaces, and eventually Work support. These are secondary to keeping the v0.1 Astra-on-Plus Codex experience simple and trustworthy.
