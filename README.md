# Codex Astra Efficiency

**Use Astra normally in Codex. Measure the work, not just the burn.**

Codex Astra Efficiency (CAE) is my lightweight Astra-specific observability and efficiency layer for ChatGPT Plus users working in Codex.

The main product rule is simple:

> **Codex should still feel like Codex.**

I do not want users to adopt a separate agent framework, prompt language, proxy, model router, or repository structure just to understand how Astra is using their allowance. The normal workflow stays the same: launch Codex, select Astra through native `/model`, give it real work, and let it operate normally. CAE stays beside that workflow and measures what it can prove.

`v0.1.0` is the first public release. It is intentionally **observability-first**. Trustworthy measurement, privacy, safe Codex integration, and truthful unknown states come before claims about percentage savings that the evidence does not yet support.

## What CAE does

- Targets the exact configured Astra model and remains a strict no-op for other models.
- Uses native Codex `UserPromptSubmit` and `Stop` hooks for privacy-safe local observations.
- Reads native Codex model/quota surfaces without replacing Codex authentication or model selection.
- Tracks 5-hour and weekly Plus windows independently when Codex exposes them authoritatively.
- Refuses to invent a quota delta across unknown or changed reset boundaries.
- Preserves unrelated Codex hooks and configuration during setup and uninstall.
- Keeps observations local by default and does not persist raw prompts, responses, source code, cwd paths, account identity, or raw native session/turn ids.
- Fails open if CAE observation itself fails, so an observability problem does not block a productive Codex turn.

CAE does **not** increase OpenAI limits, automate resets, silently substitute another model, or promise a fixed percentage of Astra savings.

## Scope

- **Plan:** ChatGPT Plus first.
- **Surface:** Codex first.
- **Model:** Astra only.
- **Users:** everyday Codex users through professional developers.
- **Workload:** real software work, including substantial tasks.
- **Goal:** get more useful completed work from the Astra allowance by identifying and eventually reducing avoidable burn without shrinking the work into toy tasks.

For me, that last distinction matters. A long run that completes a difficult feature can be efficient. A short run that repeatedly reconstructs context and fails can be wasteful. Duration alone is not the target.

## Quick start

The full installation and troubleshooting guide is in [`docs/INSTALL.md`](docs/INSTALL.md).

Install from npm:

```bash
npm install -g codex-astra-efficiency
```

Or install the `v0.1.0` GitHub Release package artifact:

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

A healthy live-capture setup reports:

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

Before removing the global package, remove CAE-owned hooks first:

```bash
cae uninstall
npm uninstall -g codex-astra-efficiency
```

## Native Codex workflow

CAE does not launch a replacement agent UI and does not require a prompt DSL, proxy, repository restructuring, or alternate model picker.

Ordinary installations use the normal Codex command automatically:

- Unix-like: `codex`
- Windows: `codex.cmd`

If the user's working Codex command is a wrapper or another executable path, point CAE at that exact launcher:

```text
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae doctor
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae probe
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae readiness
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae quota
```

The override is one executable path or name, not an arbitrary shell command.

Codex's native hook review/trust prompt remains a real first-run step. CAE does not bypass it.

## v0.1.0 support boundary

The automated CLI/test surface is validated across Ubuntu, Windows, and macOS with Node.js 20+.

The validated Android live-Astra path is **codexu (Ubuntu-under-Termux)** using the user's real Codex executable.

**Native Termux Codex is not supported by CAE under the currently validated upstream Android distribution.** Zero-inference post-release validation showed that the upstream Android arm64 launcher uses the `aarch64-unknown-linux-musl` binary; local commands work, but the native environment cannot complete the external network reads CAE needs for authoritative Plus quota/readiness. CAE degrades truthfully there rather than reporting false success or zero usage.

A PRoot/Ubuntu wrapper is a valid `codexu`-style path, but it is not native-Termux support.

See [`docs/CODEX_COMPATIBILITY.md`](docs/CODEX_COMPATIBILITY.md) and [`docs/INSTALL.md`](docs/INSTALL.md).

## Measure before optimizing

CAE separates:

1. observed facts;
2. deterministic measurements;
3. signals;
4. efficiency hypotheses;
5. validated interventions.

I do not want an anecdotal low-burn run turned into a product claim. Task outcome, validation quality, scope, rework, quota movement, duration, and native token counters need to be considered together.

The post-v0.1 direction is to learn passively from real Astra work instead of repeatedly spending allowance on artificial benchmarks. Native input/cached/output/reasoning counters, context occupancy, Plus allowance movement, and useful-work outcome remain separate measurements because they answer different questions.

See:

- [`docs/MEASUREMENT_MODEL.md`](docs/MEASUREMENT_MODEL.md)
- [`docs/TOKEN_ACCOUNTING.md`](docs/TOKEN_ACCOUNTING.md)
- [`docs/ASTRA_PLUS_TEST_PLAN.md`](docs/ASTRA_PLUS_TEST_PLAN.md) — historical campaign design/evidence context

## Product principles

1. **Native Codex workflow.** No mandatory harness migration, custom agent UI, task DSL, proxy, or repository restructuring.
2. **Astra means Astra.** CAE does not silently substitute cheaper models.
3. **Measure before promoting defaults.** Efficiency behavior must be justified by real Plus work.
4. **Separate quota windows.** 5-hour and weekly limits are tracked independently.
5. **Unknown stays unknown.** Missing or ambiguous measurement data is never converted into a confident number.
6. **Do not kill productive work.** CAE does not terminate a useful turn just because a threshold was crossed.
7. **Large work is not waste.** CAE targets avoidable work, not ambitious work.
8. **Local by default.** Usage evidence stays local unless the user explicitly exports something.
9. **Minimal interruption.** Warnings and controls should be rare and useful.
10. **No quota-circumvention claims.** CAE works around the allowance the user already has; it does not change entitlement.

## v0.1.0 validation state

The first public release was validated with these boundaries:

- **Exact native Astra target:** `gpt-6-astra`.
- **Codex CLI validated for the release campaign:** `0.153.2` on Node.js 20+.
- **Native default reasoning observed:** `low`.
- **Native quota authority observed:** `shared_default` / `default` / `limitId=codex`.
- **Live hook capture:** real `UserPromptSubmit` and `Stop` hooks captured and verified under native Codex.
- **Strict non-Astra no-op:** a `gpt-5.6-sol` turn produced zero CAE observation records and zero hook interference.
- **Installed artifact validation:** globally installed `codex-astra-efficiency@0.1.0` passed end-to-end release-candidate validation in the normal Codex workflow.
- **Privacy-safe opaque correlation:** no raw prompts, responses, file paths, cwd strings, repository names, credentials, or raw native session/turn ids persisted.
- **Setup/uninstall safety:** idempotence and CAE-only ownership removal were verified while unrelated user hooks stayed intact.
- **Cross-platform CI:** green across Ubuntu, Windows, and macOS.
- **Android support:** `codexu` is the validated path; native Termux is unsupported under the current upstream distribution.
- **Savings claim:** none. `v0.1.0` does not claim a fixed percentage reduction.

The dated campaign receipts under [`receipts/`](receipts/) remain historical evidence for the release. Current runtime compatibility belongs in [`docs/CODEX_COMPATIBILITY.md`](docs/CODEX_COMPATIBILITY.md); the `v0.1.0` sign-off checklist remains in [`docs/RELEASE_CRITERIA.md`](docs/RELEASE_CRITERIA.md).

## What comes after v0.1

The first release established a trustworthy observability base rather than pretending the optimization problem was already solved.

Post-release work can expand native token accounting, improve measurement, study real-work patterns, and test efficiency interventions one at a time. Broader platform support or richer analytics should be added when they have evidence behind them, not because they make the feature list longer.

## Contributing

Bug reports, measurement anomalies, feature requests, and focused pull requests are welcome.

A report is evidence to investigate, not automatically a confirmed bug. Correct community patches do not need to be recreated by the maintainer, but they receive the same independent code, test, privacy, dependency, workflow, and security review as maintainer-authored changes.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SECURITY.md`](SECURITY.md).

## Release and engineering references

- [`CHANGELOG.md`](CHANGELOG.md) — release/change history.
- [`docs/PRODUCT_CHARTER.md`](docs/PRODUCT_CHARTER.md) — product direction and boundaries.
- [`docs/CODEX_COMPATIBILITY.md`](docs/CODEX_COMPATIBILITY.md) — current Codex/runtime compatibility boundary.
- [`docs/INSTALL.md`](docs/INSTALL.md) — installation and first use.
- [`docs/MEASUREMENT_MODEL.md`](docs/MEASUREMENT_MODEL.md) — evidence and quota-measurement model.
- [`docs/TOKEN_ACCOUNTING.md`](docs/TOKEN_ACCOUNTING.md) — native token/accounting direction.
- [`docs/RELEASE_CRITERIA.md`](docs/RELEASE_CRITERIA.md) — historical v0.1.0 release sign-off evidence.
- [`trackers/STATE.md`](trackers/STATE.md) — campaign/project state record; dated campaign sections should be read as historical where superseded by the public release or later compatibility evidence.
