# Codex Integration Reconnaissance

Status: **source/protocol implementation complete enough for runtime proof; installed-Codex validation still required**.

This document records the least-invasive integration paths currently visible in upstream `openai/codex`. CAE must not depend on an upstream source observation as a public guarantee until it is reproduced against a real installed Codex build.

## Design requirement

The preferred integration must let the user continue to:

1. launch Codex normally;
2. select Astra from the normal model picker;
3. submit normal prompts;
4. use normal Codex permissions, tools, plan mode, worktrees, and other native behavior.

CAE should activate only when the active model is Astra and remain inert for every other model.

## Current upstream findings

### 1. Codex has a stable, default-enabled hook system

Current upstream feature registration marks Codex hooks as stable and enabled by default. Hook events include:

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

Current source resolves global hook configuration from `CODEX_HOME/hooks.json`; normal `CODEX_HOME` resolution uses the environment override when present and otherwise defaults to `~/.codex`.

This is materially better for CAE than replacing Codex with a custom agent client if the installed release exposes the same behavior.

### 2. Turn-scoped hooks expose exact session, turn, and active-model identity

Current `UserPromptSubmit` and `Stop` input structures include:

- `session_id`;
- `turn_id`;
- `transcript_path`;
- `cwd`;
- `hook_event_name`;
- `model`;
- `permission_mode`.

`UserPromptSubmit` additionally includes the raw prompt. `Stop` includes `stop_hook_active` and the last assistant message.

CAE does **not** need to persist the prompt, response, cwd, or transcript path for baseline measurement. The current implementation hashes `session_id` and `turn_id` into stable local correlation keys and records only presence flags for cwd/transcript data. This lets the start/end hook observations correlate without persisting those raw identifiers.

The Astra-only integration hypothesis is therefore:

> Install a normal Codex hook that immediately exits without changing behavior unless the hook input identifies an exact configured Astra model id.

That allows a global CAE installation to leave Luna, Sol, Terra, and other models untouched even when users switch models through the native picker.

### 3. `UserPromptSubmit` may inject additional context

The current `UserPromptSubmit` hook output supports optional `additionalContext`.

This may eventually provide a low-friction Astra-specific assist mechanism without replacing the user's prompt or introducing a separate task UI.

**Important:** observe-only baseline must not inject optimization context. Any Astra-specific context injection is an experiment requiring evidence that it reduces avoidable burn without degrading task quality.

### 4. Codex app-server exposes authoritative rate-limit state

Current upstream app-server protocol exposes `account/rateLimits/read` and rolling rate-limit updates. This is a promising Plus allowance source because it uses the installed Codex client's authenticated state rather than scraping ChatGPT pages or harvesting browser cookies.

The wire protocol is newline-delimited request/response JSON over transports such as `stdio://`. Despite JSON-RPC-like structure, current Codex source intentionally omits the JSON-RPC `jsonrpc` field. The current handshake used by CAE is:

```text
initialize
  -> initialize response
initialized notification
account/rateLimits/read
  -> rate-limit response
```

The current response schema can expose:

- plan type;
- a default rate-limit snapshot;
- per-limit-id snapshots;
- window duration in minutes;
- used percentage;
- reset timestamp;
- ordinary-usage availability;
- optional reset-credit summary.

CAE classifies the 5-hour and weekly windows by observed duration (`300` and `10080` minutes), not by assuming `primary` and `secondary` permanently mean those windows. Missing, malformed, partial, and contradictory states remain explicit.

Runtime questions remain:

- Can CAE query the same authoritative state while the user runs normal Codex without a conflicting session?
- Which windows are exposed on the actual Plus account at Astra launch?
- Can a 5-hour window be absent while weekly remains present?
- Do model-specific limit buckets appear for Astra?
- Does the installed Codex version preserve the current app-server method/shape?

Until these are validated, CAE must not promise a particular quota transport.

### 5. Native model catalog provides an exact picker-discovery surface

Current app-server exposes `model/list`. Model entries include an exact `model` identifier, display name, hidden/default state, default reasoning effort, supported reasoning efforts, service tiers, and other capability metadata.

CAE now has a read-only discovery helper that can identify visible entries containing an `Astra` model token and preserve their exact native `model` values. Discovery is **advisory only**:

