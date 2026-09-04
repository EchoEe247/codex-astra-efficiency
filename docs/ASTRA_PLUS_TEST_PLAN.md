# Astra Plus Real-Work Test Plan

## Purpose

The first Astra campaign must answer a practical Plus-user question:

> How much useful real work can Astra complete inside the actual ChatGPT Plus Codex allowance, and which avoidable behaviors materially reduce that value?

This is not a benchmark campaign. Synthetic toy tasks are not the primary evidence source.

## Test philosophy

- Use work that genuinely needs to be done.
- Keep Astra inside normal Codex behavior for the first baseline window.
- Treat failures as evidence.
- Record the 5-hour and weekly windows separately.
- Do not optimize based on one anecdotal run.
- Do not count wall-clock time as success by itself.
- Do not stop a productive run merely to preserve a prettier quota number.

## Phase 0 — pre-Astra readiness

Before Astra is available to the test Plus account:

- validate Codex integration and model detection;
- validate rate-limit snapshot reading against the currently installed Codex version;
- create fixtures for full, partial, missing, and contradictory rate-limit windows;
- validate local receipt storage;
- ensure CAE remains inert when a non-Astra model is active;
- establish clean install, disable, and uninstall procedures;
- capture the Codex version used for every experiment.

## Phase 1 — observe-only baseline

No efficiency intervention is allowed during the first baseline campaign beyond passive observation required to collect the measurements.

For each real Astra task, record:

- timestamp;
- Codex version;
- detected model slug;
- reasoning effort if exposed reliably;
- task class;
- task summary written without secrets;
- starting 5-hour usage snapshot, if available;
- ending 5-hour usage snapshot, if available;
- starting weekly usage snapshot, if available;
- ending weekly usage snapshot, if available;
- wall-clock duration;
- turn count where reliably observable;
- human intervention count;
- outcome;
- validation evidence;
- unexpected agent behavior;
- whether the task expanded beyond the requested scope.

### Outcome vocabulary

- **PASS** — requested objective completed and validation passed.
- **PARTIAL** — meaningful progress, but completion required another model/human or remained unfinished.
- **FAIL_USEFUL** — task failed, but produced substantial diagnostic value or reduced uncertainty.
- **FAIL_WASTE** — meaningful allowance burn without useful completion or diagnostic value.

## Preferred baseline workload classes

Choose tasks from real active work as they naturally arise. Prefer diversity rather than forcing all categories into one window.

1. **Hard existing blocker** — a genuine bug or failure with uncertainty.
2. **Bounded substantial implementation** — a feature or refactor with a clear completion condition.
3. **Cross-system debugging** — work spanning multiple runtime or tooling layers.
4. **Browser/computer-use engineering** — only when the current Codex/Astra surface actually exposes the relevant capability.
5. **Greenfield bounded MVP** — a real new project with an intentionally constrained first milestone.

Do not create fake tasks merely to fill a category.

## Phase 2 — hypothesis testing

After the baseline is understood, test one efficiency hypothesis at a time. Examples may include:

- a smaller Astra-specific instruction footprint;
- a different Astra reasoning-effort default;
- reduced redundant validation guidance;
- context reuse or deduplication supported by Codex;
- a lightweight post-turn scope boundary;
- another intervention discovered from baseline traces.

Each experiment must state:

1. hypothesis;
2. expected mechanism;
3. task class;
4. baseline comparison;
5. quality guardrail;
6. quota measurements;
7. result;
8. whether the intervention becomes a candidate default.

## Quality guardrail

An intervention is not an efficiency win if it reduces quota burn by making Astra materially worse at completing the requested work.

Candidate default requirement:

> lower or more predictable avoidable burn with comparable or better task completion, validation quality, and user intervention burden.

## Usage-window handling

CAE must treat 5-hour and weekly limits as independent observations.

If a window is unavailable from Codex:

- record it as `unknown` or `not_reported`;
- retain the raw safe response shape for debugging when appropriate;
- do not infer zero usage;
- do not infer unlimited usage;
- do not fabricate a reset time.

If the two windows disagree about whether new work is possible, the receipt should record the disagreement rather than inventing a single authoritative state.

## First-window operating rule

During the first actual Astra 5-hour window:

- prioritize genuine needed work;
- inspect usage after meaningful task boundaries, not every few seconds;
- keep the run in normal Codex unless evidence shows the integration itself is corrupting behavior;
- preserve failures;
- stop the campaign when the account is naturally blocked or when continuing would no longer produce useful evidence.

The goal is to learn the real Plus cost curve, not to maximize the number of prompts.

## Receipt minimum

A local receipt should be able to express at least:

```json
{
  "plan": "plus",
  "model": "astra",
  "codexVersion": "unknown",
  "taskClass": "cross-system-debugging",
  "startedAt": "...",
  "endedAt": "...",
  "fiveHour": {
    "startUsedPercent": null,
    "endUsedPercent": null,
    "status": "not_reported"
  },
  "weekly": {
    "startUsedPercent": null,
    "endUsedPercent": null,
    "status": "not_reported"
  },
  "outcome": "PASS",
  "humanInterventions": 0,
  "notes": []
}
```

The schema may evolve after the first real Astra sessions. Do not freeze fields that Codex does not reliably expose.

## Public evidence rule

Before CAE claims that a setting or intervention improves Astra efficiency on Plus, the repository should contain a reproducible methodology and multiple real-work receipts supporting that claim. One successful anecdote is not enough.
