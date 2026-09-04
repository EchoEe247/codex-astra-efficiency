# Pre-Runtime Readiness Receipt — 2026-09-04

## Result

**PASS for source/protocol foundation and cross-platform unit validation.**

**Installed signed-in Codex runtime validation remains required before native integration or Plus quota claims are considered proven.**

## Product contract preserved

The current implementation remains within the locked CAE scope:

- ChatGPT Plus first;
- Codex first;
- Astra only;
- normal Codex launch and native model-picker workflow;
- strict non-Astra no-op behavior;
- no proxy, alternate client, model router, account pool, or agent framework;
- no Astra efficiency intervention before an observe-only real-work baseline;
- local-first measurement with no raw prompt/code/transcript requirement.

## Foundation now implemented

### Native hook path

- CAE-owned `UserPromptSubmit` and `Stop` handlers.
- Exact model-id filtering.
- Fail-open hook behavior.
- No baseline context injection, prompt rewrite, permission change, tool change, or model change.
- Opaque SHA-256 `sessionKey` / `turnKey` correlation instead of raw session/turn identifiers.
- Raw prompt, last assistant message, cwd, and transcript path are not persisted by the baseline observer.

### Safe setup lifecycle

- Upstream-compatible `CODEX_HOME` resolution: explicit environment override or default `~/.codex`.
- Non-destructive hooks merge.
- Idempotent setup.
- CAE-owned-handler-only uninstall.
- Malformed user hook structures are rejected before mutation.
- Atomic same-directory writes.
- `cae setup --dry-run`, `cae uninstall --dry-run`, and hook-readiness reporting in `cae doctor`.

### Native app-server path

- Current upstream initialize / initialized handshake implemented over `codex app-server --listen stdio://`.
- `account/rateLimits/read` support.
- `model/list` support.
- Read-only `cae probe` surface.
- No browser-cookie scraping or duplicated OpenAI authentication.

### Plus usage normalization

- 300-minute and 10,080-minute windows classified by duration rather than assuming transport slot meaning.
- `not_reported`, `partial`, `malformed`, and `conflicting` states remain explicit.
- Reset-boundary and non-monotonic changes are not mislabeled as usage burn.
- Optional plan type, reset timestamps, limit buckets, ordinary-usage availability, and reset-credit count are retained only when reported.
- Raw account id is excluded from the normalized persisted receipt path.

### Native Astra discovery

- Native `model/list` catalog can be inspected without changing user configuration.
- Visible Astra-named entries preserve their exact native model identifier and reasoning-effort metadata.
- Discovery returns `not_found`, `single_candidate`, or `ambiguous`.
- A single candidate is advisory only; CAE does not silently activate it until native picker hook identity is proven.

### Run receipts

- Local receipt start/end primitives exist.
- Receipt can record exact model, Codex version, task class, timestamps, duration, outcome, optional human-intervention count, start/end normalized quota, and reset-aware 5-hour/weekly deltas.
- Supported outcomes: `PASS`, `PARTIAL`, `FAIL_USEFUL`, `FAIL_WASTE`, `UNKNOWN`.
- No default prompt/code/transcript content is required.

## Test evidence

GitHub Actions run **#47** (`33912250716`) on commit `136f069b4c9af6b261bff377d7f64782d88b1791` completed **SUCCESS**.

Matrix:

- Ubuntu / Node 20 — **PASS**
- Ubuntu / Node 22 — **PASS**
- Windows / Node 22 — **PASS**

Each matrix job runs:

```text
npm test
npm run check
```

This validates the current source/unit behavior on Linux and Windows but does **not** substitute for a real Codex installation with ChatGPT authentication.

## Upstream source/protocol evidence used

Current `openai/codex` source was inspected for:

- stable/default-enabled hook registration;
- `UserPromptSubmit` and `Stop` input fields including `session_id`, `turn_id`, and `model`;
- `CODEX_HOME` resolution;
- hook output behavior;
- app-server newline-delimited JSON transport and initialize handshake;
- `account/rateLimits/read` response schema;
- `model/list` request/response schema.

These observations are compatibility leads, not runtime guarantees for every installed Codex version.

## Remaining hard gates

Follow `docs/NATIVE_RUNTIME_VALIDATION.md`.

Before Astra availability, a real signed-in Codex environment must prove:

1. `cae doctor` sees the installed Codex version and intended hooks location.
2. `cae probe` / `cae quota` work or fail cleanly without private web scraping.
3. CAE hook setup is safe and idempotent on actual user configuration.
4. A temporary exact current-model target receives native `UserPromptSubmit` / `Stop` events.
5. A different non-target model creates no CAE observation.
6. Short-lived app-server reads coexist with a normal active Codex session.
7. Uninstall removes only CAE-owned handlers and Codex remains healthy.

When Astra reaches the Plus account, additional proof must establish:

8. the exact native Astra catalog/picker model identifier;
9. the same exact identifier in native hook input;
10. normal Astra turns can be measured without changing the Codex experience;
11. observe-only real-work receipts exist before any efficiency default is enabled.

## Current decision

**Do not add Astra optimization behavior yet.**

The correct next move is installed-runtime validation. Source work is sufficiently mature that adding speculative optimization logic now would create complexity without evidence and would risk violating the native-Codex product contract.
