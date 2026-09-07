# Experimental Budget-Aware Astra Mode

Status: experimental design for the next genuine Astra task. This document does not change the frozen PR #22 candidate and does not claim proven savings.

## Goal

Test whether giving GPT-6 Astra a short, truthful view of the user's current ChatGPT Plus allowance can reduce avoidable Astra burn while preserving useful completed work.

The intended loop is:

1. read authoritative 5-hour and weekly allowance state;
2. provide Astra a compact budget-awareness capsule before the task;
3. let Astra perform the user's real task normally;
4. record native token counters, allowance movement, and task outcome;
5. compare later against comparable work without the capsule;
6. automate only if the intervention repeatedly helps without degrading quality.

## Why this belongs in CAE

Monitoring and efficiency are one loop, not separate products. Measurement tells CAE whether an intervention actually helped. The intervention gives Astra enough operational context to avoid obvious waste such as unnecessary scope expansion, repeated context loading, redundant validation loops, or broad investigation after the requested objective is already proven.

The optimization target remains:

> maximize useful completed work per unit of Astra allowance by reducing avoidable burn.

CAE must not optimize for short answers or low token counts at the expense of task completion.

## First experiment: manual capsule, no runtime injection yet

PR #22 is frozen for its final genuine live token-attribution sample. Do not modify that candidate merely to add this experiment.

For the next significant real Astra task, keep the exact frozen PR #22 runtime and include the budget-awareness capsule directly in the user's task prompt. This allows one genuine task to exercise the existing measurement candidate while also producing the first budget-aware sample.

Before the task, obtain the current authoritative CAE quota/readiness state. Fill only values that are actually available. Unknown values stay `unknown`.

Suggested compact capsule:

```text
[CAE BUDGET CONTEXT — applies to the task below; do not acknowledge this block separately.]
ChatGPT Plus / GPT-6 Astra. Current allowance: 5h remaining {five_hour_remaining}; weekly remaining {weekly_remaining}. Preserve task quality and finish the requested objective. Be allowance-aware: prefer the shortest sound path, reuse already-known context, avoid speculative scope expansion, repeated broad repo scans, redundant validation after a decisive pass, and unnecessary rework. Do not stop productive work merely to save usage. Stop when the requested objective is completed and adequately validated.
```

Keep the capsule short. Do not inject raw prompts, source, paths, account identity, raw session IDs, or guessed quota values.

## Why manual first

Current upstream Codex supports `UserPromptSubmit.hookSpecificOutput.additionalContext`, so CAE can later automate this. However, current Codex behavior appends that developer context after the user's prompt, where it can become unusually salient and compete with the actual task. The first experiment therefore keeps the intervention explicit and inspectable rather than immediately changing hook semantics.

If the manual experiment survives useful-work validation, the next implementation should use a short task-anchor and explicit opt-in rather than silently enabling global prompt injection.

## First-sample evidence to capture

The significant task should record:

- exact CAE commit / PR candidate;
- Codex version;
- model and reasoning effort;
- task class;
- whether budget-awareness capsule was ON;
- authoritative 5-hour and weekly allowance before/after when available;
- native per-turn input, cached input, output, reasoning output, total/processed volume;
- context window when available;
- wall duration;
- task outcome: PASS / PARTIAL / FAIL_USEFUL / FAIL_WASTE;
- whether requested objective was completed;
- validation status;
- scope expansion/rework notes that can be recorded without private content;
- privacy check for persisted CAE state.

For PR #22's live gate, the persisted measurement must also show `attributionStatus=matched_turn` and agree with the native rollout record for that Stop turn.

## What would count as promising

One sample can establish feasibility, not savings.

A result is promising when:

- the task completes successfully;
- CAE captures exact-turn native accounting correctly;
- the capsule does not distract Astra from the task;
- there is no obvious quality regression or artificial early stopping;
- Astra avoids identifiable unnecessary work or scope expansion;
- allowance/token evidence is suitable for later comparison.

Do not claim a percentage saving from a single run.

## Later controlled comparison

After the first successful sample, compare budget-awareness ON vs OFF on comparable real work. Prefer matched task class, similar repository/context conditions, same Astra reasoning effort, stable allowance/reset authority, and the same quality criteria.

Possible metrics:

- useful-work completion rate;
- 5-hour burn points per successful task;
- weekly burn points per successful task;
- processed token volume per successful task;
- repeated context-loading / validation indicators;
- human intervention and rework;
- duration as secondary evidence.

Do not derive or publish a fixed token-to-Plus conversion formula.

## Candidate automated mode after evidence

If evidence supports the intervention, implement an opt-in mode such as:

```text
cae efficiency arm --once
cae efficiency status
cae efficiency disarm
```

The automated version should:

- read authoritative allowance state outside the hot hook path;
- persist only sanitized numeric/status data locally;
- inject a very small `UserPromptSubmit` `additionalContext` capsule for targeted Astra only;
- support one-turn arming first;
- fail open to ordinary Codex behavior;
- never block productive work because a threshold was crossed;
- never route to another model in core CAE;
- measure the result using the same passive accounting/outcome layer;
- remain disabled by default until validated.

## Non-goals

- quota bypass or reset automation;
- forcing Astra into minimal answers;
- hard token caps invented by CAE;
- hidden model routing;
- automatically lowering reasoning effort without user control;
- injecting large policy prompts on every turn;
- treating community anecdotes as proof.
