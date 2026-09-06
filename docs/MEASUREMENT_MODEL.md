# CAE Measurement Model

Status: **v0.1 observability authority / post-release measurement baseline**.

## Purpose

CAE exists to help ChatGPT Plus users get more useful real work from GPT-6 Astra in normal Codex without turning Codex into a different agent framework.

For that to be trustworthy, the project has to keep one distinction clear: what CAE **observes** is not the same thing as what CAE **infers**.

A short or cheap run is not automatically efficient. A long or expensive run is not automatically wasteful.

Use this evidence hierarchy:

1. **Observed facts** — directly reported by Codex or deliberately recorded by a controlled campaign.
2. **Derived measurements** — deterministic calculations from those facts, such as a stable-window percentage delta.
3. **Signals** — patterns worth investigating, such as repeated unchanged reads or large scope expansion.
4. **Efficiency hypotheses** — proposed mechanisms that may reduce avoidable burn.
5. **Validated interventions** — changes that survive real-work testing with quality guardrails.

CAE should not jump from an observation directly to a product claim because the conclusion sounds reasonable.

## Run descriptor

Prefer coarse, privacy-safe descriptors rather than repository content:

- plan tier;
- exact Astra model identity;
- Codex version;
- reasoning effort;
- Standard/Fast service tier when exposed;
- task class;
- project-scale bucket;
- fresh task versus continuation;
- context-size bucket when exposed reliably.

Do not require prompts, code, repository names, file paths, transcript text, account IDs, or user identity to compare runs.

## Allowance observations

When Codex exposes them, record independently:

- 5-hour window start/end used percentage and reset authority;
- weekly window start/end used percentage and reset authority;
- ordinary included-usage permission;
- model-specific or multi-bucket limit state;
- purchased-credit balance when exposed natively;
- reset-credit availability when exposed.

A missing window is `not_reported`, not zero and not unlimited.

A reset-crossing or non-monotonic percentage change is not labeled as usage burn.

### Model-aware quota authority

Codex app-server responses can contain a default rate-limit snapshot plus `rateLimitsByLimitId` buckets. A bucket can also expose `normalModelSlug`, which can identify the normal model associated with that quota alias.

CAE must not assume the default snapshot is always Astra's only relevant meter.

Selection rules:

1. If exactly one normalized bucket has `normalModelSlug` exactly matching the active native Astra model id, use that bucket as the model-specific authority.
2. If more than one bucket exactly matches, report ambiguity instead of choosing heuristically.
3. If no exact model bucket exists and the default snapshot has no `normalModelSlug`, the default can be used as a **shared account allowance** authority.
4. If the default explicitly names a different model, do not use it as Astra's authority.
5. Do not infer model identity from `limitName`, display text, bucket-key substrings, or percentages.
6. Start and end snapshots need the same authority kind/key. If the backend changes authority shape during a run, record `authority_changed` rather than combining different meters.

A shared-default delta is still useful evidence, but it stays labeled shared. Simultaneous activity elsewhere on the same allowance can contaminate it, so controlled cost observations should avoid unrelated concurrent Codex work.

## Work evidence

Where it can be recorded without changing normal Codex behavior, capture:

- wall-clock runtime;
- whether the objective completed;
- validation/test status;
- human intervention count;
- subagent or delegated-worker activity;
- coarse tool classes such as shell, code edit, build, tests, Git, search, browser/computer;
- material scope expansion;
- substantial rework afterward;
- whether the run was mainly reconnaissance, implementation, validation, or mixed work.

Unknown evidence stays unknown.

## Why these fields matter

Early Astra field reports showed that similar wall-clock durations could have very different allowance costs depending on task breadth, reasoning mode, project scale, context state, and tool use.

That means I do not want CAE optimized around prompts-per-week or minutes-per-week. Those numbers are easy to count but do not describe useful work by themselves.

Historical examples remain in `docs/ASTRA_PRO_USAGE_FIELD_NOTES_2026-09-04.md` and the Plus campaign records.

## Core evaluation target

The long-term target is approximately:

`useful completed work / Astra allowance burn`

CAE v0.x should **not** emit a universal numeric efficiency score until there is enough evidence to define one without misleading users.

The product should expose the underlying measurements first and keep fact separate from interpretation.

## Avoidable-burn candidates

These are research targets, not confirmed waste:

- repeated rediscovery of already-established project state;
- unnecessary broad repository scans;
- redundant validation after no relevant change;
- unrequested scope expansion;
- repeated context reconstruction after compaction;
- the same information gathered independently by multiple workers;
- expensive reconnaissance that does not lead to a decision, implementation, or useful diagnostic result.

A behavior becomes an optimization target only after evidence shows both:

1. it contributes meaningfully to allowance burn; and
2. reducing it does not materially degrade completion quality, validation quality, or user autonomy.

## Product guardrail

CAE must not make an efficiency claim solely because a configuration:

- shortens runtime;
- uses a lower reasoning setting;
- reads fewer files;
- runs fewer tests;
- consumes a smaller percentage in one anecdotal run.

The quality guardrail remains:

> Lower or more predictable avoidable burn with comparable or better completion, validation quality, and intervention burden.

## Privacy rule

The default measurement path should be useful without storing project content.

If a future advanced local-only feature needs richer data, it must be separately justified and opt-in. Public or exported receipts should remain anonymized by construction.
