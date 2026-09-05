# Codex compatibility for v0.1.0

CAE v0.1.0 has been validated against OpenAI Codex CLI `0.153.2` on the authoritative codexu/Ubuntu-under-Termux environment, with automated cross-platform coverage on Ubuntu, Windows, and macOS.

CAE intentionally does not hard-code an allowlist of Codex versions for v0.1.0. A different Codex version is therefore **unverified**, not automatically unsupported. `cae doctor` reports the detected Codex version when available, while native model/quota/readiness failures remain explicit unavailable/degraded results rather than being converted into success or zero usage.

If a future Codex release changes model discovery, rate-limit app-server responses, hook configuration, launcher behavior, or another relied-upon surface, report the compatibility issue with the CAE version, Codex version, platform, and sanitized command result. Do not include credentials, raw prompts, source code, or complete transcripts.

Native Termux Codex is not part of the declared v0.1.0 support surface. The validated Android path is Codex running in Ubuntu under Termux (`codexu`); native Termux compatibility remains a separate tracked lane.
