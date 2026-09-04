# GPT-6 Astra Pro Usage Field Notes — 2026-09-04

Status: **early field evidence; anecdotal unless marked official**.

## Why this exists

CAE is being built for ChatGPT Plus users, but Astra reached Pro users first. The early Pro rollout gives us useful evidence about what kinds of work consume Astra allowance, which settings matter, and where Astra may or may not produce enough useful work to justify its burn.

These reports are not a substitute for the Plus baseline. Pro 5x, Pro 20x, Plus, purchased-credit usage, and Chat usage have different denominators and rules. CAE must not directly convert one plan's percentage burn into another plan's percentage burn unless the runtime exposes an authoritative mapping.

The useful question is not "how many prompts does Astra allow?" It is:

> **How much useful completed work does a real Astra run produce per unit of allowance, under what workload and reasoning conditions?**

## Official baseline

OpenAI currently states that:

- Astra uses the existing ChatGPT Work/Codex allowance once available.
- Pro $100 and Pro $200 can use their full existing Work/Codex allowance for Astra.
- Plus includes limited Astra usage and can optionally use purchased credits after included usage is exhausted.
- Astra can consume allowance faster than GPT-5.6 Sol.
- Actual usage depends on task, input and output size, reasoning settings, and Fast mode.
- Work/Codex usage is token-based in the current flexible-pricing model rather than a fixed cost per prompt.
- Current Business/Enterprise credit rates price Astra at 250 / 25 / 1,250 credits per 1M input / cached-input / output tokens versus Sol at 100 / 10 / 500, a 2.5x token-rate ratio in that rate card.
- Astra Fast mode is 2.5x the Standard rate in the current Work/Codex rate card.
- Astra in Codex currently has a long-context exception: it does not incur the additional >272K long-context multiplier that applies to supported older models.

Official references:

- https://help.openai.com/en/articles/20001275
- https://help.openai.com/en/articles/11481834-chatgpt-rate-card
- https://openai.com/index/gpt-6-astra/

## Early Pro field reports

### Report A — Pro 5x, Ultra codebase audit

Source:
https://www.reddit.com/r/codex/comments/1w7e0bw/usage_limits_with_gpt6_astra/

Reported workload:

- one Ultra request;
- audit an existing codebase;
- no subagents spawned;
- 14 minutes 22 seconds of runtime.

Reported usage:

- **10% of weekly Pro 5x quota**.

Why CAE cares:

- broad repository auditing can be expensive even without subagents;
- wall-clock runtime alone is not enough to explain burn;
- "no subagents" does not imply low usage;
- an audit may consume significant allowance before any implementation value is produced.

### Report B — Pro 5x, Medium browser/computer research

Source:
https://www.reddit.com/r/codex/comments/1w7e0bw/usage_limits_with_gpt6_astra/

Reported workload:

- Astra Medium;
- compare Sol High vs Astra Medium coding benchmark data;
- web search failed to find the needed data;
- Astra switched to browser/computer use;
- read the release article and inspected graphs.

Reported usage:

- **3% of weekly Pro 5x quota**.

Reported performance:

- the same user said Astra Medium computer use felt **at least about 2x as fast as Sol High** for this kind of work.

Why CAE cares:

- computer use can be materially faster while still having noticeable quota cost;
- speed and allowance efficiency are different dimensions;
- the correct metric is useful result per allowance, not elapsed time or percentage alone.

### Report C — Pro 20x, existing 19-microservice project

Source observed directly in the early r/codex rollout thread shared with the project owner on 2026-09-04.

Reported workload:

- Astra resumed an existing project rather than starting from a blank prompt;
- project contains **19 microservices**;
- task was to move business logic from one service into two other services;
- communication between the services uses gRPC.

Reported usage:

- **5% of weekly Pro 20x quota in about 10 minutes**.

Why CAE cares:

- a short wall-clock run against a large distributed codebase can have very high burn;
- project breadth and context loading may dominate runtime duration;
- "continue where you left off" can still be expensive when the inherited context is large and cross-service reasoning is required.

### Report D — purchased credits, Medium campaign/refactor assessment

Source:
https://www.reddit.com/r/codex/comments/1w7e236/248_for_1_astra_prompt/

Reported workload:

- user had exhausted included Codex usage and loaded purchased credits;
- Astra Medium;
- read status documentation;
- scanned Git branches;
- assessed a refactor campaign involving breaking down a roughly 10,000-line file.

Reported marginal cost:

- **$2.48 equivalent for that run** according to the user's credit display.

Why CAE cares:

- this is a useful example of a real marginal-cost receipt after included usage is gone;
- status/reconnaissance work can be expensive even at Medium;
- CAE should distinguish "read/assess" runs from runs that actually close implementation or validation work.

### Report E — early user sees weekly bar visibly dropping

Source:
https://www.reddit.com/r/codex/comments/1w7d8r0/got_astra_in_codex/

