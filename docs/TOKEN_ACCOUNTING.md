# Native token accounting

CAE's long-term measurement goal is to learn from normal Astra work rather than manufacture an endless sequence of special benchmarks.

A real Astra task can expose several different quantities. They must remain separate.

## Four distinct measurements

### 1. Native model token counters

When Codex exposes them, CAE may record numeric counters such as:

- uncached input tokens;
- cached input tokens;
- output tokens;
- reasoning tokens when separately exposed;
- total/processed token volume.

These counters describe model processing. They are **not automatically equivalent to ChatGPT Plus allowance consumption**.

### 2. Context occupancy

Codex may report a current context-window size and how many tokens are occupying it.

Context occupancy is not the same as turn token consumption. A continued session can have a large context even when a particular turn adds comparatively little new material.

### 3. Plus allowance movement

CAE measures native 5-hour and weekly windows independently when Codex exposes them authoritatively.

A numerical before/after delta is valid only when CAE can prove the snapshots use the same quota authority and the same reset period. Unknown or crossed reset boundaries remain unavailable rather than guessed.

### 4. Useful work outcome

Token or allowance cost has meaning only beside task outcome. A high-cost run can be efficient if it completes substantial useful work; a cheap run can still be wasteful if it produces little value or causes heavy rework.

Useful-work metadata should remain small and privacy-safe, for example:

- task class;
- completion outcome (`PASS`, `PARTIAL`, `FAIL_USEFUL`, `FAIL_WASTE`);
- objective completed or not;
- validation result;
- files changed count when intentionally supplied/derived without storing paths;
- subagent/tool flags;
- scope expansion;
- rework needed;
- wall duration.

## Privacy boundary

Token accounting must never require CAE to persist:

- raw prompts;
- model responses;
- source code;
- transcript text;
- raw cwd/repository paths;
- account identity;
- credentials;
- raw native session or turn ids.

Correlation should reuse CAE's opaque hashed session/turn keys where possible.

## Proposed per-turn record

A future privacy-safe record may resemble:

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

Fields that native Codex does not expose should be `null`/unavailable rather than estimated.

## Derived metrics

Derived metrics are exploratory and must not be presented as OpenAI's quota formula.

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

This is an observed relationship, not a guaranteed conversion rate.

### Outcome-normalized work

Over many real tasks, CAE can compare task classes using completion rate, rework, validated findings/fixes, allowance movement, token volume, and duration together.

## Task taxonomy

A small stable taxonomy is preferable to hundreds of benchmark labels:

- audit/review;
- bug diagnosis;
- focused fix;
- multi-fix implementation;
- feature implementation;
- refactor;
- documentation/reconciliation;
- validation/release;
- large-repository exploration.

Users should not need to change how they prompt Astra merely to fit the taxonomy.

## Passive collection strategy

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

CAE should not burn Astra allowance solely to produce more samples when genuine useful work can provide the same evidence.

## Future CLI direction

Possible local-only commands:

```text
cae tokens --last-turn
cae tokens --session <opaque-key>
cae receipt --last-turn
```

Implementation must parse only numeric/native metadata needed for measurement and avoid copying transcript content into CAE state.

## Efficiency interventions

No intervention becomes a default merely because a correlation looks promising. Before promotion it should have:

- a documented mechanism;
- real Astra Plus evidence;
- a pass-through/control comparison;
- acceptable completion quality;
- no forced change to normal Codex task style;
- clean disable/fallback behavior;
- strict non-Astra no-op behavior.

Until those conditions are met, CAE should remain observability-first and report what it knows without pretending to know OpenAI's internal allowance formula.