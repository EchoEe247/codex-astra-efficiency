# Post-v0.1 Passive Live Sample Validation Receipt

Date: 2026-09-05
Status: SAMPLE EVALUATED — CAE PASSIVE CAPTURE PARTIAL (HOOK PASS / TOKEN BINDING NOT PROVEN IN LIVE SAMPLE, HARDENED WITH ZERO INFERENCE) / HCC AUDIT PASS
Runtime: codexu (Ubuntu 24.04.4 LTS under Termux / PRoot)
Codex Binary: /root/.local/bin/codex (OpenAI Codex CLI 0.153.4)
Observation Repository: EchoEe247/codex-astra-efficiency
Target Work Product: EchoEe247/hermes-commerce-control

---

## 1. AUTHORITY & CANDIDATE IDENTITY
- Initial CAE Candidate SHA: `9e1d2b3367fbed6c8d4a313b0a027c710631fc79`
- Hardened CAE Candidate SHA: `be2437293a54b38d30e527063d3c799a4c818817`
- Branch: `post-v0.1/token-accounting-foundation` (PR #22)
- Codex CLI Version: `0.153.4`
- Model Under Work: `gpt-6-astra`
- Reasoning Effort: `low`
- Fast Mode: `OFF / UNKNOWN`
- Permissions: Standard Workspace / Approval with bypass permissions
- Banked Reset Credits Remaining: `1` (0 consumed; banked credits untouched)

---

## 2. OBSERVATION LIFECYCLE & HOOK EVALUATION
- Pre-turn Event Count: `20`
- Post-turn Event Count: `23` (+3 events recorded)
- Events Captured:
  - `UserPromptSubmit` at `2026-09-06T04:11:10.872Z` (model: `gpt-6-astra`, sessionKey: `044ca232...`, turnKey: `9a625f95...`, permissionMode: `default`)
  - `UserPromptSubmit` at `2026-09-06T04:15:28.230Z` (model: `gpt-6-astra`, sessionKey: `044ca232...`, turnKey: `a46c6780...`, permissionMode: `bypassPermissions`)
  - `Stop` at `2026-09-06T04:26:10.741Z` (model: `gpt-6-astra`, sessionKey: `044ca232...`, turnKey: `a46c6780...`, permissionMode: `bypassPermissions`)
- Correlation: `PASS` — stable opaque turnKey and sessionKey match between submit and stop
- Privacy Compliance: `PASS`
  - Raw prompt text omitted: `YES`
  - Raw assistant output omitted: `YES`
  - Absolute working directory path omitted: `YES` (`cwdPresent: true` flag only)
  - Repository name and path omitted: `YES`
  - Account identifier and credentials omitted: `YES`
  - Raw native thread/turn UUIDs omitted: `YES` (HMAC SHA-256 opaque keys only)

---

## 3. TOKEN NOTIFICATION EVALUATION & HARDENING
- Live Passive Token Capture: `NOT_PROVEN` in initial PR #22 candidate.
  - Reason: PR #22 candidate only registered JSON-RPC notification handlers in `src/app-server.js` (for programmatic app-server invocations). In interactive CLI runs, Codex communicates through command hooks (`UserPromptSubmit` and `Stop`). `src/hook.js` was not wired to extract token data or call `appendTurnMeasurement`.
- Zero-Inference Root Cause Diagnosis & Hardening:
  - Inspecting the native session rollout log (`~/.codex/sessions/**/rollout-*.jsonl`) referenced by `transcript_path` revealed that native Codex emits complete `token_usage_record` and `event_msg:token_count` entries at the end of turns.
  - Hardened `src/hook.js` and `src/token-usage.js` with fail-open `readTokenUsageFromTranscript` in commit `be24372`.
  - Added regression test suite in `test/hook.test.js` validating passive token extraction on `Stop`, privacy preservation, and fail-open behavior on missing/corrupted transcripts.
- PR #22 Disposition: **DO NOT MERGE YET.** Awaiting next genuine live Astra sample under the wired hook before final merge signoff.

---

## 4. NATIVE QUOTA & TOKEN MEASUREMENTS (AUTHORITATIVE RECORD)
- Quota Window Timing:
  - Before: `2026-09-06T04:03:46Z`
  - After: `2026-09-06T04:33:06Z`
  - Turn Execution Duration: `642.5` seconds (~10 min 42 s)
- Rate Limit Allowance Burn:
  - 5-Hour Window: `0%` -> `59%` (`59 pt` burn) (Resets at `1788685876`)
  - Weekly Window: `1%` -> `11%` (`10 pt` burn) (Resets at `1789254205`)
  - Authority: Stable (`codex`, shared default)
- Native Model Token Counters (from verified native session rollout):
  - Turn Input Tokens: `3,360,163`
  - Turn Cached Input Tokens: `3,302,016` (Cache Leverage: `98.27%`)
  - Turn Output Tokens: `14,126`
  - Turn Reasoning Output Tokens: `4,411` (Reasoning Fraction: `31.23%`)
  - Turn Total / Processed Volume: `3,374,289` tokens
  - Cumulative Thread Tokens: `3,926,007` input, `3,794,816` cached, `17,111` output, `4,552` reasoning, `3,943,118` total
  - Model Context Window: `258,400` tokens

---

## 5. HERMES COMMERCE CONTROL MAINTENANCE AUDIT DISPOSITION
- Baseline Commit: `ff406704e1231f475fc491fa30665846e99376b1` (v0.1.2)
- Task Classification: `multi_fix_implementation`
- Outcome: `PASS`
- Work Branch: `astra/maintenance-audit-2026-09-05`
- Commit: `eb521dc0821c02006694bfd6fc982aa337c55ede`
- Pull Request: `https://github.com/EchoEe247/hermes-commerce-control/pull/15`
- Confirmed Fixes Implemented:
  1. CLI/MCP option-injection boundary protection (`--json` first, `--flag=val` inlined, `--` delimiter for positional data).
  2. Adapter timeout enforcement with `withAbortBudget` to prevent hung SDKs/adapters from bypassing time budgets.
  3. Safe-fetch pre-aborted signal rejection and terminal cancellation (no retry on abort).
  4. GiveGigs transport streaming size capping (`readBoundedSuccessBody`), `redirect: "error"`, and socket release.
  5. Human recruitment payload cryptographic/structural integrity assertion before intent creation or action execution.
- Maintainer Verification:
  - 570 unit tests passed (+8 new regression tests)
  - 70 contract tests passed (+2 new tests)
  - `npm run test:package`: PASSED
  - `npm run test:install`: PASSED
  - `npm audit`: 0 vulnerabilities
  - Version bump / package release: NONE (strictly preserved 0.1.2)
