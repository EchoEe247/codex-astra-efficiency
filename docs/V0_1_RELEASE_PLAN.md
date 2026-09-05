# v0.1 release plan

## Release philosophy

v0.1.0 is an early trustworthy product release, not the final form of CAE.

The release should be clean, understandable, safe to install/uninstall, and truthful about what has and has not been proven. Future releases are expected to improve compatibility, instrumentation, documentation, and eventually evidence-backed efficiency behavior.

Do not delay v0.1 solely to implement every plausible optimization or analytics feature.

## What v0.1 must do correctly

A supported ChatGPT Plus Codex user should be able to:

1. install the CAE package/artifact;
2. run `cae doctor`;
3. configure the exact Astra target;
4. install CAE-owned Codex hooks without damaging unrelated configuration;
5. complete Codex's native hook review when requested;
6. run `cae readiness` and receive a conservative result;
7. select Astra normally through `/model`;
8. use Codex normally while CAE records privacy-safe Astra observations;
9. inspect native 5-hour/weekly usage when authoritatively exposed;
10. uninstall CAE hooks without deleting unrelated user hooks/configuration.

## Hard release blockers

Do not publish v0.1 with a known issue that can:

- silently corrupt quota/measurement interpretation;
- report a live-capture ready state when required CAE prerequisites are missing;
- remove or overwrite unrelated user configuration;
- expose raw prompts, responses, source, credentials, account identity, or raw native session ids;
- make CAE affect non-Astra turns unexpectedly;
- hang/crash the CLI on an ordinary supported failure path;
- make the documented installation/uninstallation path materially false;
- claim support for an environment that was explicitly excluded from the validated support surface.

## Not blockers by themselves

The following may ship as documented limitations or post-v0.1 work when the core release remains trustworthy:

- richer dashboards or visualization;
- automatic task taxonomy;
- native per-turn token extraction if it is not ready without destabilizing v0.1;
- additional platform/runtime support outside the declared surface;
- speculative efficiency interventions;
- quantified savings claims;
- perfect classification of every Astra workload;
- every possible corrupt-state edge case beyond a safe failure baseline;
- convenience UX that does not affect correctness or safety.

## Measurement/efficiency claim boundary

v0.1 may ship as an observability-first release.

Do not claim a fixed percentage of Astra savings unless final campaign evidence supports a specific mechanism and comparison. If no intervention meets that bar, the release should say so directly.

See `docs/TOKEN_ACCOUNTING.md` for the post-release real-work measurement strategy.

## Community maintenance model

After release:

```text
real user work / issue / PR
  -> reproduce or inspect
  -> classify
  -> independently validate
  -> focused fix
  -> regression coverage
  -> security/privacy review
  -> cross-platform CI
  -> merge/release
```

Community patches may be accepted directly when correct and safe. Maintainers do not need to rewrite an external fix merely to own it, but external authorship never bypasses review.

## Release candidate gates

Before tagging v0.1.0:

- [ ] final candidate SHA recorded;
- [ ] `npm test` passes;
- [ ] `npm run check` passes;
- [ ] `git diff --check` passes;
- [ ] Ubuntu CI passes;
- [ ] Windows CI passes;
- [ ] macOS CI passes;
- [ ] package/artifact contents reviewed;
- [ ] clean install from produced artifact passes;
- [ ] `cae doctor` passes on supported live environment;
- [ ] `cae readiness` is truthful;
- [ ] setup idempotence passes;
- [ ] uninstall ownership/preservation passes;
- [ ] one supported real Codex/Astra release-candidate validation is recorded;
- [ ] README/INSTALL/SECURITY/CONTRIBUTING/changelog are current;
- [ ] native Termux support is either validated or explicitly excluded;
- [ ] release notes contain no unsupported efficiency claim.

## Owner decisions required before public release

The repository currently has release metadata that is intentionally not public-ready (`private: true`, version `0.0.0-dev`, `UNLICENSED`). Before publication, the owner must explicitly choose:

1. **outbound license** — for example MIT or another deliberate license;
2. **repository visibility** — public when the release is approved;
3. **distribution channel** — GitHub release artifact only for v0.1, npm publication, or both;
4. **final package version** — expected `0.1.0` for the first public release.

These are release decisions, not reasons to block all engineering preparation.

## Suggested release sequence

1. land verified prerelease correctness fixes;
2. finish user-facing docs and community/security policy;
3. decide license + distribution;
4. set v0.1 package metadata;
5. freeze exact release candidate;
6. run final clean package/install/setup/readiness/uninstall smoke;
7. run the planned real release-candidate Astra validation without inventing new experiments;
8. run final CI/security/diff checks;
9. create release receipt;
10. tag `v0.1.0` and publish the approved artifact/release;
11. begin post-release monitoring and issue/PR triage.

## Post-v0.1 direction

Patch releases should prioritize verified bugs, compatibility, measurement accuracy, documentation, and small safe instrumentation improvements.

Minor releases may introduce genuinely new capabilities or evidence-backed Astra efficiency interventions.

The project should prefer passive learning from real Astra work over repeatedly spending allowance on artificial benchmarks.