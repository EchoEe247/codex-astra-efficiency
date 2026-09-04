# Native Codex Runtime Validation

Status: **execution protocol; requires a real installed, signed-in Codex environment**

Purpose: prove the CAE integration path without changing how a normal user works in Codex. This protocol is compatibility validation, not an Astra efficiency benchmark.

## Non-negotiable rules

- Use the installed Codex executable and the user's normal ChatGPT sign-in.
- Do not scrape browser cookies, copy auth tokens, or alter Codex auth.
- Do not route Codex through a proxy or alternate client.
- Do not inject optimization context during baseline validation.
- Preserve existing `hooks.json` content.
- Treat missing quota/model data as unavailable, not zero.
- Record the exact Codex version for every runtime proof.
- A temporary non-Astra target may be used only to prove hook plumbing before Astra is available. Clear it immediately afterward; it is not efficiency evidence.

## Gate A — local package integrity

From a clean checkout:

```sh
npm test
npm run check
npm link
cae doctor
```

Required:

- tests/checks pass;
- `cae` is on `PATH`;
- `cae doctor` reports the installed Codex version;
- hook configuration is readable or absent, not malformed.

Do not continue to hook mutation if `doctor` reports malformed/unreadable user configuration.

## Gate B — read-only app-server proof

Run:

```sh
cae probe
cae quota
```

Capture the output privately with the validation receipt.

Required observations:

- `cae probe` must not modify Codex configuration;
- model catalog availability is recorded honestly;
- quota availability is recorded honestly;
- if quota is present, 300-minute and 10080-minute windows are classified by duration rather than slot name;
- `planType`, reset timestamps, optional buckets, and reset credits are preserved only when actually reported;
- account identifiers/auth material are not written into CAE normalized output.

If one app-server surface is unavailable but Codex otherwise works, record the feature as unavailable and continue only with independent gates. Do not add private web scraping as fallback.

## Gate C — hook setup safety

First inspect the proposed mutation:

```sh
cae setup --dry-run
```

Then, only if the plan points at the intended Codex home:

```sh
cae setup
cae doctor
cae setup
```

The second real setup call is an idempotence check.

Required:

- only CAE-owned `UserPromptSubmit` and `Stop` command handlers are added;
- pre-existing handlers and unrelated top-level fields remain unchanged;
- setup does not touch Codex auth, model config, permissions, MCP config, AGENTS.md, or repositories;
- the second call reports no new change/duplication.

## Gate D — pre-Astra hook plumbing proof

This gate can run before Astra is available. It proves plumbing only.

1. Use normal Codex/model picker to identify one currently available test model's **exact native model id** from the read-only catalog/runtime evidence.
2. Temporarily configure only that exact id:

```sh
cae target set <exact-test-model-id>
cae target show
```

3. Start Codex normally. Do not launch it through CAE.
4. Select the exact target model through the normal picker.
5. Submit one harmless compatibility-test prompt and allow the turn to finish.
6. Exit or leave Codex normally, then inspect:

```sh
cae events
```

Expected targeted evidence:

- one `UserPromptSubmit` observation and one corresponding `Stop` observation when the installed Codex version emits both;
- both report the exact selected model;
- both share the same opaque `sessionKey` and `turnKey`;
- raw prompt, response, cwd, transcript path, session id, and turn id are absent.

Then select a **different non-target model** in normal Codex and submit one harmless prompt. The CAE event count must not increase for that turn.

Immediately clear the temporary target:

```sh
cae target clear
```

Pre-Astra plumbing events must not be included in the later Astra real-work efficiency dataset.

## Gate E — coexistence proof

With normal Codex active in one terminal/app, run from another shell:

```sh
cae quota
cae probe
```

Required:

- the active Codex session remains healthy;
- no auth/logout/model change occurs;
- quota/model reads either succeed or fail cleanly without damaging the active session;
- repeated read-only probes do not create model turns or CAE hook observations by themselves.

This gate determines whether short-lived app-server reads are safe enough for receipt snapshots.

## Gate F — uninstall ownership proof

Before uninstall, make or preserve a known user-owned hook entry if one already exists. Then:

```sh
cae uninstall --dry-run
cae uninstall
cae doctor
```

Required:

- CAE-owned handlers are removed;
- user-owned handlers and unrelated configuration remain;
- a second uninstall is a no-op;
- Codex starts and works normally afterward.

## Gate G — Astra launch proof

Run only when Astra is genuinely available to the Plus account in the native Codex picker.

1. `cae probe` and record native Astra candidate(s).
2. Select Astra through the normal Codex picker.
3. Prove the exact `model` value emitted by native hook input matches the intended catalog entry.
4. Configure only the validated exact Astra id(s) with `cae target set ...` until public setup can ship the validated built-in mapping.
5. Re-run targeted/non-targeted hook proof.
6. Re-run quota coexistence proof.
7. Record exact Codex version and visible Plus limit shape.

Only after Gate G passes may Astra observations be treated as real CAE baseline data.

## Gate H — observe-only real-work baseline

Follow `docs/ASTRA_PLUS_TEST_PLAN.md`.

Do not add efficiency instructions yet. Use Astra exactly as a normal Plus user would use it for needed work. Record before/after 5-hour and weekly snapshots when available, wall time, outcome, and human intervention count. Preserve failures.

## Evidence handling

A runtime receipt should contain:

- date/time;
- OS/platform;
- Node version;
- exact Codex version;
- CAE commit;
- gate executed;
- PASS/FAIL/PARTIAL result;
- sanitized command output needed to support the result;
- any observed compatibility deviation.

Do not commit account ids, auth tokens, prompt/response bodies, private repo paths, or raw transcript paths.

## Stop conditions

Stop and reassess instead of working around the native product if any of these occur:

- hook setup damages or overrides user configuration;
- non-target models trigger CAE behavior;
- CAE must replace the Codex model picker or normal client to function;
- app-server reads require auth extraction/private browser scraping;
- quota state cannot be represented without inventing missing values;
- native Astra model identity cannot be established unambiguously.
