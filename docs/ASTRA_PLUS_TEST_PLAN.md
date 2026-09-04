# Astra Plus Real-Work Test Plan

## Purpose

The first Astra campaign must answer a practical Plus-user question:

> How much useful real work can Astra complete inside the actual ChatGPT Plus Codex allowance, and which avoidable behaviors materially reduce that value?

This is not a benchmark campaign. Synthetic toy tasks are not the primary evidence source.

Measurement authority: [`MEASUREMENT_MODEL.md`](MEASUREMENT_MODEL.md).
Early Pro evidence: [`ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md`](ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md).

## Test philosophy

- Use work that genuinely needs to be done.
- Keep Astra inside normal Codex behavior for the first baseline window.
- Treat failures as evidence.
- Record the 5-hour and weekly windows separately.
- Do not optimize based on one anecdotal run.
- Do not count wall-clock time as success by itself.
- Do not stop a productive run merely to preserve a prettier quota number.
- Do not translate Pro percentage burn directly into Plus percentage burn.
- Record task shape because project breadth, continuity, reasoning mode, and tool use may matter as much as elapsed time.

## Phase 0 — pre-Astra readiness

Before Astra is available to the test Plus account:

- validate Codex integration and model detection;
- validate rate-limit snapshot reading against the currently installed Codex version;
- create fixtures for full, partial, missing, contradictory, shared-default, and model-specific rate-limit states;
- validate local receipt storage;
- ensure CAE remains inert when a non-Astra model is active;
- establish clean install, disable, and uninstall procedures;
- capture the Codex version used for every experiment;
- keep the measurement path privacy-safe without requiring prompts, code, repository names, or transcript contents.

## Phase 1 — observe-only baseline

No efficiency intervention is allowed during the first baseline campaign beyond passive observation required to collect the measurements.

For each real Astra task, record where reliably available:

### Run identity

- timestamp;
- plan tier;
- Codex version;
- exact detected model slug;
- reasoning effort;
- Standard vs Fast service tier.

### Task shape

- task class;
- project-scale bucket;
- fresh task vs continuation of existing work;
- context-size bucket if Codex exposes it safely and reliably;
- whether the work is mainly reconnaissance/assessment, implementation, validation, or mixed.

### Agent activity

- wall-clock duration;
- turn count where reliably observable;
- human intervention count;
- subagent/delegated-worker count when exposed;
- coarse tool classes used: shell, code edit, build, tests, Git, search, browser/computer, or other safe categories;
- whether the task expanded materially beyond the requested scope.

### Allowance state

- selected quota authority: exact model bucket or shared default;
- starting 5-hour usage snapshot, if available;
- ending 5-hour usage snapshot, if available;
- starting weekly usage snapshot, if available;
- ending weekly usage snapshot, if available;
- purchased-credit balance before/after if the native Codex rate-limit response exposes it;
- reset-credit state when exposed.

### Outcome quality

- outcome;
- whether the requested objective completed;
- validation evidence/status;
- unexpected agent behavior;
- whether substantial rework was needed afterward.

### Outcome vocabulary

- **PASS** — requested objective completed and validation passed.
- **PARTIAL** — meaningful progress, but completion required another model/human or remained unfinished.
- **FAIL_USEFUL** — task failed, but produced substantial diagnostic value or reduced uncertainty.
- **FAIL_WASTE** — meaningful allowance burn without useful completion or diagnostic value.

## Preferred baseline workload classes

Choose tasks from real active work as they naturally arise. Prefer diversity rather than forcing all categories into one window.

1. **Hard existing blocker** — a genuine bug or failure with uncertainty.
2. **Bounded substantial implementation** — a feature or refactor with a clear completion condition.
3. **Broad repository/codebase analysis** — only when genuinely needed; early Pro reports suggest this can be a high-burn class worth measuring separately.
4. **Cross-system or cross-service debugging/refactor** — work spanning multiple runtime, repository, service, or tooling layers.
5. **Browser/computer-use engineering** — only when the current Codex/Astra surface actually exposes the relevant capability.
6. **Greenfield bounded MVP** — a real new project with an intentionally constrained first milestone.

Do not create fake tasks merely to fill a category.

## Early Pro-informed hypotheses

