# Native Codex Runtime Validation

Status: **A-F passed once on a real signed-in Plus installation; protocol retained for compatibility reruns and Astra Gate G**

Purpose: prove the CAE integration path without changing how a normal user works in Codex. This protocol is compatibility validation, not an Astra efficiency benchmark.

Authoritative first A-F receipt: `receipts/native-runtime-validation-final-2026-09-04.md`.

## Non-negotiable rules

- Use the installed Codex executable/launcher the user normally relies on and the user's normal ChatGPT sign-in.
- Do not scrape browser cookies, copy auth tokens, or alter Codex auth.
- Do not route Codex through a proxy or alternate model client.
- Do not inject optimization context during baseline validation.
- Preserve existing `hooks.json` content.
- Treat missing quota/model data as unavailable, not zero.
- Record the exact Codex version for every runtime proof.
- A temporary non-Astra target may be used only to prove hook plumbing before Astra is available. Clear it immediately afterward; it is not efficiency evidence.
- Do not bypass Codex's native hook trust/review flow.

## Runtime findings already established

The first real validation used Android/Termux + Codex 0.149.0 and found:

- native `UserPromptSubmit` and `Stop` hooks work after Codex trusts the hook configuration;
- before trust is granted, turns can complete without CAE hook observations, so pre-trust silence is not evidence that the client surface lacks hooks;
- Codex displayed `Hooks need review / Trust all`; trust was accepted through the normal Codex UI and CAE does not bypass it;
- `codex exec` did emit the expected hooks after trust in that environment;
- the interactive TUI transport itself stalled in that Termux/proot environment, while `exec` worked, so client-surface health should be recorded separately from CAE hook health;
- direct spawning of a standalone musl Codex binary lacked working DNS while the user's normal `/usr/bin/codex` wrapper worked with the same auth/home because it supplied resolver state;
- CAE therefore supports `CAE_CODEX_COMMAND=/path/to/codex-or-wrapper` so read-only app-server operations and version checks can use the same working launcher.

These findings are compatibility evidence, not universal assumptions for every platform/Codex version.

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

Normally run:

```sh
cae probe
cae quota
```

If the user's working Codex installation is reached through an executable wrapper/path rather than the default `codex` / `codex.cmd`, use the exact launcher without shell expansion:

```sh
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae doctor
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae probe
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae quota
```

Capture output privately with the validation receipt.

Required observations:

- the same resolved launcher is used for version reporting and short-lived app-server reads;
- `cae probe` must not modify Codex configuration;
- model catalog availability is recorded honestly;
- quota availability is recorded honestly;
- if quota is present, 300-minute and 10080-minute windows are classified by duration rather than slot name;
- `planType`, reset timestamps, optional buckets, and reset credits are preserved only when actually reported;
- if Codex reports a purchased-credit snapshot, CAE preserves `hasCredits`, `unlimited`, and the backend balance string without inventing a unit or dollar conversion;
- missing purchased-credit state is `not_reported`, not zero;
- account identifiers/auth material are not written into CAE normalized output.

If one app-server surface is unavailable but Codex otherwise works, record the feature as unavailable and continue only with independent gates. Do not add private web scraping as fallback.

If the default binary invocation fails but the user's normal executable wrapper works, record that as launcher/environment compatibility rather than changing auth or introducing a network proxy.

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

After setup, if Codex presents a native hook-review/trust prompt, approve or reject it through the normal Codex UI according to the validation environment. Do not modify trust hashes manually to bypass that interaction.

## Gate D — pre-Astra hook plumbing proof

This gate can run before Astra is available. It proves plumbing only.

1. Use native Codex catalog/runtime evidence to identify one currently available test model's **exact native model id**.
2. Temporarily configure only that exact id:

```sh
cae target set <exact-test-model-id>
cae target show
```

3. Start Codex normally through the user's working launcher/client path. Do not launch Codex through a CAE replacement client.
4. Select/use the exact target model through normal Codex controls.
5. Submit one harmless compatibility-test turn and allow it to finish.
6. Inspect:

```sh
cae events
```

Expected targeted evidence:

- one `UserPromptSubmit` observation and one corresponding `Stop` observation when the installed Codex version emits both;
- both report the exact selected model;
- both share the same opaque `sessionKey` and `turnKey`;
- raw prompt, response, cwd, transcript path, session id, and turn id are absent.

If no event appears, first determine whether Codex has actually trusted the configured hooks before concluding the client surface lacks lifecycle support.

Then use a **different non-target model** through normal Codex controls and submit one harmless completed turn. The CAE persisted event count must not increase for that turn.

Immediately clear the temporary target:

```sh
cae target clear
```

Pre-Astra plumbing events must not be included in the later Astra real-work efficiency dataset.

## Gate E — coexistence proof

With normal Codex active in one terminal/app, run from another shell using the same launcher selection as Gate B:

```sh
cae quota
cae probe
```

or, when required:

```sh
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae quota
CAE_CODEX_COMMAND=/path/to/codex-or-wrapper cae probe
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
cae uninstall
```

Required:

- CAE-owned handlers are removed;
- user-owned handlers and unrelated configuration remain;
- a second uninstall is a no-op;
- Codex starts and works normally afterward;
- native hook trust/config entries that CAE does not own are not removed.

## Gate G — Astra launch proof

Run only when Astra is genuinely available to the Plus account in native Codex.

1. `cae probe` and record native Astra candidate(s).
2. Select Astra through the normal Codex model picker/controls.
3. Prove the exact `model` value emitted by native hook input matches the intended catalog entry.
4. Configure only the validated exact Astra id(s) with `cae target set ...` until public setup can ship the validated built-in mapping.
5. Re-run targeted/non-targeted hook proof.
6. Re-run quota coexistence proof.
7. Record exact Codex version and visible Plus limit shape.
8. Determine whether Astra uses:
   - an exact model-specific `rateLimitsByLimitId` bucket;
   - the shared/default Codex meter;
   - another native shape not yet represented by fixtures.
9. If only a shared/default meter is exposed, avoid concurrent Codex usage during controlled baseline measurements.

Only after Gate G passes may Astra observations be treated as real CAE baseline data.

## Gate H — observe-only real-work baseline

Follow `docs/ASTRA_PLUS_TEST_PLAN.md` and `docs/MEASUREMENT_MODEL.md`.

Do not add efficiency instructions yet. Use Astra exactly as a normal Plus user would use it for needed work.

At minimum, preserve before/after 5-hour and weekly snapshots when available, wall time, and outcome. Where the native surface or deliberate test campaign can record them without collecting project content, also preserve:

- reasoning effort and Standard/Fast service tier;
- task class and project-scale bucket;
- fresh task vs continuation state;
- context bucket if safely exposed;
- subagent count;
- coarse tool classes;
- objective completion;
- validation status;
- human intervention count;
- material scope expansion;
- later rework;
- purchased-credit state when natively reported.

Preserve failures. Do not infer missing evidence and do not generate an efficiency score during the observe-only campaign.

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
- non-target models trigger CAE persistence/behavior;
- CAE must replace the Codex model picker or normal client to function;
- app-server reads require auth extraction/private browser scraping;
- quota state cannot be represented without inventing missing values;
- native Astra model identity cannot be established unambiguously.
