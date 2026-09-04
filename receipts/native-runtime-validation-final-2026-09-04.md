# Native Codex Runtime Validation — Final Receipt — 2026-09-04

Status: **PASS — Gates A-F completed on a real signed-in ChatGPT Plus Codex environment**

## Environment

- OS: Linux localhost 6.1.157-android14 aarch64 / Termux
- Node: v24.18.0
- npm: 11.19.1
- Codex: codex-cli 0.149.0, standalone musl build
- CAE commit validated: `0497f5ae896ec9429bc9a52472ef20ab2de3ba98`
- `CODEX_HOME`: default `~/.codex`; environment override unset
- Authentication: signed in with ChatGPT; auth state remained unchanged throughout validation

Codex 0.153.3 was offered during validation but was not installed. The validated runtime remains 0.149.0.

## Gate A — PASS

- `npm test`: 48/48 PASS
- `npm run check`: PASS
- `npm link`: PASS
- `cae doctor`: Codex version detected; hooks configuration readable

Transient npm-link mode-bit change was reverted; repository tree was clean at end of the validation run.

## Gate B — PASS with Termux launcher caveat

Direct CAE-spawned app-server failed DNS in this environment because the standalone musl Codex binary had no usable `/etc/resolv.conf`.

The user's normal `/usr/bin/codex` launcher/wrapper worked with the same underlying binary, Codex home, and ChatGPT authentication because its proot environment supplied working resolver state.

Through that working launcher path, native Codex app-server reads returned:

- plan: `plus`
- 5-hour window: 300 minutes, 0% used
- weekly window: 10,080 minutes, 82% used
- one shared `codex` quota bucket
- `normalModelSlug`: null
- no model-specific buckets observed
- `limitName`: null
- credits: `hasCredits=false`, `unlimited=false`, balance `"0"`
- reset credits available: 1
- `ordinaryUsageAllowed`: null
- model catalog: 6 models on the first read
- Astra discovery: `not_found`

Read-only probing did not modify user configuration. Authentication/configuration checksums remained unchanged.

Interpretation: the native app-server protocol path is valid on the signed-in Plus account. CAE needs launcher-equivalence support on environments where the user's working Codex wrapper provides required runtime setup.

## Gate C — PASS

- `cae setup --dry-run` pointed at the intended Codex home without writing.
- `cae setup` added only CAE-owned `UserPromptSubmit` and `Stop` handlers.
- Synthetic user-owned hook entries and unrelated top-level data were preserved during the ownership test.
- A second setup was idempotent (`changed=false`).

## Gate D — PASS

### Live targeted turn

- Exact target model: `gpt-5.6-sol`
- Client path: normal installed Codex client
- Turn completed successfully with the expected harmless validation reply.
- Live hook events fired: `UserPromptSubmit` and `Stop`.
- Both events reported exact model `gpt-5.6-sol`.
- `sessionKey` matched across the two events.
- `turnKey` matched across the two events.
- No raw prompt was persisted.
- No assistant response was persisted.
- No cwd was persisted.
- No transcript path was persisted.
- No raw session id or turn id was persisted.
- `permissionMode=bypassPermissions` was recorded as runtime metadata because Codex supplied it.

### Live non-target turn

- Non-target model: `gpt-5.6-luna`
- Turn completed successfully.
- Codex hooks fired, but CAE persisted no event because the model was not the configured target.
- CAE event count remained unchanged.

Strict non-target no-op behavior is therefore proven against live Codex runtime, not only synthetic hook input.

Temporary target configuration was cleared after the proof.

### Corrected runtime finding

Earlier pre-trust `codex exec` runs appeared silent. After the native hook trust gate was accepted, `codex exec` did fire hooks correctly on Codex 0.149.0.

The silence was caused by untrusted hooks, not by `exec` lacking hook support.

Interactive TUI displayed the native first-run message:

`Hooks need review / Trust all`

Trust was accepted through normal Codex UI behavior, which wrote native `trusted_hash` entries to Codex configuration. CAE must not bypass this trust interaction.

Interactive TUI model turns themselves stalled under this Termux/proot environment before server contact; `exec` remained the working client path. This appears environment-specific and unrelated to CAE hook behavior.

## Gate E — PASS

With an interactive Codex TUI process active, wrapper-compatible `cae quota` and `cae probe` reads both succeeded.

Observed:

- active Codex process remained alive;
- no logout or auth mutation;
- no model mutation;
- no Codex turn created by quota/model reads;
- no CAE hook observation created by the reads;
- authentication checksum unchanged.

Current quota shape remained:

- plan: `plus`
- 5-hour: 0% used
- weekly: 82% used
- single shared `codex` bucket
- `normalModelSlug`: null
- no model-specific buckets
- credits: `hasCredits=false`, `unlimited=false`, balance `"0"`
- reset credits available: 2
- `ordinaryUsageAllowed`: null

The reset-credit count changed naturally from 1 to 2 between observations and was recorded rather than forced or normalized away.

The model catalog count changed from 6 to 5 between reads. `gpt-5.4-mini` was deprecated with migration guidance toward `gpt-5.6-luna`. CAE treats catalog contents as dynamic runtime data.

## Gate F — PASS

- `cae uninstall --dry-run`: proposed CAE-owned removal only; no write.
- `cae uninstall`: removed CAE `UserPromptSubmit` and `Stop` handlers.
- unrelated Codex configuration remained intact.
- native hook trust entries in `config.toml` remained untouched.
- second uninstall was a no-op (`changed=false`).
- post-uninstall normal Codex turn completed successfully.
- ChatGPT sign-in remained functional.

## Compatibility deviations / product findings

1. **Launcher equivalence matters.** A working user Codex wrapper may provide environment setup that the underlying binary does not. CAE should support the user's real launcher without embedding Termux-specific behavior.
2. **Native hook trust is a real first-run UX step.** CAE public setup must explain it accurately and must not bypass Codex trust controls.
3. **Hook behavior is trust-dependent.** Pre-trust silence must not be misdiagnosed as missing lifecycle support.
4. **Client surfaces can differ by environment.** TUI turns stalled in this Termux/proot setup while `exec` turns worked and emitted hooks after trust.
5. **Current Plus quota authority is shared/default.** If Astra still uses this shared meter when it reaches Plus, controlled Astra cost measurements must avoid concurrent Codex work on the same account.
6. **Catalog and reset-credit state are dynamic.** CAE must treat them as observations, not stable constants.

## Gate result

- Gate A: PASS
- Gate B: PASS with launcher caveat
- Gate C: PASS
- Gate D: PASS
- Gate E: PASS
- Gate F: PASS

## Next boundary

The core pre-Astra native integration path is now proven on one real ChatGPT Plus Codex installation.

Astra itself remains absent from the native model catalog on this account.

Launcher override support is being implemented separately so CAE can use the user's functional Codex launcher directly on environments like this Termux setup. That change requires its own CI and local runtime revalidation and does not invalidate the A-F integration proof above.

**PRE-ASTRA NATIVE RUNTIME VALIDATION: PASS**

**NEXT BLOCKER: ASTRA PLUS AVAILABILITY / GATE G**
