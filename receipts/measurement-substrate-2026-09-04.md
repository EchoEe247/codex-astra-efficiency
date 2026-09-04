# Measurement Substrate Receipt — 2026-09-04

Status: **PASS — pre-Astra measurement foundation advanced**

## Scope

This receipt covers the measurement changes made after early GPT-6 Astra Pro usage reports showed that quota burn depends strongly on task shape, project breadth, reasoning mode, tool use, and outcome quality.

The work intentionally does **not** add Astra optimization behavior yet.

## Changes completed

### Evidence model

Added `docs/MEASUREMENT_MODEL.md` with the required evidence hierarchy:

1. observed facts;
2. deterministic measurements;
3. signals;
4. hypotheses;
5. validated interventions.

Sparse metadata is explicitly insufficient for a public efficiency claim.

### Privacy-safe workload descriptors

Added `src/measurement.js` covering coarse descriptors and completion evidence without accepting prompts, code, repository names, file paths, transcripts, or account identifiers.

Tracked fields include:

- plan;
- reasoning effort;
- service tier;
- task class;
- project scale;
- fresh/continuation state;
- context bucket;
- objective completion;
- validation status;
- interventions;
- subagents;
- coarse tool classes;
- scope expansion;
- rework;
- work disposition.

Unknown or invalid values remain unknown rather than being guessed.

### Receipt schema v2

`src/receipts.js` now persists the expanded workload/outcome evidence alongside start/end quota snapshots and reset-aware usage deltas.

The native quota-reported plan takes precedence over a conflicting caller-provided plan label.

Raw account identifiers remain excluded by the normalized persistence path.

### Native purchased-credit state

Current upstream Codex `GetAccountRateLimitsResponse` exposes a per-limit credit snapshot with:

- `hasCredits`;
- `unlimited`;
- `balance` as an optional backend string.

CAE now preserves this state in normalized quota snapshots.

Rules:

- missing credit data => `not_reported`;
- invalid flags/balance => `malformed`;
- balance remains an opaque backend string;
- CAE does not invent a unit or dollar conversion.

### Plus baseline methodology

`docs/ASTRA_PLUS_TEST_PLAN.md` now incorporates the early Pro observations without converting Pro percentage burn into Plus percentages.

The baseline remains observe-only and is designed around genuine real work, including:

- hard blockers;
- bounded substantial implementation;
- broad codebase analysis when genuinely needed;
- cross-system/cross-service debugging or refactor work;
- browser/computer-use engineering;
- bounded greenfield MVP work.

## Validation

GitHub Actions run #65 completed successfully on the current measurement/receipt/credit code path across:

- Ubuntu / Node 20;
- Ubuntu / Node 22;
- Windows / Node 22.

The test suite now covers:

- complete 5-hour + weekly snapshots;
- missing 5-hour window;
- missing weekly window;
- partial/durationless windows;
- malformed windows;
- contradictory observations;
- reset-aware deltas;
- reported purchased-credit balance;
- missing purchased-credit state;
- malformed purchased-credit state;
- privacy-safe workload descriptors;
- unknown evidence preservation;
- receipt schema v2;
- native quota plan precedence;
- raw account-id exclusion;
- local JSONL persistence.

## Remaining gate

This receipt does not prove native runtime behavior on the user's installed signed-in Codex environment.

Still required:

1. execute `docs/NATIVE_RUNTIME_VALIDATION.md` Gates A-F locally;
2. prove hook execution and strict non-Astra no-op behavior;
3. prove signed-in Plus app-server quota reads and side-by-side coexistence with normal Codex;
4. when Astra reaches Plus, prove exact picker/hook model identity;
5. bind receipt start/end capture to native Astra turn boundaries;
6. run the observe-only real-work Plus baseline before enabling efficiency interventions.

## Product boundary preserved

No other Codex model is routed, tuned, or modified.

No custom agent workflow was introduced.

No automatic efficiency score was introduced.

No quota-circumvention behavior was introduced.

**Codex should still feel like Codex.**
