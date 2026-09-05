# Astra Plus Real-Work Test Plan

## Purpose

The Astra campaign exists to answer a practical Plus-user question:

> How much useful real work can Codex Astra Efficiency preserve or improve inside the actual ChatGPT Plus Astra allowance, and which avoidable behaviors materially reduce that value?

This is **product-first testing**. We are testing CAE with Astra, not benchmarking Astra first and adding CAE later. Synthetic toy tasks are not the primary evidence source.

Measurement authority: [`MEASUREMENT_MODEL.md`](MEASUREMENT_MODEL.md).
Window 0 authority: [`ASTRA_WINDOW_0_SHAKEDOWN.md`](ASTRA_WINDOW_0_SHAKEDOWN.md).
Early field evidence: [`ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md`](ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md).

## Test philosophy

- Use work that genuinely needs to be done.
- Preserve a small normal-Astra control segment before promoting an optimization default.
- Treat failures as evidence.
- Record the 5-hour and weekly windows separately.
- Do not optimize based on one anecdotal run.
- Do not count wall-clock time, prompt count, or raw token count as success by itself.
- Do not stop productive work merely to preserve a prettier quota number.
- Do not translate Pro/Business percentage burn directly into Plus percentage burn.
- Record task shape because repository breadth, continuity, reasoning mode, tool use, validation loops, and scope expansion may matter as much as elapsed time.
- Distinguish model behavior, user/task-shaping behavior, CAE behavior, and mixed causes when diagnosing waste.

## Campaign architecture

CAE uses three stages, but only two clean serious 5-hour campaigns.

### Window 0 — partial-allowance live shakedown

Use only the Plus allowance already remaining before any banked reset.

Purpose:

- prove the production Astra model identity;
- prove live Astra hook targeting;
- prove the quota-authority shape;
- prove end-to-end receipt capture;
- find integration/measurement defects cheaply before a clean reset;
- perform one or, if justified, two bounded pieces of useful CAE work.

Window 0 is not a full-window efficiency baseline and must never be presented as one.

Follow [`ASTRA_WINDOW_0_SHAKEDOWN.md`](ASTRA_WINDOW_0_SHAKEDOWN.md).

### Window 1 — clean early-release campaign

Start only after Window 0 defects are fixed and the candidate commit is frozen.

Use **one** banked reset so that the campaign begins from a documented clean allowance state when the reset actually exposes 100% of both relevant windows.

Window 1 begins with a deliberately bounded **pass-through/control segment**: CAE measures real Astra work but does not yet apply a new efficiency intervention. This establishes a same-account, same-product reference without spending an entire clean window on naked baseline testing.

After reviewing that control segment, activate only the highest-confidence intervention(s) justified by prior evidence and continue with genuine real work. The remainder of Window 1 is an early-release product campaign, not a benchmark suite.

### Window 2 — release-candidate validation

Do not use the second banked reset merely to accelerate the schedule.

After Window 1, fix/harden with non-Astra tools and wait for the next normal 5-hour window. Window 2 validates the release-candidate build under normal use. It is not the place for speculative new interventions.

A major Window 2 defect blocks release until fixed and revalidated appropriately.

## Phase 0 — zero-Astra readiness

Before spending Astra inference:

- validate Codex integration and model detection;
- validate rate-limit snapshot reading against the installed Codex version;
- validate local receipt storage;
- ensure CAE remains inert when a non-Astra model is active;
- establish clean install, disable, and uninstall procedures;
- capture the Codex version used for every experiment;
- keep the measurement path privacy-safe without requiring prompts, code, repository names, or transcript contents;
- finish launcher-equivalence validation in the actual Termux environment;
- run automated tests on Ubuntu, Windows, and macOS;
- record real Termux validation separately because ordinary Linux CI does not reproduce Android/Termux/Bionic behavior.

Once Astra appears on the test Plus account, native runtime evidence overrides pre-launch assumptions. Do not guess the production model slug from marketing names.