These are questions for the Plus baseline, not defaults:

- **H1: Repository breadth/context is a major burn driver.** Wide audits, large refactors, multi-service work, and inherited context may consume disproportionately more allowance than wall-clock duration suggests.
- **H2: Reconnaissance-only Astra work may have lower value density.** Status reconstruction, branch scanning, or broad reading may be poor Astra use unless it directly enables a high-value decision or implementation.
- **H3: Computer use may be expensive but still efficient.** Faster and more reliable browser/computer execution may justify noticeable burn when it replaces retries or manual work.
- **H4: Reasoning level matters, but task shape matters too.** Medium is not assumed cheap; Ultra/High are not assumed wasteful.
- **H5: Repeated rediscovery may be a high-confidence optimization target.** Avoiding unnecessary reconstruction of already-established project state may save usage without restricting real work.

## Phase 2 — hypothesis testing

After the baseline is understood, test one efficiency hypothesis at a time. Examples may include:

- a smaller Astra-specific instruction footprint;
- a different Astra reasoning-effort default;
- reduced redundant validation guidance;
- context reuse or deduplication supported by Codex;
- preserving established project-state facts across safe turn boundaries;
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

## Usage-window and quota-authority handling

CAE must treat 5-hour and weekly limits as independent observations.

If a window is unavailable from Codex:

- record it as `unknown` or `not_reported`;
- retain the raw safe response shape for debugging when appropriate;
- do not infer zero usage;
- do not infer unlimited usage;
- do not fabricate a reset time.

If the two windows disagree about whether new work is possible, the receipt should record the disagreement rather than inventing a single authoritative state.

If purchased credits are exposed by the same native rate-limit source, record the backend-provided balance as an observation. Do not assume its unit or convert it to dollars unless Codex explicitly provides that meaning.

If Codex exposes exactly one rate-limit bucket whose `normalModelSlug` matches the active Astra model id, that bucket is preferred for Astra allowance deltas. If no such bucket exists and the default snapshot has no model slug, CAE may use it as a **shared-default** authority and must label it as such. Multiple exact matches are ambiguous; a default assigned to a different model is not an Astra authority.

When the authority is shared-default, controlled baseline runs should avoid simultaneous Codex work on the same account where practical. Otherwise unrelated activity can contaminate the measured delta. CAE should record that limitation rather than pretending a shared meter is model-exclusive.

## First-window operating rule

During the first actual Astra 5-hour window:

- prioritize genuine needed work;
- inspect usage after meaningful task boundaries, not every few seconds;
- keep the run in normal Codex unless evidence shows the integration itself is corrupting behavior;
- preserve failures;
- avoid deliberately choosing only tiny tasks to make the quota look efficient;
- stop the campaign when the account is naturally blocked or when continuing would no longer produce useful evidence.

The goal is to learn the real Plus cost curve, not to maximize the number of prompts.

## Receipt minimum

A local receipt should be able to express at least:

```json
{
  "plan": "plus",
  "model": "astra",
  "codexVersion": "unknown",
  "reasoningEffort": null,
  "serviceTier": null,
  "taskClass": "cross-system-debugging",
  "projectScale": null,
  "continuity": null,
  "startedAt": "...",
  "endedAt": "...",
  "usageDelta": {
    "authority": {
      "status": "stable",
      "kind": "shared_default"
    },
    "fiveHour": {
      "status": "not_reported"
    },
    "weekly": {
      "status": "not_reported"
    }
  },
  "outcome": "PASS",
  "requestedObjectiveCompleted": true,
  "validationStatus": "passed",
  "humanInterventions": 0,
  "subagentCount": null,
  "toolClasses": [],
  "scopeExpanded": null,
  "reworkNeeded": null
}
```

The schema may evolve after the first real Astra sessions. Do not freeze fields that Codex does not reliably expose.

## Public evidence rule

Before CAE claims that a setting or intervention improves Astra efficiency on Plus, the repository should contain a reproducible methodology and multiple real-work receipts supporting that claim. One successful anecdote is not enough.

Public claims must distinguish:

- observed facts;
- deterministic measurements;
- signals/hypotheses;
- validated interventions.

A single Pro or Plus complaint is evidence to investigate, not a universal usage rate.
