# Window 0 Zero-Inference Preflight — codexu

Date: 2026-09-04

## Result

**PASS — READY FOR LIVE ASTRA HOOK CAPTURE AFTER ONE NON-INFERENCE TARGET-CONFIG STEP**

No Astra prompt was sent and no banked reset was consumed during this preflight.

## Authoritative runtime

- Runtime: `ubuntu_in_termux / codexu`
- Android host: Pixel 6a, Android 17, aarch64
- Ubuntu: 24.04.4 LTS (Noble), PRoot-Distro
- Node: `v24.18.0`
- npm: `11.19.1`
- Codex: `codex-cli 0.153.2`
- Working Codex launcher: `/root/.local/bin/codex`
- Repository commit tested: `41c8a2af2f7478b4c5091eff38edbc6f331aaedb`

`codexu` is an alias that enters the Ubuntu PRoot environment and directly executes `/root/.local/bin/codex`. This runtime is distinct from native Termux Codex and is the authoritative local Astra Window 0 execution surface.

## Runtime mapping

- `codexu` -> Ubuntu PRoot -> `/root/.local/bin/codex`
- Ubuntu working Codex -> `/root/.local/bin/codex`
- Ubuntu working Codex binary -> standalone `0.153.2-aarch64-unknown-linux-musl`
- native Termux Codex -> separate `~/.local/bin/codex`, observed version `0.153.4`; not modified or validated in this receipt
- Ubuntu rootfs `/usr/bin/codex` -> absent
- Termux `/data/data/com.termux/files/usr/bin/codex` -> native-Termux shim; not the Ubuntu launcher

The inherited PATH inside Ubuntu can expose the Termux wrapper for bare `codex`, so Window 0 must use the absolute `/root/.local/bin/codex` launcher.

## Source validation

- `npm test`: **PASS — 57/57**
- `npm run check`: **PASS**

## CAE zero-inference integration

Using:

```text
CAE_CODEX_COMMAND=/root/.local/bin/codex
```

Results:

- `cae doctor`: **PASS**
- `cae probe`: **PASS**
- `cae readiness`: `target_configuration_required`
- `cae quota`: **PASS**
- config readable: yes
- hooks readable: yes
- hooks installed before preflight: no
- Astra target configured before preflight: no

## Native Astra discovery

The Codex app-server model catalog was complete:

- catalog count: 6
- next cursor: absent
- discovery: `single_candidate`
- exact model id: `gpt-6-astra`
- display name: `GPT-6-Astra`
- native default reasoning effort: `low`
- supported reasoning efforts: `low`, `medium`, `high`, `xhigh`, `max`, `ultra`

The model id came directly from the native model catalog and was not inferred from a marketing name.

Recommended exact non-inference configuration command:

```text
CAE_CODEX_COMMAND=/root/.local/bin/codex node ./bin/cae.js target set gpt-6-astra
```

This command was **not executed** during the zero-inference preflight.

## Plus quota authority

Observed authority:

- kind: `shared_default`
- key: `default`
- limit id: `codex`
- `normalModelSlug`: `null`
- plan type: Plus
- 5-hour remaining at capture: 96% (`usedPercent=4`)
- weekly remaining at capture: 18% (`usedPercent=82`)
- reset credits available: 2
- shared meter: **yes**

Because the authority is shared-default, concurrent Codex work on the same account would contaminate Window 0 allowance deltas and should be avoided during the controlled live task.

## Launcher acceptance

Issue #6 launcher-equivalence acceptance for the authoritative `codexu` runtime: **PASS**.

`doctor`, `probe`, `readiness`, and `quota` all passed through the actual working Ubuntu launcher `/root/.local/bin/codex` without the prior resolver workaround.

This does **not** claim native Termux Codex health. The earlier `/usr/bin/codex` acceptance assumption was not correct for `codexu`: Ubuntu `/usr/bin/codex` is absent, while the Termux-side `/data/data/com.termux/files/usr/bin/codex` is a different shim. Native Termux is tracked independently in Issue #9.

## Privacy

**PASS.** No raw prompt, source code, transcript, browser cookie, account identity, or auth material was required or persisted by this preflight.

## Zero-inference confirmation

No Astra inference occurred. Actions were limited to source tests/checks, version/runtime inspection, Codex app-server `model/list` and rate-limit reads, and CAE read-only readiness checks.

## Next gate

1. Configure the exact native target `gpt-6-astra` using the command above.
2. Re-run `cae readiness` and require `ready_for_live_hook_capture`.
3. Review `cae setup --dry-run`, then install CAE hooks.
4. Keep other Codex usage idle while the authority remains shared-default.
5. Begin the bounded Window 0 live task using the native Astra reasoning default first unless the task itself demonstrates a need to escalate.
