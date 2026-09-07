# Product Charter

## Mission

Codex Astra Efficiency exists to help ChatGPT Plus users get more useful real work from Astra inside Codex without replacing or complicating the normal Codex workflow.

The project is deliberately model-specific. CAE activates only for Astra and leaves every other Codex model alone.

## Who I am building it for

The center of the product is the normal ChatGPT Plus Codex user through the professional developer who:

- already knows how to open Codex and choose a model;
- wants to use Astra for real software work;
- does not want to adopt an agent framework just to make Astra usable;
- cares about the 5-hour and weekly allowance because avoidable burn reduces how much useful Astra work fits inside it;
- values capable autonomous work and does not want an efficiency layer that turns Astra into a minimal-task model.

Heavy custom-agent users may still benefit, but they are not the design center.

## Product contract

### Codex should still feel like Codex

A user should be able to keep this mental model:

1. Open Codex normally.
2. Select Astra normally.
3. Give Astra a normal task.
4. Let Astra work normally.
5. Inspect what the run consumed and, as the project matures, whether CAE has validated ways to reduce avoidable burn.

If CAE requires a new task language, repository restructuring, unrelated model management, or frequent confirmation gates just to function, then the product has moved away from its purpose.

### Astra means Astra

CAE v0.x does not silently route Astra work to Luna, Sol, Terra, or another provider.

Model substitution can be a separate research idea, but it changes the product promise. The core CAE layer is about understanding and improving Astra use, not hiding a model router underneath it.

### Efficiency means useful work, not short work

A 90-minute Astra run that completes a difficult feature can be highly efficient. A 10-minute run that repeatedly rereads context and fails can be inefficient.

Primary objective:

> maximize useful completed work per unit of Astra allowance by reducing avoidable burn.

Duration, token count, file count, and tool-call count are evidence. They are not optimization targets by themselves.

## What CAE may optimize

Only after measurement and validation, CAE may improve Astra-specific behavior in areas such as:

- unnecessary repeated context loading;
- redundant validation loops;
- avoidable scope expansion beyond the user's objective;
- inefficient Astra-specific defaults;
- instruction/context footprint where the same task quality can be preserved;
- quota blindness across the 5-hour and weekly windows.

The point is to remove waste without making Astra less capable or forcing users to change the kind of work they give it.

## What CAE must not do by default

- terminate productive turns because a usage threshold was crossed;
- force users onto smaller tasks;
- rewrite repositories or `AGENTS.md` merely to satisfy CAE;
- manage non-Astra models;
- require a new agent orchestration framework;
- send prompts, code, file paths, or telemetry to a CAE server;
- claim to increase, bypass, reset, or circumvent OpenAI usage limits;
- infer missing usage windows as zero or unlimited;
- ship an optimization because it merely sounds token-efficient.

## Experience levels

CAE may expose different amounts of information without changing the underlying Codex workflow:

- **Quiet:** stay invisible unless something materially important occurs.
- **Normal:** concise Astra usage/outcome summaries at useful boundaries.
- **Detailed:** local diagnostic receipts for users who want to inspect behavior.

These are visibility choices, not separate agent frameworks.

## Product sequence

The project has moved through these stages:

1. **Technical reconnaissance** — find the least-invasive Codex integration path.
2. **Observe-only foundation** — identify Astra turns, capture safe local metadata, and read exposed Plus rate-limit state without changing Astra behavior.
3. **Real-work baseline campaign** — use Astra normally on a Plus account and record allowance burn, runtime, task outcome, and human intervention.
4. **v0.1.0 public release** — ship the observability-first base after live installed-artifact and cross-platform validation.
5. **Post-release measurement** — expand passive native token/accounting evidence from useful real work.
6. **Efficiency experiments** — test one intervention at a time against comparable work.
7. **Validated defaults** — promote only interventions that reduce avoidable burn without materially degrading completion quality or the native Codex experience.

I do not want the release sequence inverted so that an appealing optimization claim comes first and the evidence is gathered later.

## Success criteria

CAE succeeds when a normal Plus user can install it, continue using Codex essentially the same way, select Astra intentionally, and get trustworthy visibility and eventually measurable efficiency improvements without becoming an agent-systems expert.
