# Native Token Source Reconnaissance

## 1. Installed Codex Version

- **Authoritative v0.1 campaign runtime (`codexu` / PRoot Ubuntu 24.04):** `codex-cli 0.153.2` at `/root/.local/bin/codex`
- **Post-v0.1 genuine passive sample runtime:** `codex-cli 0.153.4` through the working `codexu`/Ubuntu-under-Termux path
- **Native Termux compatibility lane:** separately dispositioned as unsupported under the current upstream Android distribution
- **App-server surface:** the inspected Codex binaries expose `codex app-server` plus protocol schema/type generation.

## 2. Upstream Source / Protocol Inspected

- **Source authority:** generated directly from installed Codex app-server protocol surfaces (`generate-json-schema --experimental` and `generate-ts --experimental`).
- **Protocol family:** Codex App Server Protocol v2.
- **Relevant notification method:** `thread/tokenUsage/updated`.
- **Relevant turn lifecycle method:** `turn/completed`.
- **Separate account/billing method:** `account/usage/read`.

## 3. Candidate Notification and API Surfaces

### Programmatic token notification: `thread/tokenUsage/updated`

The generated protocol exposes a notification shaped like:

```typescript
type ThreadTokenUsageUpdatedNotification = {
  threadId: string;
  turnId: string;
  tokenUsage: ThreadTokenUsage;
};

type ThreadTokenUsage = {
  last: TokenUsageBreakdown;
  total: TokenUsageBreakdown;
  modelContextWindow: number | null;
};

type TokenUsageBreakdown = {
  inputTokens: number;
  cachedInputTokens: number;
  cacheWriteInputTokens: number;
  outputTokens: number;
  reasoningOutputTokens: number;
  totalTokens: number;
};
```

This is a valid programmatic app-server source. The first genuine interactive Astra sample also established that ordinary independent CLI/TUI sessions are not attached to CAE's short-lived app-server child process, so this notification is not claimed as CAE's passive attachment mechanism for those sessions.

### Turn lifecycle correlation: `turn/completed`

```typescript
type TurnCompletedNotification = {
  threadId: string;
  turn: Turn;
};

type Turn = {
  id: string;
  status: "completed" | "interrupted" | "failed" | "inProgress";
  startedAt?: number | null;
  completedAt?: number | null;
  durationMs?: number | null;
  error?: TurnError | null;
  items: Array<ThreadItem>;
};
```

### Separate account usage query: `account/usage/read`

```typescript
type GetAccountTokenUsageParams = {
  threadId?: string | null;
};
```

The response contains account/billing-oriented usage information such as estimated credits. CAE keeps this separate from physical model token counters.

## 4. Exact Token Field Semantics

### `TokenUsageBreakdown`

- **`inputTokens`:** native input-token count for the turn (`last`) or cumulative thread (`total`). Cached input is a subset of this value, not an additional input bucket to add again.
- **`cachedInputTokens`:** cached subset of input.
- **`cacheWriteInputTokens`:** cache-write input when the backend reports it.
- **`outputTokens`:** native model output-token count.
- **`reasoningOutputTokens`:** reasoning-output subset when reported.
- **`totalTokens`:** native combined processing count. In the observed native breakdown, this is consistent with `inputTokens + outputTokens`.

### `ThreadTokenUsage`

- **`last`:** token breakdown for the most recent turn represented by that native payload.
- **`total`:** cumulative token breakdown for the thread.
- **`modelContextWindow`:** model context capacity. This is not the same thing as per-turn token consumption or peak occupancy.

### CAE derived fields

- **`processedVolume`:** `totalTokens` when valid; otherwise a safe-integer `inputTokens + outputTokens` only when both are valid.
- **`cacheLeverage`:** `cachedInputTokens / inputTokens` only when `cachedInputTokens <= inputTokens` and the denominator is valid.
- **`reasoningFraction`:** `reasoningOutputTokens / outputTokens` only when `reasoningOutputTokens <= outputTokens` and the denominator is valid.

Malformed, negative, unsafe-integer, impossible cross-field, or missing values remain `null` rather than being clamped or guessed.

## 5. Local Rollout Transcript Source

Read-only inspection of native Codex rollout JSONL files confirmed the same underlying counters in local entries such as:

- `token_usage_record`
  - `thread_id`
  - `turn_id`
  - `turn_token_usage`
  - `thread_token_usage`
- `event_msg` with `payload.type = token_count`
  - `info.model_context_window`
  - and, depending on runtime shape, token-count summary information.

The first genuine post-v0.1 sample proved that the native `Stop` hook supplies `transcript_path` for the active rollout. This makes a bounded local transcript-tail read the least-invasive passive source currently proven for ordinary interactive CLI/TUI work.

## 6. Current-Turn Attribution Requirement

Physical counters are useful only if CAE can prove which turn they belong to.

The hardened rule is:

