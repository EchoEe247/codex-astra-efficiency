# Native token accounting

CAE's post-v0.1 measurement direction is to learn from normal useful Astra work instead of burning allowance on an endless sequence of special benchmarks.

A real Astra task can expose several different quantities. The main rule is that those quantities stay separate instead of being collapsed into one misleading number.

## Four different measurements

### 1. Native model token counters

When Codex exposes them, CAE may record numeric counters such as:

- uncached input tokens;
- cached input tokens;
- output tokens;
- reasoning tokens when separately exposed;
- total or processed token volume.

These describe model processing. They are **not automatically equivalent to ChatGPT Plus allowance consumption**.

### 2. Context occupancy

Codex may report a context-window size and how many tokens currently occupy it.

Context occupancy is not turn token consumption. A continued session can have a large context even when one turn adds comparatively little new material.

### 3. Plus allowance movement

CAE measures native 5-hour and weekly windows independently when Codex exposes them authoritatively.

A before/after delta is valid only when CAE can prove that both snapshots use the same quota authority and reset period. Unknown or crossed reset boundaries remain unavailable rather than being guessed.

### 4. Useful work outcome

Token or allowance cost only becomes meaningful beside the outcome.

A high-cost run can still be efficient if it completes substantial validated work. A cheap run can be wasteful if it produces little value or causes heavy rework.

Useful-work metadata should stay small and privacy-safe, for example:

- task class;
- completion outcome (`PASS`, `PARTIAL`, `FAIL_USEFUL`, `FAIL_WASTE`);
- objective completed or not;
- validation result;
- files-changed count when intentionally supplied or safely derived without paths;
- subagent/tool flags;
- scope expansion;
- rework needed;
- wall duration.

## Privacy boundary

Token accounting must not require CAE to persist:

- raw prompts;
- model responses;
- source code;
- transcript text;
- raw cwd or repository paths;
- account identity;
- credentials;
- raw native session or turn ids.

Correlation should reuse CAE's opaque hashed session/turn keys where possible.

## Per-turn record direction

A privacy-safe record may resemble:

```json
{
  "schemaVersion": 1,
  "model": "gpt-6-astra",
  "reasoning": "low",
  "inputTokens": 35396,
  "cachedInputTokens": 302208,
  "outputTokens": 2472,
  "reasoningTokens": 271,
  "processedTokenVolume": 340076,
  "contextWindowTokens": 258000,
  "peakContextTokens": 45700,
  "durationSeconds": 325,
  "fiveHourBurnPoints": 2,
  "weeklyBurnPoints": 1,
  "outcome": "PASS"
}
```

Fields Codex does not expose should be `null` or unavailable rather than estimated.

## Derived metrics

Derived metrics are exploratory. They must not be presented as OpenAI's internal quota formula.

### Cache leverage

```text
cached input / (cached input + uncached input)
```

This helps distinguish a large reused context from newly processed input.

### Quota intensity

For comparable tasks, CAE may study empirical values such as:

```text
5h percentage-point burn / 100,000 processed tokens
```

That is an observed relationship, not a guaranteed conversion rate.

### Outcome-normalized work

Across many real tasks, compare task classes using completion rate, rework, validated findings/fixes, allowance movement, token volume, and duration together.

## Task taxonomy

A small stable taxonomy is more useful than hundreds of benchmark labels:

- audit/review;
- bug diagnosis;
- focused fix;
- multi-fix implementation;
- feature implementation;
- refactor;
- documentation/reconciliation;
- validation/release;
- large-repository exploration.

Users should not have to change how they prompt Astra merely to fit the taxonomy.

## Passive collection loop

The preferred post-v0.1 loop is:

```text
real Astra work
  -> privacy-safe native counters
  -> task/outcome classification
  -> aggregate patterns
  -> investigate strong signals
  -> validate one intervention
  -> release if evidence supports it
```

I do not want CAE spending Astra allowance solely to generate more samples when genuine useful work can provide the same evidence.

## Future local CLI direction

Possible local-only commands include:

```text
cae tokens --last-turn
cae tokens --session <opaque-key>
cae receipt --last-turn
```

Implementation should parse only the numeric/native metadata needed for measurement and avoid copying transcript content into CAE state.

## Efficiency interventions

No intervention becomes a default because a correlation looks promising.

Before promotion it should have:

- a documented mechanism;
- real Astra Plus evidence;
- a pass-through or control comparison;
- acceptable completion quality;
- no forced change to normal Codex task style;
- clean disable/fallback behavior;
- strict non-Astra no-op behavior.

Until those conditions are met, CAE remains observability-first and should report what it knows without pretending to know OpenAI's internal allowance formula.
