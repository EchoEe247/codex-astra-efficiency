# Codex Integration Reconnaissance

Status: **initial source reconnaissance; runtime validation still required**.

This document records the least-invasive integration paths currently visible in the upstream `openai/codex` source. CAE must not depend on an internal behavior until it is validated against a real installed Codex build.

## Design requirement

The preferred integration must let the user continue to:

1. launch Codex normally;
2. select Astra from the normal model picker;
3. submit normal prompts;
4. use normal Codex permissions, tools, plan mode, worktrees, and other native behavior.

CAE should activate only when the active model is Astra and remain inert for every other model.

## Current upstream findings

### 1. Codex has a first-class hook system

Current upstream source exposes hook events including:

- `SessionStart`
- `SessionEnd`
- `UserPromptSubmit`
- `PreToolUse`
- `PostToolUse`
- `PreCompact`
- `PostCompact`
- `SubagentStart`
- `SubagentStop`
- `Stop`
- `Interrupt`

This is materially better for CAE than replacing Codex with a custom agent client if the installed release exposes the same hook behavior.

### 2. Turn-scoped hook input exposes the active model

The current generated schema for `UserPromptSubmit` includes a `model` string in the hook input. The current `Stop` hook input also includes `model`, along with session/turn identifiers and transcript path information.

This creates a strong Astra-only integration hypothesis:

> Install a normal Codex hook that immediately exits without changing behavior unless the hook input identifies Astra.

That would allow a global CAE installation to leave Luna, Sol, Terra, and other models untouched even when users switch models through the native picker.

### 3. UserPromptSubmit may inject additional context

The current `UserPromptSubmit` hook output schema supports optional `additionalContext`.

This may eventually provide a low-friction Astra-specific assist mechanism without replacing the user's prompt or introducing a separate task UI.

**Important:** observe-only baseline must not inject optimization context. Any Astra-specific context injection is an experiment requiring evidence that it reduces avoidable burn without degrading task quality.

### 4. Codex app-server exposes rate-limit state

Current upstream app-server documentation exposes `account/rateLimits/read` and rolling rate-limit updates. App-server is a JSON-RPC interface used to power richer Codex clients.

This is a promising source for Plus allowance snapshots because it uses Codex's own authenticated state rather than scraping ChatGPT pages or harvesting browser cookies.

Runtime questions remain:

- Can CAE query the same authoritative state while the user runs the normal TUI/app without creating a conflicting session?
- Is the local daemon/proxy path available and stable across supported platforms?
- Which rate-limit windows are exposed on Plus at Astra launch?
- Are window identities stable enough to classify by duration rather than transport slot names?
- What happens when the 5-hour window is temporarily absent?

Until these are validated, CAE must not promise a particular quota transport.

### 5. App-server emits turn completion and token usage

Current app-server docs state that `turn/completed` includes final turn state and token usage. This may be useful for detailed receipts if CAE can observe the native session safely.

However, CAE's core public metric should remain allowance burn and task outcome. Raw token accounting alone does not represent Plus-plan cost accurately enough to be the product objective.

## Preferred architecture hypothesis

The current least-invasive direction is:

```text
Normal Codex
    |
    +-- native model picker
    |
    +-- Codex hooks
            |
            +-- CAE hook handler
                    |
                    +-- if model != Astra: no-op
                    +-- if model == Astra: local observe/assist path

Codex authenticated rate-limit source
    |
    +-- local CAE snapshots/receipts
```

This is a hypothesis, not yet an implementation guarantee.

## Observe-only hook behavior

For the baseline phase, an Astra hook should do as little as possible:

- identify event type;
- identify model;
- if not Astra, exit immediately;
- if Astra, record only safe local metadata required by the experiment;
- return `continue: true`;
- do not inject context;
- do not block;
- do not alter permissions;
- do not alter tools;
- do not change the selected model.

## Assist behavior after validation

Potential future Astra-only assist behavior may use supported hook output to provide a very small efficiency instruction or state hint. This must remain subordinate to the user's actual prompt and native Codex behavior.

Examples worth testing, not assuming:

- avoid rerunning unchanged validation without a reason;
- stop expanding scope after the requested objective and required validation are complete;
- reuse already-established repository facts rather than rediscovering them after avoidable context churn.

These should not become defaults until measured.

## Compatibility strategy

CAE must version-check the installed Codex integration surface.

At minimum, `cae doctor` should eventually determine:

- Codex executable found;
- Codex version;
- hook support present;
- hook input schema compatible enough for Astra filtering;
- rate-limit read path available or unavailable;
- CAE storage writable;
- integration state clean;
- non-Astra no-op behavior validated locally.

Unsupported behavior should fail closed: CAE should disable the affected feature rather than guessing.

## Security and privacy requirements

CAE must avoid:

- collecting OpenAI passwords;
- collecting API keys unnecessarily;
- scraping browser cookies;
- uploading transcripts by default;
- uploading code or prompts by default;
- broad shell interception unrelated to Codex hooks;
- modifying Codex auth state.

If transcript paths are exposed by hooks, CAE should not read transcript contents unless a specific local feature requires it and the user has enabled that feature. Metadata-only operation should be the default.

## Upstream source paths inspected

Current reconnaissance used these areas of `openai/codex`:

- `codex-rs/app-server/README.md`
- `codex-rs/app-server-protocol/...`
- `codex-rs/hooks/...`
- generated hook input/output schemas

Because Codex is actively developed, CAE tests must treat upstream compatibility as a moving contract and pin observed behavior to Codex versions in receipts.

## Next technical proof

Before building the full CLI, create a minimal proof that:

1. installs a safe test hook;
2. receives `UserPromptSubmit`/`Stop` events from a normal Codex session;
3. sees the model chosen in the native model picker;
4. performs a strict no-op for non-Astra models;
5. records only local metadata;
6. can be removed without leaving Codex configuration damaged.

Then separately validate authoritative Plus rate-limit reading.