1. A targeted Astra `Stop` hook supplies transient native `session_id` and `turn_id` plus `transcript_path`.
2. CAE reads at most the bounded transcript tail (`TRANSCRIPT_TAIL_SCAN_BYTES = 2 MiB`).
3. For native `token_usage_record` entries that expose `thread_id` and `turn_id`, CAE compares those values in memory to the current Stop hook's native IDs.
4. Only the exact matching record is accepted with `attributionStatus=matched_turn`.
5. If the current tagged record has not flushed, CAE returns no token measurement. It does **not** reuse the latest previous-turn record.
6. Context-window metadata is read only from `token_count` entries between the selected token record and the next `token_usage_record`, preventing a later turn from donating context metadata to an earlier turn.
7. A single unidentified synthetic/legacy token record can be represented only as `unverified_single_record`; multiple unidentified records are never guessed between.
8. Duplicate Stop hooks for the same most-recent opaque CAE turn key do not append duplicate measurement rows.

Only `matched_turn` transcript attribution is suitable as authoritative per-turn evidence in the next genuine live validation sample.

## 7. Capability and Version Uncertainties

1. **Protocol schema:** proven from generated installed-Codex protocol material for the inspected runtime.
2. **Local session log format:** observed and fixture-tested, but it remains an upstream implementation surface that can drift in future Codex versions.
3. **Interactive passive capture:** empirically established from one genuine sample as command-hook + local transcript behavior. The hardened exact-turn binding still requires the next genuine Astra maintenance sample before PR #22 merge.
4. **Casing:** protocol notifications use camelCase while rollout logs use snake_case. CAE accepts both at normalization boundaries where appropriate.
5. **Notification persistence:** app-server notifications are transport events and should not be assumed durable after process restart.
6. **Cache-write field presence:** native/provider variants may omit it; missing remains unknown rather than being invented.
7. **Future upstream drift:** if native rollout records stop exposing enough identity to prove current-turn binding, CAE must degrade to unavailable/unverified measurement rather than silently treating the latest record as authoritative.

## 8. Privacy Implications

Native protocol/transcript surfaces can contain identifiers and highly sensitive content, including prompts, source, tool calls, diffs, and assistant responses.

Strict rules:

- **No raw native IDs in persistent CAE state.** `threadId` / `turnId` or transcript `thread_id` / `turn_id` may exist transiently in memory for matching, then are discarded.
- **Opaque correlation uses namespaced SHA-256.** CAE's current `sessionKey` / `turnKey` implementation is deterministic SHA-256 with namespace separation. It is **not HMAC** and must not be documented as HMAC.
- **No prompt/transcript persistence.** CAE scans only candidate JSONL lines needed for token accounting and persists approved numeric fields, opaque keys, and safe status metadata—not prompt text, responses, diffs, tool payloads, repository paths, or transcript paths.
- **Fail open.** Any parse/read/persistence failure must not block or cancel the Codex turn.

## 9. Why Account Usage Is Not Physical Token Usage

`account/usage/read`, Plus rate-limit windows, and physical model token counters answer different questions.

1. **Account/billing/entitlement signals** describe plan- or billing-oriented usage surfaces.
2. **Physical token counters** describe native model processing volumes.
3. **Plus 5-hour/weekly allowance movement** is separately observed from native rate-limit windows.
4. No public fixed token-to-Plus-point formula is established by these observations.
5. Correlation can generate hypotheses; it cannot be promoted as OpenAI's internal accounting formula without direct evidence.

## 10. Selected Implementation Path

1. **Normalization layer (`src/token-usage.js`)**
   - zero runtime dependencies;
   - safe integer/type validation;
   - last-turn and cumulative counters separated;
   - impossible or missing derived metrics remain `null`.

2. **Primary live passive capture (`src/hook.js` + `src/token-usage.js`)**
   - targeted Astra Stop hook;
   - 2 MiB bounded transcript-tail read;
   - exact current-turn binding for tagged records;
   - segment-bounded context metadata;
   - explicit attribution status;
   - duplicate-Stop idempotency;
   - fail-open behavior.

3. **Programmatic app-server path (`src/app-server.js`)**
   - parse protocol-supported `thread/tokenUsage/updated` notifications;
   - retain as an integration/research surface, not as an attachment claim for independent interactive terminal sessions.

4. **Local storage (`measurements.jsonl`)**
   - separate append-only measurement stream;
   - restricted POSIX modes with best-effort correction where implemented;
   - no automatic network upload;
   - bounded reverse-tail read for the common `--last-turn` query.

## 11. Merge Gate

PR #22 remains **DO NOT MERGE** until a genuine Astra maintenance turn on the exact frozen candidate demonstrates:

- native Stop correlation and transcript record both resolve to the same current turn;
- persisted record reports `attributionStatus=matched_turn`;
- persisted numeric counters agree with the native rollout evidence for that turn;
- privacy invariants remain clean;
- non-Astra no-op remains intact;
- cross-platform CI remains green.
