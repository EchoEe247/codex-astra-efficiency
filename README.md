# Codex Astra Efficiency

**Use Astra normally in Codex. Measure the work, not just the burn.**

Codex Astra Efficiency (CAE) is a lightweight Astra-specific observability and efficiency layer for ChatGPT Plus users working in Codex.

The product constraint above all others is simple:

> **Codex should still feel like Codex.**

You launch Codex normally, select Astra through native `/model`, give it real work, and let the agent operate normally. CAE stays beside that workflow to make Astra usage more observable and, only where real evidence supports it, more efficient.

> **Pre-release:** the repository is still private while the v0.1 release candidate is validated. The first public release is intended to be a trustworthy early release, not the final form of CAE.

## What CAE does

- Targets the exact configured Astra model and remains a strict no-op for other models.
- Uses native Codex `UserPromptSubmit` and `Stop` hooks for privacy-safe local observations.
- Reads native Codex model/quota surfaces without replacing Codex authentication or model selection.
- Tracks 5-hour and weekly Plus windows independently when Codex exposes them authoritatively.
- Refuses to invent a quota delta across unknown or changed reset boundaries.
- Preserves unrelated Codex hooks/configuration during setup and uninstall.
- Keeps observations local by default and does not persist raw prompts, responses, source code, cwd paths, account identity, or raw native session/turn ids.
- Fails open if CAE observation itself fails, so CAE does not block a productive Codex turn.

CAE does **not** increase OpenAI limits, automate resets, silently substitute another model, or currently promise a fixed percentage of Astra savings.

## Scope

- **Plan:** ChatGPT Plus first.
- **Surface:** Codex first.
- **Model:** Astra only.
- **Users:** everyday Codex users through professional developers.
- **Workload:** real software work, including substantial tasks.
- **Goal:** increase useful completed work per unit of Astra allowance by reducing avoidable burn without reducing the work to toy tasks.

## Quick start

The complete release installation and troubleshooting guide is in [`docs/INSTALL.md`](docs/INSTALL.md).

For the v0.1 package artifact:

```bash
npm install -g ./codex-astra-efficiency-0.1.0.tgz
```

Then configure the exact Astra target and install the CAE hooks:

```bash
cae doctor
cae target set gpt-6-astra
cae setup --dry-run
cae setup
cae readiness
```

A healthy setup reports:

```text
ready_for_live_hook_capture
```

Launch Codex normally, use `/model`, select **GPT-6-Astra**, and work normally.

Useful local commands:

```text
cae doctor
cae probe
cae readiness
cae quota
cae setup --dry-run
cae setup
cae uninstall --dry-run
cae uninstall
cae target show
cae target set <exact-model-id>
cae target clear
cae events
```

Before removing the global package, remove CAE-owned hooks with:

```bash
cae uninstall
npm uninstall -g codex-astra-efficiency
```

## Native Codex workflow

CAE does not launch a replacement agent UI or require a prompt DSL, proxy, repository restructuring, or alternate model picker.

Ordinary installations use the normal Codex command automatically:

- Unix-like: `codex`
- Windows: `codex.cmd`

If the user's working Codex command is a wrapper or another executable path, CAE can use that exact launcher:

```text
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae doctor
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae probe
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae readiness
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae quota
```

The override is one executable path/name, not an arbitrary shell command.

Codex's native hook review/trust prompt remains a real first-run step. CAE does not bypass it.

## Supported v0.1 boundary

The automated CLI/test surface is validated across Ubuntu, Windows, and macOS with Node.js 20+.

The authoritative Android live-Astra validation runtime is **codexu (Ubuntu-under-Termux)** using the user's real Codex executable.

**Native Termux Codex is a separate compatibility lane and is not part of the declared v0.1 support surface unless that lane passes before release.**

See [`docs/INSTALL.md`](docs/INSTALL.md) and [`docs/RELEASE_CRITERIA.md`](docs/RELEASE_CRITERIA.md).

## How CAE measures before it optimizes

CAE separates:

1. observed facts;
2. deterministic measurements;
3. signals;
4. efficiency hypotheses;
5. validated interventions.

A short run is not automatically efficient. An expensive run is not automatically wasteful. Task outcome, validation, scope, rework, quota movement, duration, and eventually native token counters belong together.

The post-v0.1 direction is to learn passively from real Astra work instead of repeatedly spending allowance on artificial benchmarks. Native input/cached/output/reasoning counters, context occupancy, Plus allowance movement, and useful-work outcome must remain distinct measurements.

See:

