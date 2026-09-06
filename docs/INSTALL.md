# Install and first use

Codex Astra Efficiency (CAE) sits beside the normal Codex CLI. You still launch Codex normally and select Astra through Codex's native `/model` picker.

## v0.1.0 support surface

- ChatGPT Plus + Codex
- Node.js 20 or newer
- Linux, Windows, and macOS for the automated CLI/test surface
- `codexu` (Ubuntu-under-Termux) as the validated Android live-Astra runtime
- native Termux Codex is **unsupported under the currently validated upstream Android distribution**

CAE does not replace Codex authentication and does not collect OpenAI credentials.

## Install

Install the global CLI from npm:

```bash
npm install -g codex-astra-efficiency
```

Or install the downloaded `v0.1.0` GitHub Release artifact:

```bash
npm install -g ./codex-astra-efficiency-0.1.0.tgz
```

Verify the CLI:

```bash
cae doctor
```

If your working Codex command is a wrapper or lives at a nonstandard path, point CAE at that same executable:

```bash
CAE_CODEX_COMMAND=/path/to/codex cae doctor
```

On Windows, set the equivalent environment variable in your shell and use the normal `codex.cmd` installation unless your setup requires a different launcher.

The override is an executable path/name, not a shell pipeline or arbitrary shell script expression.

## Configure the Astra target once

`v0.1.0` targets the exact native Astra model id observed in Codex:

```bash
cae target set gpt-6-astra
```

Confirm it:

```bash
cae target show
```

CAE uses exact matching. Other Codex models are not routed, replaced, or managed by CAE.

## Install the Codex hooks

Preview the change:

```bash
cae setup --dry-run
```

Then install the CAE-owned hooks:

```bash
cae setup
```

CAE adds only its `UserPromptSubmit` and `Stop` handlers. Existing unrelated hook groups and handlers are preserved.

If Codex asks you to review hooks, review the CAE handlers through the normal Codex trust flow and enable them if you want CAE active. CAE does not bypass that UX.

## Check readiness before spending Astra allowance

Run:

```bash
cae readiness
```

A healthy live-capture setup reports:

```text
ready_for_live_hook_capture
```

Readiness requires the native Astra target, usable quota/model reads, a callable CAE hook command, and installed CAE hooks. If CAE cannot prove a prerequisite, it reports a non-ready state instead of guessing.

Inspect the native Plus windows separately with:

```bash
cae quota
```

Missing or ambiguous quota data is reported as unavailable/unknown rather than zero or unlimited.

## Use Codex normally

Launch Codex the same way you normally do and select Astra through native `/model`:

```text
/model
```

Choose **GPT-6-Astra** and work normally.

There is no CAE prompt format, custom agent UI, proxy, or task DSL. That is intentional: the product is supposed to observe the normal Codex workflow rather than replace it.

Inspect privacy-safe local observations with:

```bash
cae events
```

CAE observations do not persist raw prompts, model responses, source code, raw cwd paths, account identity, or raw native session/turn ids.

## Remove CAE

Preview hook removal:

```bash
cae uninstall --dry-run
```

Remove CAE-owned hooks:

```bash
cae uninstall
```

Uninstall does not intentionally remove unrelated Codex hook groups or handlers. If a mixed hook group contains CAE and user handlers, only the CAE handler is removed.

Then remove the global package if wanted:

```bash
npm uninstall -g codex-astra-efficiency
```

The hook cleanup and package uninstall are separate on purpose. Run `cae uninstall` while the CLI still exists so CAE can clean up its own configuration safely.

## Local state and privacy

CAE stores local state under the platform state directory. On a typical Unix-like system:

```text
~/.local/state/codex-astra-efficiency
```

`XDG_STATE_HOME`, `LOCALAPPDATA` on Windows, and `CAE_STATE_DIR` can change the location.

The default design is local-only. When filing an issue, do not attach raw Codex transcripts, source repositories, credentials, or account data.

## Troubleshooting

### `cae` is not found

Confirm the global npm bin directory is on `PATH` and reinstall the package if needed.

### `cae readiness` says the hook command is unavailable

Run:

```bash
cae doctor
```

Confirm that the installed `cae` command is callable in the same environment where Codex runs.

### `native_hooks_not_installed`

Run:

```bash
cae setup
```

Then complete Codex's normal hook review if it appears.

### Native Codex reads fail

If your normal working Codex executable is nonstandard, point CAE at that exact executable:

```bash
CAE_CODEX_COMMAND=/path/to/codex cae readiness
```

Do not use a shell pipeline or arbitrary shell command as the launcher override.

### Native Termux

Native Termux Codex is not supported by CAE under the currently validated upstream Android distribution. Local Codex diagnostics may work, but external authoritative quota/readiness reads fail in the validated native environment. CAE should report degraded/unavailable state and block Astra readiness rather than guess.

Use the validated `codexu` / Ubuntu-under-Termux path for Android CAE work. A PRoot wrapper counts as that compatibility path, not as native-Termux support.

See `docs/CODEX_COMPATIBILITY.md` for the evidence and reopen condition.

## What v0.1.0 does not claim

- CAE does not increase or bypass OpenAI usage limits.
- CAE does not promise a fixed percentage of Astra savings.
- CAE does not silently substitute another model for Astra.
- CAE does not claim a default efficiency intervention that has not passed real-work validation.

The first release prioritizes trustworthy observation, safe integration, and the normal Codex workflow.
