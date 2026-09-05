# Window 0 Task 1 — Non-Astra Hardening Receipt

Date: 2026-09-04

## Status

**READY_FOR_MINIMAL_LIVE_REVALIDATION**

No Astra or other Codex model inference was used during this hardening run. No banked reset was consumed.

## Branch

- branch: `fix/window0-task1-findings`
- hardening commit: `2b130a1d21fa2b1e40efed49cd47627a3f86065c`

## Baseline

- `npm test`: **57/57 PASS**
- `npm run check`: **PASS**

## Hook root cause

Before remediation:

- `command -v cae`: `/data/data/com.termux/files/usr/bin/cae`
- the global `cae` symlink existed, but its target `bin/cae.js` was mode `600` and was not executable from the Ubuntu/codexu hook runtime;
- absolute-source synthetic hook invocation passed;
- bare `cae hook --cae-owned` synthetic invocation failed with permission denied.

Remediation:

- `npm link` was re-run so the global package points at the working checkout;
- executable mode was corrected to `755` on the working/global `bin/cae.js` path;
- bare synthetic hook invocation then passed in both Termux and codexu/Ubuntu.

Best-supported classification: **PRIVATE VALIDATION INSTALL/PATH GAP**. CAE setup could report hooks installed without proving that the configured hook command was actually executable in the hook runtime. This is not an Astra model failure.

The real Task 1 still has no persisted `UserPromptSubmit` or `Stop` observations because that turn occurred before this remediation. One minimal live turn is required to prove the repaired path.

## Quota-authority correctness fix

Astra Task 1 identified that `calculateModelUsageDelta()` could treat an authority as stable when `kind` and `key` matched but `limitId` changed.

Hardening changed the stability condition so a `limitId` change returns `authority_changed` and both window deltas remain unavailable.

Regression coverage was added for same kind/key with a rotated `limitId`.

Post-fix validation:

- `npm test`: **58/58 PASS**
- `npm run check`: **PASS**
- `git diff --check`: **PASS**

## Sandbox-helper exit 182

Task 1 ran from the Android/Termux-hosted workspace path:

`/data/data/com.termux/files/home/codex-astra-efficiency`

The live Astra session could read files and execute tests there, but both patch-write attempts failed with sandbox-helper exit status `182`.

Evidence supports the Android-mounted workspace path as a contributor, but does not prove it is the sole cause.

A disposable future live-validation clone was prepared inside the Ubuntu rootfs at:

`/root/work/codex-astra-efficiency`

The rootfs clone passed its pre-fix baseline tests (`57/57`). It still needs to be synchronized to the hardening branch before the minimal live revalidation.

## Product gap still to harden

Before Window 1, CAE should detect when the configured hook executable cannot actually be launched. A minimal product-level solution should make `doctor` and/or `readiness` expose this condition rather than reporting live-hook readiness solely from `hooks.json` presence.

Do not redesign the native Codex hook mechanism. Preserve the native trust flow and normal `/model` workflow.

## Next boundary

Before Task 2:

1. sync `/root/work/codex-astra-efficiency` to the hardening branch;
2. validate the repaired bare `cae` command and hooks from the rootfs workspace;
3. implement/validate a minimal hook-command executability readiness check;
4. run the full test/check matrix;
5. perform one **minimal** real Astra Low live revalidation turn to prove:
   - `UserPromptSubmit` persists;
   - `Stop` persists;
   - exact model is `gpt-6-astra`;
   - privacy-safe opaque correlation persists;
   - sandboxed file writes in the rootfs workspace no longer fail with exit `182`.

This revalidation is not Window 0 Task 2 and must not consume a banked reset.