- [`docs/MEASUREMENT_MODEL.md`](docs/MEASUREMENT_MODEL.md)
- [`docs/TOKEN_ACCOUNTING.md`](docs/TOKEN_ACCOUNTING.md)
- [`docs/ASTRA_PLUS_TEST_PLAN.md`](docs/ASTRA_PLUS_TEST_PLAN.md)

## Product principles

1. **Native Codex workflow.** No mandatory harness migration, custom agent UI, task DSL, proxy, or repo restructuring.
2. **Astra means Astra.** CAE does not silently substitute cheaper models.
3. **Measure before promoting defaults.** Efficiency behavior must be justified by real Plus work.
4. **Separate quota windows.** 5-hour and weekly limits are tracked independently.
5. **Unknown stays unknown.** Missing or ambiguous measurement data is never converted into a confident number.
6. **Do not kill productive work.** CAE does not terminate a useful turn because a threshold was crossed.
7. **Large work is not waste.** CAE targets avoidable work, not ambitious work.
8. **Local by default.** Usage evidence stays local unless the user explicitly exports something.
9. **Minimal interruption.** Warnings and controls should be rare and high-value.
10. **No quota-circumvention claims.** CAE works around the allowance the user already has; it does not change entitlement.

## Current validation state

As of the current pre-v0.1 candidate:

- Exact native Astra id: `gpt-6-astra`.
- Native default reasoning observed: `low`.
- Native quota authority observed on the Plus validation account: `shared_default` / `default` / `limitId=codex`.
- Window 0 is complete.
- Real Astra `UserPromptSubmit`/`Stop` hook capture is proven.
- Privacy-safe opaque session/turn correlation is proven.
- Setup idempotence and CAE-owned-only uninstall are regression-covered.
- Cross-platform CI is green on Ubuntu, Windows, and macOS.
- Readiness now requires both a callable hook command and installed/readable native CAE hooks.
- Native app-server spawn failure/timeout handling and unknown-reset accounting have been hardened.
- Current frozen Window 1 candidate: `bae14cebc1858c4f602a5f2cf46a2428ccf932f7`.
- Window 1 has **not** started and no banked reset has been consumed.
- CAE does **not** claim a validated default Astra efficiency improvement yet.

Historical validation receipts remain available under [`receipts/`](receipts/). Current release authority is [`docs/RELEASE_CRITERIA.md`](docs/RELEASE_CRITERIA.md) plus [`trackers/STATE.md`](trackers/STATE.md).

## v0.1 release boundary

The first public release should be trustworthy and usable, not artificially “finished.”

Hard blockers are correctness/safety problems such as misleading quota measurements, false readiness, destructive setup/uninstall, privacy leaks, unexpected non-Astra behavior, ordinary supported CLI crashes/hangs, or materially false installation documentation.

Richer analytics, automatic task classification, broader platform support, and speculative efficiency interventions can follow in later releases when they are validated.

See [`docs/V0_1_RELEASE_PLAN.md`](docs/V0_1_RELEASE_PLAN.md).

## Contributing

Bug reports, measurement anomalies, feature requests, and focused pull requests are welcome after the repository becomes public.

A report is evidence to investigate, not automatically a confirmed bug. Confirmed issues are reproduced and validated before fixes are promoted. Correct community patches can be accepted directly, but they receive the same independent code, test, privacy, dependency, workflow, and security review as maintainer-authored changes.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SECURITY.md`](SECURITY.md).

## Release/change history

See [`CHANGELOG.md`](CHANGELOG.md).

## Authorities and deeper engineering notes

- [`docs/PRODUCT_CHARTER.md`](docs/PRODUCT_CHARTER.md)
- [`docs/CODEX_INTEGRATION_RECON.md`](docs/CODEX_INTEGRATION_RECON.md)
- [`docs/NATIVE_RUNTIME_VALIDATION.md`](docs/NATIVE_RUNTIME_VALIDATION.md)
- [`docs/ASTRA_WINDOW_0_SHAKEDOWN.md`](docs/ASTRA_WINDOW_0_SHAKEDOWN.md)
- [`docs/ASTRA_PLUS_TEST_PLAN.md`](docs/ASTRA_PLUS_TEST_PLAN.md)
- [`docs/MEASUREMENT_MODEL.md`](docs/MEASUREMENT_MODEL.md)
- [`docs/TOKEN_ACCOUNTING.md`](docs/TOKEN_ACCOUNTING.md)
- [`docs/RELEASE_CRITERIA.md`](docs/RELEASE_CRITERIA.md)
- [`trackers/STATE.md`](trackers/STATE.md)