A commenter reported that the weekly percentage bar dropped visibly during early use and, after roughly ten minutes, suggested Astra might be best used to **lead/plan a project** while less expensive models perform routine implementation.

Why CAE cares:

- this is only an early subjective routing instinct, not evidence for CAE to route models;
- however, it reinforces the product hypothesis that Astra's best value may come from high-leverage decisions rather than every implementation step;
- CAE core must still remain Astra-only and must not silently route work to other models.

### Report F — faster real task execution without usage numbers

Source:
https://www.reddit.com/r/accelerate/comments/1w7bbz7/gpt6_astra_sets_up_a_video_project_while_video/

A commenter using Astra in Codex on a Minecraft installation reported that it was doing the work well, in roughly half the time, and finding alternate solutions that Sol probably would not have produced.

Why CAE cares:

- a high-burn run can still be efficient if it completes materially more work or avoids failed/repeated attempts;
- completion quality and rework avoided must be first-class fields in CAE receipts.

## What we should not infer yet

1. **Do not translate Pro percentages directly into Plus percentages.** The denominators differ, and Plus has limited Astra access under current rollout language.
2. **Do not use prompt count as the primary unit.** One request can run for seconds or hours and can invoke very different amounts of context, tools, and reasoning.
3. **Do not assume Ultra is the only expensive mode.** Medium already appears capable of noticeable weekly burn.
4. **Do not assume faster means cheaper.** Astra computer use may finish sooner while still consuming substantial allowance.
5. **Do not assume expensive means inefficient.** A costly run that completes a difficult migration correctly can beat several cheaper failed attempts.
6. **Do not classify early complaints as a stable rate card.** Rollout behavior, client versions, model availability, and accounting can change.

## Working hypotheses for CAE testing

These are hypotheses to test, not optimization rules to ship yet.

### H1 — repository breadth/context is a major burn driver

Wide audits, multi-service migrations, large refactors, and inherited long sessions appear more expensive than their wall-clock duration alone would suggest.

### H2 — reconnaissance-only Astra work may have poor value density

Using Astra to scan documentation, inspect branches, summarize status, or retrieve information may be poor use of scarce Plus Astra allowance unless the reconnaissance itself requires Astra-level judgment or directly enables a high-value decision.

### H3 — computer use may be expensive but still efficient

If Astra is materially faster and more reliable at browser/computer work, percentage burn can be justified when it replaces multiple slower attempts. CAE needs to measure completion and rework, not just quota delta.

### H4 — reasoning level matters, but task shape matters more than labels alone

Medium can still burn meaningful quota. Ultra should be measured, but "use Medium" cannot be treated as a universal efficiency rule.

### H5 — repeated rediscovery is likely a strong optimization target

Because large-context loading appears costly, avoiding repeated codebase audits, repeated status reconstruction, and unnecessary re-reading may be one of the safest places to seek savings without reducing useful work.

### H6 — the correct optimization target is value density

The core metric should approximate:

`useful completed work / allowance burn`

not:

`prompts / week`, `minutes / week`, or `tokens / week` in isolation.

## Fields the Plus baseline should capture

Every real Astra receipt should capture, where available without violating local-first privacy:

- plan and Codex version;
- exact native Astra model id;
- reasoning effort;
- Standard vs Fast;
- task category;
- repository/project scale bucket;
- whether this is a fresh task or continuation of a large existing session;
- approximate context state or context-window bucket if Codex exposes it safely;
- subagent count or delegated-worker activity when exposed;
- major tool classes used: shell, code edits, browser/computer, search, tests, build, Git;
- start/end 5-hour allowance snapshot;
- start/end weekly allowance snapshot;
- purchased-credit delta when applicable;
- wall-clock runtime;
- whether the requested objective completed;
- tests/validation outcome;
- number of user interventions;
- whether substantial rework was needed afterward;
- whether the run mostly researched/assessed or actually implemented/closed work.

## Product implications now

The early Pro evidence strengthens CAE's existing direction rather than changing it:

- **observe before optimizing** is mandatory;
- **do not kill productive active work** merely because it is expensive;
- optimize avoidable burn such as rediscovery, uncontrolled scope expansion, redundant validation, and low-leverage reconnaissance;
- preserve native Codex and native Astra selection;
- do not route the user's other models;
- do not promise a fixed number of Astra tasks per week.

A particularly important design possibility is a future **preflight/advisory layer** that helps a user decide whether a proposed Astra run is likely to be high-value before the run begins. That remains an experiment. The first Plus campaign must remain observe-only.

## Immediate research watch

As Pro rollout continues, prioritize reports that include at least three of the following:

- plan tier;
- reasoning effort;
- task description;
- runtime;
- weekly/5-hour percentage before and after;
- token or credit receipt;
- subagent/tool usage;
- outcome quality.

Low-information "one prompt cost X" reports should be retained only when the actual work behind the prompt is known.