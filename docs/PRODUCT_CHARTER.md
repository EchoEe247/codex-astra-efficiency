# Product Charter

## Mission

Codex Astra Efficiency exists to help ChatGPT Plus users get more useful real work from Astra inside Codex without replacing or complicating the native Codex workflow.

The product is deliberately model-specific. CAE activates only for Astra and leaves every other Codex model alone.

## Target user

Primary users are ordinary ChatGPT Plus Codex users through professional developers who:

- already understand how to open Codex and choose a model;
- want to use Astra for real software work;
- do not want to adopt an agent framework just to make Astra usable;
- care about the 5-hour and weekly allowance because expensive mistakes reduce how much useful Astra work they can complete;
- value capable autonomous work and do not want efficiency controls that turn Astra into a minimal-task model.

Heavy custom-agent users may still benefit, but they are not the product-design center.

## Product contract

### Codex should still feel like Codex

A user should be able to keep this mental model:

1. Open Codex normally.
2. Select Astra normally.
3. Give Astra a normal task.
4. Let Astra work normally.
5. Optionally inspect what the run consumed and whether CAE found validated ways to reduce avoidable burn.

If CAE requires users to learn a new task language, restructure repositories, manage unrelated models, or accept frequent confirmation gates, the core product has failed.

### Astra means Astra

CAE v0.x must not silently route Astra work to Luna, Sol, Terra, or another provider. Model substitution may be interesting research, but it changes the product promise and is out of scope for the core Astra efficiency layer.

### Efficiency means useful work, not short work

A 90-minute Astra run that completes a hard feature can be highly efficient. A 10-minute run that repeatedly rereads context and fails can be inefficient.

Primary objective:

> maximize useful completed work per unit of Astra allowance by reducing avoidable burn.

Duration, token count, file count, and tool-call count are diagnostic signals, not optimization targets by themselves.

## What CAE may optimize

Only after measurement and validation, CAE may improve Astra-specific behavior in areas such as:

- unnecessary repeated context loading;
- redundant validation loops;
- avoidable scope expansion beyond the user's objective;
- inefficient Astra-specific defaults;
- instruction/context footprint where the same task quality can be preserved;
- quota blindness across the 5-hour and weekly windows.

## What CAE must not do by default

- terminate productive turns because a usage threshold was crossed;
- force users onto smaller tasks;
- rewrite user repositories or AGENTS.md merely to satisfy CAE;
- manage non-Astra models;
- require a new agent orchestration framework;
- send prompts, code, file paths, or telemetry to a CAE server;
- claim to increase, bypass, reset, or circumvent OpenAI usage limits;
- infer missing usage windows as zero or unlimited;
- ship an optimization simply because it sounds token-efficient.

## Experience levels

CAE may expose different amounts of information without changing the underlying Codex workflow:

- **Quiet:** remain invisible unless something materially important occurs.
- **Normal:** concise Astra usage/outcome summary after useful boundaries.
- **Detailed:** local diagnostic receipt for users who want to inspect behavior.

These are visibility choices, not different agent frameworks.

## Initial product sequence

1. **Technical reconnaissance** — establish the least-invasive supported Codex integration path.
2. **Observe-only foundation** — identify Astra turns, capture safe local metadata, and read exposed Plus rate-limit state without changing Astra behavior.
3. **Real-work baseline campaign** — use Astra normally on a Plus account and record 5-hour/weekly burn, runtime, task outcome, and human intervention.
4. **Efficiency experiments** — test one intervention at a time against comparable real work.
5. **Validated defaults** — only adopt interventions that reduce avoidable burn without materially degrading completion quality or the native Codex experience.
6. **Fast public v0.1** — release once Astra-specific claims are backed by real Plus evidence and the install/uninstall path is clean.

## Success criteria

CAE succeeds when a normal Plus user can install it, continue using Codex essentially the same way, select Astra intentionally, and obtain measurably better visibility and/or efficiency without having to become an agent-systems expert.
