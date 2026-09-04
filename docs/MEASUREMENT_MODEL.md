# CAE Measurement Model

Status: **pre-Astra measurement authority**.

## Purpose

CAE exists to help ChatGPT Plus users get more useful real work from GPT-6 Astra in normal Codex without turning Codex into a different agent framework.

That requires separating what CAE **observes** from what it **infers**.

A short or cheap run is not automatically efficient. A long or expensive run is not automatically wasteful.

The project therefore uses this evidence hierarchy:

1. **Observed facts** — directly reported by Codex or deliberately recorded by the test campaign.
2. **Derived measurements** — deterministic calculations from observed facts, such as a stable-window percentage delta.
3. **Signals** — patterns worth investigating, such as repeated unchanged reads or large scope expansion.
4. **Efficiency hypotheses** — proposed mechanisms that may reduce avoidable burn.
5. **Validated interventions** — changes that survived real-work testing with quality guardrails.

CAE must not skip directly from an observed fact to a product claim.

## Run descriptor

The baseline receipt should prefer coarse, privacy-safe descriptors rather than repository content:

- plan tier;
- exact Astra model identity;
- Codex version;
- reasoning effort;
- Standard/Fast service tier when exposed;
- task class;
- project-scale bucket;
- fresh task vs continuation;
- context-size bucket when exposed reliably.

Do not require prompts, code, repository names, file paths, transcript text, account IDs, or user identity to compare Astra runs.

## Allowance observations

When available from Codex, record independently:

- 5-hour window start/end used percentage and reset authority;
- weekly window start/end used percentage and reset authority;
- ordinary included-usage permission;
- model-specific/multi-bucket limit state;
- purchased-credit balance if the native rate-limit response exposes it;
- reset-credit availability when exposed.

A missing window is `not_reported`, not zero and not unlimited.

A reset-crossing or non-monotonic percentage change is not labeled as usage burn.

## Work evidence

Where it can be recorded without changing normal Codex behavior, capture:

- wall-clock runtime;
- whether the requested objective completed;
- validation/test status;
- human intervention count;
- subagent count or delegated-worker activity;
- coarse tool classes used, such as shell, code edit, build, tests, Git, search, browser/computer;
- whether the run expanded materially beyond the requested scope;
- whether substantial rework was needed afterward;
- whether the run was mainly reconnaissance/assessment, implementation, validation, or mixed work.

Unknown evidence stays unknown.

## Why these fields matter

Early Astra Pro field reports show that similar wall-clock durations can have very different allowance costs depending on task breadth, reasoning mode, project scale, context state, and tool use.

Examples already recorded in `docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md` include:

- a broad codebase audit with high weekly burn despite no subagents;
- browser/computer research at Medium with noticeable burn but materially faster execution;
- a short cross-service migration run over a 19-microservice project with high weekly burn;
- reconnaissance/refactor assessment consuming meaningful purchased credits.

Therefore CAE should not optimize for prompts per week or minutes per week.

## Core evaluation target

The long-term target is approximately:

`useful completed work / Astra allowance burn`

But CAE v0.x must **not** emit a universal numeric efficiency score before the project has enough evidence to define one without misleading users.

The initial product should show the underlying measurements and clearly separate facts from interpretation.

## Avoidable-burn candidates

These are research targets, not confirmed waste:

- repeated rediscovery of already-established project state;
- unnecessary broad repository scans;
- redundant validation after no relevant change;
- unrequested scope expansion;
- repeated context reconstruction after compaction;
- same information gathered independently by multiple workers;
- expensive reconnaissance that does not lead to a decision, implementation, or diagnostic result.

A behavior only becomes an optimization target after the Plus baseline demonstrates both:

1. it contributes meaningfully to Astra allowance burn; and
2. reducing it does not materially degrade completion quality, validation quality, or user autonomy.

## Product guardrail

CAE must never make an efficiency claim solely because a configuration:

- shortens runtime;
- uses a lower reasoning setting;
- reads fewer files;
- runs fewer tests;
- consumes a smaller percentage in one anecdotal run.

The quality guardrail remains:

> Lower or more predictable avoidable burn with comparable or better completion, validation quality, and intervention burden.

## Privacy rule

The default measurement path should be useful without storing user project content.

If a future advanced local-only feature needs richer data, it must be separately justified and opt-in. Public/exported receipts should remain anonymized by construction.
