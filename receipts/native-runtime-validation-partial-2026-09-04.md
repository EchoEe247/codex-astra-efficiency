# Native Codex Runtime Validation — Partial Receipt — 2026-09-04

Status: **PARTIAL — Gates A-C PASS, Gate D PARTIAL, Gates E-F pending**

## Environment

- Platform: Android aarch64 / Termux
- Node: v24.18.0
- Codex: 0.149.0
- CAE commit tested: `0497f5a`
- `CODEX_HOME`: default `~/.codex`
- ChatGPT authentication: signed in and functional

## Gate A — PASS

Observed:

- `npm test`: 48/48 PASS
- syntax/check path clean
- package link succeeded
- `cae doctor` reports Codex version
- hook configuration readable

## Gate B — PASS WITH ENVIRONMENT-SPECIFIC WORKAROUND

Direct `cae probe` / `cae quota` fails on this Termux environment because the underlying musl Codex binary has no usable `/etc/resolv.conf` and cannot resolve DNS.

The same Codex binary, same Codex home, and same ChatGPT authentication work when launched through the local Termux Codex wrapper at `/usr/bin/codex`, which supplies a working resolver inside its proot environment.

Through that native wrapper path, CAE-compatible read-only evidence is:

- plan: `plus`
- 5-hour used: 0%
- weekly used: 82%
- one `codex` quota bucket
- `normalModelSlug`: null
- no model-specific quota buckets observed
- credits: `hasCredits=false`, `unlimited=false`, balance `0`
- `resetCreditsAvailable`: 1
- native model catalog: 6 models
- Astra discovery: `not_found`

Configuration checksum was unchanged before/after read-only probing.

Interpretation:

- quota/model app-server protocol works on the signed-in account;
- this environment needs launcher/wrapper compatibility support so CAE can use the same functional Codex launch path as the user;
- the observed quota meter is currently shared/default, not model-specific.

## Gate C — PASS

Observed:

- setup adds only CAE-owned `UserPromptSubmit` and `Stop` handlers;
- user-owned/unrelated hook configuration is preserved;
- second setup is idempotent.

## Gate D — PARTIAL

Synthetic hook plumbing:

- targeted model observation PASS;
- exact model recorded;
- opaque `sessionKey` / `turnKey` correlation PASS;
- raw prompt, response, cwd, transcript path, session id, and turn id are absent;
- non-target model is strict no-op;
- `Stop` correlation PASS.

Live runtime findings:

- `codex exec` turns complete but produced no CAE hook events in this installed Codex build/path;
- interactive TUI does gate hooks and showed the native `Hooks need review, Trust all` trust prompt;
- trust was granted through the normal Codex UI;
- the initially targeted `gpt-5.4-mini` is deprecated and Codex redirects toward Luna;
- a Luna turn then stalled while streaming before the target/picker proof was completed;
- temporary synthetic events were cleared;
- target was moved toward `gpt-5.6-luna`, but the live picker/turn proof remains incomplete.

Current conclusion:

- do not use `codex exec` as hook evidence for this Codex build;
- complete Gate D through the normal interactive TUI/model picker, which is also the product path CAE intends to preserve.

## Gates E-F

Not yet run.

## Product-relevant findings

1. **Normal TUI hook trust is a real first-run UX event.** Public setup must account for this instead of claiming completely invisible installation.
2. **Termux launcher compatibility is real.** CAE should be able to use the same working Codex launcher/wrapper the user uses, rather than assuming a directly spawned binary is equivalent on every platform.
3. **`codex exec` is not an equivalent hook-validation surface in Codex 0.149.0 on this environment.** Native TUI behavior is authoritative for the current product goal.
4. **Current signed-in Plus quota appears shared/default.** Controlled Astra baseline runs should avoid simultaneous Codex usage if this remains the only meter once Astra arrives.

## Next action

Resume Gate D in interactive Codex TUI:

- target exact `gpt-5.6-luna`;
- select Luna through the normal picker;
- complete one harmless turn;
- verify live targeted hook events;
- select another non-target model and complete one harmless turn;
- verify event count does not increase;
- clear temporary target;
- then execute Gates E and F.

Only after D-F complete should this receipt be superseded by a final A-F runtime receipt.
