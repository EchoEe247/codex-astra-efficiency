# Window 0 Minimal Live Revalidation

## Purpose

This is a **minimal live integration revalidation**, not Window 0 Task 2 and not an Astra benchmark.

It exists only to prove that the non-Astra hardening after Task 1 fixed the two runtime variables that prevented trustworthy live evidence:

1. the CAE hook command is executable and persists real `UserPromptSubmit` / `Stop` observations;
2. a Codex sandboxed write can succeed from an Ubuntu-rootfs workspace instead of the Android-mounted workspace that produced sandbox-helper exit `182`.

Do not use a banked reset for this revalidation.

## Runtime

- authoritative environment: `ubuntu_in_termux / codexu`
- Codex executable: `/root/.local/bin/codex`
- workspace: `/root/work/codex-astra-efficiency`
- model: exact native `gpt-6-astra`
- reasoning: `low`
- Fast: off if explicitly exposed; otherwise record `UNKNOWN`
- fresh session: required
- subagents/delegated workers: forbidden

## Pre-live gates

Before inference:

- synchronize the rootfs workspace to the current hardening branch/commit;
- `npm test` passes;
- `npm run check` passes;
- `command -v cae` resolves and the resolved CAE CLI is executable;
- bare synthetic `cae hook --cae-owned` persists a privacy-safe observation in an isolated temporary state directory;
- exact Astra target remains `gpt-6-astra`;
- hooks are installed/trusted/active;
- current native quota snapshot is captured;
- no other Codex inference runs concurrently because the meter is shared.

A product-level readiness check for hook-command executability should be implemented before this live turn if it can be done safely without expanding scope.

## Single live task

The user sends one prompt only:

> Perform the minimal CAE live revalidation described in `docs/WINDOW0_MINIMAL_LIVE_REVALIDATION.md`. Do not use subagents. Use `apply_patch` to create `.cae-window0-write-probe` containing exactly `CAE_WINDOW0_WRITE_OK`, verify the file content, then remove the file with `apply_patch`. Make no other repository changes. Report only whether both write operations succeeded and stop.

This deliberately small task is allowed because it validates the project integration itself. It must not be used as an efficiency benchmark or generalized usage-rate sample.

## Immediate post-live capture

After the completion report, send no further Codex prompt. Capture:

- native quota after-state;
- CAE events after-state;
- repository status/diff;
- whether `.cae-window0-write-probe` remains;
- whether any sandbox-helper `182` failure occurred.

## Pass criteria

Revalidation passes only if all are true:

- new `UserPromptSubmit` observation persisted;
- new `Stop` observation persisted;
- both observations target exact model `gpt-6-astra`;
- privacy-safe opaque correlation is present without raw prompt/response/cwd/account data;
- temporary probe file was created and removed successfully using Codex sandboxed writes;
- no sandbox-helper exit `182` occurred;
- worktree is clean afterward;
- quota authority remains interpretable;
- no banked reset was consumed.

If a recoverable local setup problem is found before inference, fix it and continue the preflight. Stop only for a condition that would make the live measurement unsafe, contaminated, destructive, or uninterpretable.

If the live turn itself fails one of the pass criteria, preserve the evidence and stop before Task 2.
