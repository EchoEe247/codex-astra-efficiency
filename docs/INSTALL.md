# Install and first use

Codex Astra Efficiency (CAE) is designed to sit beside the normal Codex CLI. You still launch Codex normally and select Astra through Codex's native `/model` picker.

## Supported v0.1 surface

- ChatGPT Plus + Codex
- Node.js 20 or newer
- Linux, Windows, and macOS for the automated CLI/test surface
- `codexu` (Ubuntu-under-Termux) is the validated Android live-Astra runtime
- native Termux Codex is **not** part of the declared v0.1 support surface unless that separate compatibility lane passes before release

CAE does not replace Codex authentication and does not collect OpenAI credentials.

## Install

Install the global CLI from npm:

```bash
npm install -g codex-astra-efficiency
```

Alternatively, install from a downloaded GitHub Release package artifact:

```bash
npm install -g ./codex-astra-efficiency-0.1.0.tgz
```

Verify that the CLI is available:

```bash
cae doctor
```

If your working Codex command is a wrapper or lives at a nonstandard path, use the same executable with CAE:

```bash
CAE_CODEX_COMMAND=/path/to/codex cae doctor
```

On Windows, set the equivalent environment variable in your shell and use the normal `codex.cmd` installation unless your setup requires a different launcher.

## One-time Astra target configuration

v0.1 targets the exact native Astra model id observed in Codex:

```bash
cae target set gpt-6-astra
```

Confirm it:

```bash
cae target show
```

CAE uses exact matching. Other Codex models are not routed, replaced, or managed by CAE.

## Install the Codex hooks

Preview the change first if you want:

```bash
cae setup --dry-run
```

Install the CAE-owned hooks:

```bash
cae setup
```

CAE adds only its `UserPromptSubmit` and `Stop` handlers. Existing unrelated hook groups and handlers are preserved.

The next time Codex asks you to review hooks, review the CAE handlers normally and trust/enable them if you want CAE active. CAE does not bypass Codex's native hook-review UX.

## Check readiness before using Astra

Run:

```bash
cae readiness
```

A healthy live-capture setup reports:

```text
ready_for_live_hook_capture
```

Readiness requires the native Astra target, usable quota/model reads, a callable CAE hook command, and installed CAE hooks. If CAE cannot prove a prerequisite, it reports a non-ready state instead of guessing.

You can inspect the current native Plus windows separately:

```bash
cae quota
```

Missing or ambiguous quota data is reported as unavailable/unknown rather than zero or unlimited.

## Use Codex normally

Launch Codex the way you normally do, then select Astra through native `/model`:

```text
/model
```

Choose **GPT-6-Astra** and work normally. CAE does not require a custom prompt format, custom agent UI, proxy, or task DSL.

You can inspect privacy-safe local observations with:

```bash
cae events
```

CAE observations do not persist raw prompts, model responses, source code, raw cwd paths, account identity, or raw native session/turn ids.

## Uninstall CAE hooks

Preview:

```bash
cae uninstall --dry-run
```

Remove only the CAE-owned hooks:

```bash
cae uninstall
```

Uninstall does not intentionally remove unrelated Codex hook groups or handlers. If a mixed hook group contains both CAE and user handlers, only the CAE handler is removed.

To remove the global package afterward:

```bash
npm uninstall -g codex-astra-efficiency
```

The package uninstall and hook uninstall are separate on purpose: run `cae uninstall` before removing the CLI so CAE can clean up its own hook entries.

## Local state and privacy

CAE stores local state under the platform state directory. On typical Unix-like systems this is:

```text
~/.local/state/codex-astra-efficiency
```

`XDG_STATE_HOME`, `LOCALAPPDATA` on Windows, and `CAE_STATE_DIR` can change the location.

The default design is local-only. Do not attach raw Codex transcripts, source repositories, credentials, or account data when filing issues.

## Troubleshooting

### `cae` is not found

Confirm the global npm bin directory is on `PATH` and reinstall the package artifact if necessary.

### `cae readiness` says the hook command is unavailable

Run:

```bash
cae doctor
```

Check that the installed `cae` command is executable/callable in the same environment where Codex runs.

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

The first release does not claim native Termux Codex support unless the separate compatibility lane is explicitly completed before release. The validated Android live runtime is Ubuntu-under-Termux (`codexu`).

## What v0.1 does not claim

- CAE does not increase or bypass OpenAI usage limits.
- CAE does not promise a fixed percentage of Astra savings.
- CAE does not silently substitute another model for Astra.
- CAE does not yet claim a validated default efficiency intervention unless the final release evidence establishes one.

The first release prioritizes trustworthy observation, safe integration, and a normal Codex workflow.