## Required measurement for every meaningful Astra task

Record where reliably available:

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
- fresh task vs continuation;
- context-size bucket if exposed safely/reliably;
- whether the work is mainly reconnaissance, implementation, validation, or mixed.

### Agent activity

- wall-clock duration;
- turn count where reliably observable;
- human intervention count;
- subagent/delegated-worker count when exposed;
- coarse tool classes: shell, code edit, build, tests, Git, search, browser/computer, or other safe categories;
- whether the task expanded materially beyond the requested scope.

### Allowance state

- selected quota authority: exact model bucket or shared default;
- starting and ending 5-hour snapshots;
- starting and ending weekly snapshots;
- purchased-credit balance before/after if exposed by the same native source;
- reset-credit state when exposed.

### Outcome quality

- outcome;
- requested objective completed?;
- validation evidence/status;
- unexpected agent behavior;
- substantial rework needed afterward?;
- whether any apparent savings came from reducing work quality.

### Outcome vocabulary

- **PASS** — requested objective completed and validation passed.
- **PARTIAL** — meaningful progress, but completion required another model/human or remained unfinished.
- **FAIL_USEFUL** — task failed, but produced substantial diagnostic value or reduced uncertainty.
- **FAIL_WASTE** — meaningful allowance burn without useful completion or diagnostic value.

## Preferred real-work classes

Choose tasks from active work as they naturally arise. Prefer diversity without manufacturing work.

1. **Hard existing blocker** — genuine bug/failure with uncertainty.
2. **Bounded substantial implementation** — feature/refactor with a clear completion condition.
3. **Broad repository/codebase analysis** — only when genuinely needed; isolate this because field reports suggest it can be a high-burn class.
4. **Cross-system debugging/refactor** — multiple runtimes, repositories, services, or tooling layers.
5. **Browser/computer-use engineering** — only when the current surface exposes the relevant capability.
6. **Greenfield bounded MVP** — real new work with a constrained first milestone.

Do not create fake tasks merely to fill a category.

## Reasoning-effort policy during early testing

Start Window 0 and the Window 1 control segment at Astra **Medium** unless live evidence strongly requires another setting.

Reasoning level is a measured variable, not a status symbol. Escalate deliberately when a task demonstrates a genuine reasoning ceiling; do not default to High/Very High simply because Astra is the premium model.

A lower setting is not an efficiency win if it creates retries, incorrect changes, or significant rework. A higher setting is not automatically wasteful if it completes work that the lower setting cannot.

## Early hypotheses

These are questions, not defaults:

- **H1: Repository breadth/context is a major burn driver.** Wide audits, large refactors, inherited context, and multi-service work may consume disproportionately more allowance than wall-clock duration suggests.
- **H2: Reconnaissance-only Astra work may have lower value density.** Broad status reconstruction may be poor Astra use unless it directly enables a high-value decision or implementation.
- **H3: Tool/computer work may be expensive but efficient.** Noticeable burn can be justified when it replaces retries or manual work.
- **H4: Reasoning level matters, but task shape matters too.** Medium is not assumed cheap; High is not assumed wasteful.
- **H5: Repeated rediscovery is a high-confidence candidate target.** Avoiding unnecessary reconstruction of established project state may save usage without restricting useful work.
- **H6: Scope expansion can convert capability into poor allowance economics.** CAE should detect or reduce avoidable expansion without artificially shrinking legitimate ambitious tasks.

## Intervention protocol

After a control segment exists, test one intervention or tightly coupled intervention set at a time where practical.

Each experiment must state:

1. hypothesis;
2. expected mechanism;
3. task class;
4. baseline/control comparison;
5. quality guardrail;
6. quota measurements;
7. result;
8. whether the intervention becomes a candidate default.

Possible interventions include:

- smaller Astra-specific instruction footprint;
- reasoning-effort recommendation/default guidance;
- reduced redundant validation guidance;
- context reuse or deduplication supported by Codex;
- preserving established project-state facts across safe boundaries;
- lightweight scope preservation;
- another intervention discovered from Window 0/1 evidence.

## Quality guardrail

An intervention is not an efficiency win if it lowers quota burn by making Astra materially worse at completing the requested work.

Candidate default requirement:

> lower or more predictable avoidable burn with comparable or better task completion, validation quality, and user intervention burden.

## Cause classification

For material burn/failure events, classify the best-supported cause as one of:

- **MODEL** — behavior appears intrinsic to Astra under the observed task/settings;
- **USER/TASK** — avoidable breadth, ambiguity, or task shaping primarily drove the outcome;
- **CAE** — CAE introduced unnecessary context, retries, interference, or measurement overhead;
- **MIXED** — multiple causes materially contributed;
- **UNKNOWN** — evidence is insufficient.

Do not use this classification to blame users. It exists to avoid implementing the wrong product fix.

## Usage-window and quota-authority handling

CAE must treat 5-hour and weekly limits as independent observations.

If a window is unavailable from Codex:

- record it as `unknown` or `not_reported`;
- retain the safe response shape for debugging when appropriate;
- do not infer zero usage, unlimited usage, or a reset time.

If the two windows disagree about whether new work is possible, record the disagreement rather than inventing a single state.

If purchased credits are exposed by the same native rate-limit source, record the backend-provided balance as an observation. Do not assume its unit or convert it to dollars unless Codex explicitly provides that meaning.

If Codex exposes exactly one rate-limit bucket whose `normalModelSlug` matches the active Astra model id, prefer that bucket for Astra deltas. If no such bucket exists and the default snapshot has no model slug, CAE may use it as a **shared-default** authority and must label it as such. Multiple exact matches are ambiguous; a default assigned to a different model is not an Astra authority.

When the authority is shared-default, controlled Astra runs should avoid simultaneous Codex work on the same account where practical. Otherwise unrelated activity can contaminate the delta.

## Window 1 operating rule

During the first clean early-release campaign:

- begin from a documented allowance snapshot;
- run a bounded pass-through/control task first;
- inspect usage only at meaningful task boundaries;
- keep native Codex behavior intact;
- promote only interventions supported by evidence;
- preserve failures;
- avoid selecting only tiny tasks to make quota efficiency look favorable;
- continue productive work until the account is naturally blocked or further work would no longer produce useful evidence.

The goal is useful completed work per allowance, not maximum prompt count.

## Window 2 operating rule

Window 2 is release-candidate validation:

- no speculative new efficiency feature should be enabled during the campaign;
- use normal native model selection;
- use the candidate defaults intended for v0.1;
- verify Astra-only activation, non-Astra no-op, quota visibility, receipts, privacy, install/uninstall, and real-work quality;
- record any release-blocking regression directly.

## Receipt minimum

A local receipt should be able to express at least:

```json
{
  "plan": "plus",
  "model": "astra",
  "codexVersion": "unknown",
  "reasoningEffort": null,
  "serviceTier": null,
  "campaign": "window_0|window_1_control|window_1_optimized|window_2_rc",
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
  "causeClass": "UNKNOWN",
  "requestedObjectiveCompleted": true,
  "validationStatus": "passed",
  "humanInterventions": 0,
  "subagentCount": null,
  "toolClasses": [],
  "scopeExpanded": null,
  "reworkNeeded": null
}
```

The schema may evolve after real Astra sessions. Do not freeze fields Codex does not reliably expose.

## Public evidence rule

Before CAE claims that a setting or intervention improves Astra efficiency on Plus, the repository must contain reproducible methodology and multiple real-work receipts supporting that claim. One successful anecdote is not enough.

Public claims must distinguish:

- observed facts;
- deterministic measurements;
- signals/hypotheses;
- validated interventions.

A single Pro/Plus complaint is evidence to investigate, not a universal usage rate.
