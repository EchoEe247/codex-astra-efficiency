# Astra Plus Usage Field Notes — 2026-09-04

## Purpose

These notes capture early ChatGPT Plus user reports about GPT-6 Astra inside Codex during the first day of rollout. They are **field signals, not controlled measurements** and must not be used as universal usage-rate claims.

The purpose is to sharpen Codex Astra Efficiency (CAE) test design before spending the project's clean Astra allowance windows.

## Strongest current signals

### 1. Task breadth can dominate allowance burn

Multiple Plus-user reports describe very rapid 5-hour depletion when Astra is given broad or repository-wide work. One report described Astra High exhausting a Plus 5-hour window in roughly ten minutes without finishing. Another described a full-project evaluation on a very large production repository at `xhigh` consuming the entire 5-hour window in one run, while still reporting that Astra accomplished substantially more work than prior Sol attempts.

Interpretation for CAE:

- broad audits and repository-wide reconnaissance are high-risk task classes;
- allowance burn must be judged against useful work completed, not elapsed minutes alone;
- Window 0 should not use a broad repository audit as its first live task.

Source:
- https://www.reddit.com/r/codex/comments/1w7j5jf/astra_release_megathread/

### 2. Low reasoning is not automatically cheap

A Plus-user report in the release megathread said Astra Low consumed roughly 40% of the 5-hour limit while creating a bounded but non-trivial greenfield implementation of about 800 lines.

Interpretation for CAE:

- reasoning effort matters, but task size and implementation breadth also matter materially;
- CAE must not claim that selecting Low alone makes Astra efficient;
- Low remains the correct Window 0 starting point because it is the native production default on the tested account, not because it is assumed inexpensive.

Source:
- https://www.reddit.com/r/codex/comments/1w7j5jf/astra_release_megathread/

### 3. Subagents are a plausible burn multiplier

A Plus-user recommendation in the release discussion explicitly warned against allowing Astra to invoke subagents after observing rapid allowance consumption on broad work. Other current community discussions also describe multiple simultaneous workers as a major usage pattern.

Interpretation for CAE:

- Window 0 Task 1 should prohibit subagents/delegated workers so the first receipt is easier to interpret;
- delegated work should later be tested as a separate variable rather than mixed into the first live measurement;
- this is a hypothesis, not yet a validated CAE default.

Sources:
- https://www.reddit.com/r/codex/comments/1w7j5jf/astra_release_megathread/
- https://www.reddit.com/r/codex/comments/1w7ahu8/pro_5x_100_usd_users_has_your_weekly_usage_quota/

### 4. High burn can still be efficient

Positive reports describe Astra completing difficult work in fewer turns or substantially less elapsed time than Sol. This means a large allowance delta is not necessarily waste if the run replaces several failed/repeated lower-model attempts or completes a task that otherwise would not finish.

Interpretation for CAE:

- optimize **useful completed work per allowance**, not percentage preservation by itself;
- do not reward settings that reduce burn by lowering completion quality;
- classify productive premium compute separately from avoidable premium compute.

Sources:
- https://www.reddit.com/r/codex/comments/1w7j5jf/astra_release_megathread/
- https://www.reddit.com/r/codex/comments/1w7eedj/astra_feels_genuinely_next_level_wtf/

## Official OpenAI context

OpenAI states that Plus includes limited Astra usage in Work/Codex and that Astra can consume allowance faster than Sol depending on task, input/output size, reasoning setting, and Fast mode.

Source:
- https://help.openai.com/en/articles/20001275

The OpenAI model guidance also recommends starting at `low` when migrating from models/settings that used none/minimal reasoning, while preserving effective reasoning effort otherwise. This supports treating reasoning level as a measured control variable rather than assuming higher is always better.

Source:
- https://developers.openai.com/api/docs/guides/latest-model

## Window 0 implications

For the first live CAE task:

- use the authoritative `codexu` runtime;
- use Astra `low` because it is the native default discovered on the tested Plus account;
- do not enable Fast mode;
- do not allow subagents/delegated workers;
- do not request a full-repository audit;
- constrain the task to the live measurement path only;
- permit at most one high-confidence defect/fix in Task 1;
- stop after Task 1 and capture quota/hook evidence before deciding whether Task 2 is justified.

## Current hypothesis updates

- **H1 strengthened:** repository breadth/context is a likely major burn driver.
- **H2 strengthened:** broad reconnaissance can have poor allowance economics when it does not directly enable a bounded deliverable.
- **H4 refined:** reasoning effort matters, but Low can still be expensive on sufficiently broad work.
- **H6 strengthened:** scope expansion can convert Astra capability into poor Plus allowance economics.
- **H7 added:** subagent/delegated execution may materially amplify allowance burn and should be isolated as its own experiment.

## Evidence rule

These field notes are social evidence only. CAE must not publish claims such as "Low saves X%" or "subagents cost Y%" from these reports. Any public efficiency claim requires controlled CAE receipts from the user's own Plus account under documented task/settings conditions.