- zero candidates => `not_found`;
- one candidate => `single_candidate`;
- multiple candidates => `ambiguous`.

A single catalog candidate is not silently activated. The release-time target must also be proven to be the exact model value delivered by native `UserPromptSubmit`/`Stop` hook input after the user selects Astra in the picker.

This provides a path to simple setup without hard-coding an unverified pre-release slug.

### 6. App-server emits turn completion and token usage

Current app-server also exposes turn-completion state and token usage. This may later enrich receipts if CAE can observe the native session safely.

However, CAE's core public metric remains Plus allowance burn plus real-work outcome. Raw token accounting alone does not represent Plus-plan value accurately enough to be the product objective.

## Current CAE implementation

The private foundation now includes:

- exact configured Astra target filtering;
- strict non-Astra no-op hook behavior;
- fail-open hook execution;
- privacy-safe session/turn correlation keys;
- non-destructive global hook setup/uninstall primitives;
- `cae setup --dry-run` and `cae uninstall --dry-run`;
- `cae doctor` hook-readiness inspection;
- local app-server quota reader;
- duration-aware rate-limit normalization;
- native model-catalog reader and conservative Astra candidate discovery;
- `cae probe` for read-only quota/model integration reconnaissance;
- privacy-minimal local run-receipt primitives.

None of these source/protocol implementations count as installed-runtime proof yet.

## Preferred architecture

```text
Normal Codex
    |
    +-- native model picker
    |
    +-- Codex hooks
            |
            +-- CAE hook handler
                    |
                    +-- if model != exact Astra target: strict no-op
                    +-- if model == exact Astra target: local observe/assist path

Installed Codex app-server
    |
    +-- account/rateLimits/read
    +-- model/list
            |
            +-- local CAE snapshots / discovery / receipts
```

## Observe-only hook behavior

For the baseline phase, an Astra hook should do as little as possible:

- identify event type and exact model;
- if not Astra, exit immediately;
- if Astra, record only safe local metadata required by the experiment;
- correlate start/end with opaque session/turn keys;
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

These should not become defaults until measured against real Astra work.

## Compatibility strategy

At minimum, runtime validation and later `cae doctor` behavior should establish:

- Codex executable found and version recorded;
- global hooks file readable;
- CAE hook setup remains idempotent and non-destructive;
- native hook input contains the expected event/model/session/turn fields;
- native picker Astra selection maps to the exact configured target;
- non-Astra selections create no CAE observation;
- app-server model catalog is available or explicitly unavailable;
- rate-limit read path is available or explicitly unavailable;
- CAE local storage is writable.

Unsupported behavior should disable the affected CAE feature rather than guess.

## Security and privacy requirements

CAE must avoid:

- collecting OpenAI passwords;
- collecting API keys unnecessarily;
- scraping browser cookies;
- persisting raw prompts/responses by default;
- persisting raw cwd or transcript paths by default;
- uploading transcripts/code/prompts by default;
- broad shell interception unrelated to Codex hooks;
- modifying Codex auth state.

Current baseline observations do not read transcript contents. Raw session and turn ids are transformed into opaque correlation keys before persistence.

## Upstream source areas inspected

Current reconnaissance used:

- `codex-rs/app-server/...`
- `codex-rs/app-server-protocol/...`
- `codex-rs/app-server-test-client/...`
- `codex-rs/hooks/...`
- `codex-rs/utils/home-dir/...`
- generated app-server and hook schemas.

Because Codex is actively developed, CAE tests must pin runtime evidence to the exact installed Codex version.

## Next technical proof

The remaining gate now requires a real installed, signed-in Codex environment:

1. run CI/local tests on the target platform;
2. run `cae doctor` and read-only `cae probe`;
3. dry-run then install the CAE-owned hooks;
4. run normal Codex with a non-target model and prove no CAE event is created;
5. when Astra is available, select Astra through the native picker and prove `UserPromptSubmit`/`Stop` carry the same exact model id;
6. prove the two hook events correlate by opaque turn key;
7. prove app-server quota reads can coexist with a normal active Codex session;
8. uninstall and verify user-owned hook configuration remains intact.
