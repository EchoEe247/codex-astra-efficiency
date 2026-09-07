# Codex compatibility for v0.1.0

CAE `v0.1.0` was validated against OpenAI Codex CLI `0.153.2` on the authoritative `codexu` / Ubuntu-under-Termux environment, with automated CLI coverage on Ubuntu, Windows, and macOS.

I intentionally do not want CAE to hard-code a Codex-version allowlist just because one version was used for the release campaign. A different Codex version is **unverified**, not automatically unsupported.

`cae doctor` reports the detected Codex version when available. If native model, quota, or readiness reads fail on another version, CAE should show an explicit unavailable or degraded result rather than turning that uncertainty into success or zero usage.

If a future Codex release changes model discovery, rate-limit app-server responses, hook configuration, launcher behavior, or another surface CAE relies on, report the compatibility problem with:

- CAE version;
- Codex version;
- platform/runtime;
- sanitized command result.

Do not include credentials, raw prompts, source code, or full transcripts.

## Android / Termux boundary

The supported Android path is Codex running in Ubuntu under Termux (`codexu`).

**Native Termux Codex is not supported by CAE under the currently validated upstream Android distribution.** This is a runtime/distribution boundary, not a claim that CAE itself is crashing or inventing data there.

Post-release zero-inference validation with Codex CLI `0.153.4` on a Pixel 6a showed:

- the native Android arm64 launcher selects the statically linked `aarch64-unknown-linux-musl` binary;
- `codex --version`, help, app-server initialization, and cached model discovery can work locally;
- the binary cannot complete the external network reads CAE needs for authoritative Plus quota/readiness in the validated native Termux environment;
- the observed musl resolver path expects `/etc/resolv.conf`, which the unrooted Android rootfs does not provide;
- the upstream launcher currently has no separate Android/bionic target in this path.

CAE therefore degrades correctly in native Termux: local diagnostics can work, `probe` may be partial, quota remains unavailable instead of becoming zero, and readiness blocks Astra use rather than reporting false success.

A wrapper that runs Codex through PRoot/Ubuntu is a valid `codexu`-style compatibility path, but that is not native-Termux support.

Issue #9 was closed with this unsupported disposition. Reconsider native support only if the upstream Android runtime/distribution changes enough for normal external Codex networking without PRoot or equivalent environment substitution.
