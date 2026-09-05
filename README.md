# Codex Astra Efficiency

**Use Astra normally in Codex. Waste less of your Plus allowance.**

Codex Astra Efficiency (CAE) is a lightweight, Astra-specific efficiency layer for ChatGPT Plus users working in Codex.

## Current private status

Window 0 is complete. A Window 1 candidate was frozen, then a supplemental
post-freeze/pre-reset Astra audit confirmed a release-critical readiness defect:
`cae readiness` can report live-hook readiness without requiring the native CAE
hooks to be installed. The original Window 1 candidate is therefore suspended
pending a zero-inference fix, regression coverage, cross-platform CI, and
candidate refreeze. No banked reset has been used; two reset credits remain.

Exact live authority already established on the test Plus account:

- model: `gpt-6-astra`
- native default reasoning: `low`
- quota authority: `shared_default` / `default` / `limitId=codex`
- authoritative live runtime: Ubuntu-under-Termux (`codexu`)
- native Termux Codex: separate compatibility lane, not currently claimed

No Astra efficiency improvement is claimed yet.

## Product constraint

> **Codex should still feel like Codex.**

Users should keep the normal Codex experience: open Codex, select Astra from
the normal model picker, give it real work, and let the agent operate normally.
CAE exists to make that Astra usage more observable and, where validated, more
efficient without turning Codex into a new agent framework.

## Scope

- ChatGPT Plus first.
- Codex first.
- Astra only.
- Native `/model` selection remains the user model-selection mechanism.
- Non-Astra models are not routed, tuned, or replaced by CAE.
- 5-hour and weekly usage windows remain separate.
- Missing/ambiguous quota state is unknown, never guessed.
- Local-first privacy: no raw prompt/source/transcript/account identity telemetry.

## Implemented private foundation

- exact Astra targeting with non-Astra no-op behavior;
- native `UserPromptSubmit` / `Stop` hooks;
- opaque session/turn correlation;
- idempotent setup and CAE-owned-only uninstall;
- native Codex model/quota discovery;
- reset/authority-aware allowance deltas;
- hook-command launchability checks;
- local run receipts;
- Ubuntu/Windows/macOS CI;
- real codexu live validation.

## Development CLI

```text
cae doctor
cae probe
cae readiness
cae quota
cae setup --dry-run
cae setup
cae uninstall --dry-run
cae uninstall
cae target show
cae target set <exact-model-id>
cae target clear
cae events
```

These remain development/validation commands, not yet the final public install contract.

## Campaign sequence

1. Window 0 — complete.
2. Pre-Window-1 hardening — reopened after post-freeze audit finding.
3. Freeze replacement Window 1 candidate after the readiness fix is green.
4. Use exactly one banked reset for Window 1 control; second reset remains untouched.
5. Harden without Astra.
6. Wait for the next normal 5-hour availability for Window 2 release-candidate validation.
7. Publish v0.1 only after release criteria pass.

Repository remains private during the evidence campaign.
