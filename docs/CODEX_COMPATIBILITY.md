# Codex compatibility for v0.1.0

CAE v0.1.0 was validated against OpenAI Codex CLI `0.153.2` on the authoritative codexu/Ubuntu-under-Termux environment, with automated cross-platform coverage on Ubuntu, Windows, and macOS.

CAE intentionally does not hard-code an allowlist of Codex versions for v0.1.0. A different Codex version is therefore **unverified**, not automatically unsupported. `cae doctor` reports the detected Codex version when available, while native model/quota/readiness failures remain explicit unavailable/degraded results rather than being converted into success or zero usage.

If a future Codex release changes model discovery, rate-limit app-server responses, hook configuration, launcher behavior, or another relied-upon surface, report the compatibility issue with the CAE version, Codex version, platform, and sanitized command result. Do not include credentials, raw prompts, source code, or complete transcripts.

## Android / Termux support boundary

The supported Android path is Codex running in Ubuntu under Termux (`codexu`). Native Termux Codex is **not supported** by CAE under the currently validated upstream distribution.

A post-release zero-inference check with Codex CLI `0.153.4` on a Pixel 6a showed that the native Android arm64 launcher selects the statically linked `aarch64-unknown-linux-musl` binary. Local execution works far enough for `codex --version`, help, app-server initialization, and cached model discovery, but the binary cannot complete the external network reads CAE requires for authoritative Plus quota/readiness in that native Termux environment. The observed resolver path expects `/etc/resolv.conf`, which the unrooted Android rootfs does not provide.

CAE therefore degrades correctly in native Termux: local diagnostics may work, but quota visibility remains unavailable and readiness blocks Astra use rather than reporting false success or zero usage.

A wrapper that launches Codex through PRoot/Ubuntu is a valid `codexu`-style compatibility path, but it does not count as native-Termux support. Native support should be reconsidered only if the upstream Android runtime/distribution changes enough to provide normal external Codex networking without PRoot or equivalent environment substitution.
