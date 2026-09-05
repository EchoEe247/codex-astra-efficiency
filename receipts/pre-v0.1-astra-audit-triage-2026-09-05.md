# Pre-v0.1 Astra audit triage — 2026-09-05

Audit target: `bae14cebc1858c4f602a5f2cf46a2428ccf932f7`

Result: **F1–F5 FIXED** in PR #18 at merge SHA `32ff3ce4b396d784ca9a03ef143bfbbe187de72a`.

| ID | Severity | Area | Status | Resolution |
| --- | --- | --- | --- | --- |
| F1 | P1 | Windows launcher dispatch | FIXED | ComSpec `/d /s /c` argv dispatch for `.cmd`/`.bat`; native `.exe` direct; Windows CI `.cmd` e2e test passing |
| F2 | P2 | Child stream `EPIPE`/stdio errors | FIXED | `stdin`, `stdout`, `stderr`, and `readline` errors route to single `settle()`; structured codes; cleanup verified |
| F3 | P2 | Readiness with missing quota windows | FIXED | Explicit measurement readiness (`unavailable`/`degraded`/`ready`); truthful visibility; false-green gate eliminated |
| F4 | P2 | Unbounded synchronous version probe | FIXED | Documented `CODEX_VERSION_TIMEOUT_MS = 4000`; deterministic unavailable result; `codexVersionStatus` surfaced |
| F5 | P2 | Invalid parsed config shape | FIXED | JSON shape validated before dereference; `config_invalid_shape:<reason>` warning; env fallback; fail-open hooks |

Evidence:
- PR #18 merged to main at SHA `32ff3ce4b396d784ca9a03ef143bfbbe187de72a`
- Full CI matrix green (Ubuntu 20/22, Windows 22, macOS 22)
- Zero Codex model inference spent
- Reset credits: 2 remaining; Window 1 not started
