# Pre-v0.1 Astra audit triage — 2026-09-05

Audit target: `bae14cebc1858c4f602a5f2cf46a2428ccf932f7`

Result: **5/5 findings independently confirmed by source inspection; remediation required before final v0.1 candidate freeze.**

| ID | Severity | Area | Triage |
| --- | --- | --- | --- |
| F1 | P1 | Windows launcher dispatch | Confirmed; v0.1 blocker for claimed Windows runtime compatibility |
| F2 | P2 | Child stream `EPIPE`/stdio errors | Confirmed; fix before v0.1 reliability freeze |
| F3 | P2 | Readiness with missing quota windows | Confirmed; false-green readiness must be removed |
| F4 | P2 | Unbounded synchronous version probe | Confirmed; bounded timeout required |
| F5 | P2 | Invalid parsed config shape | Confirmed; warning/fallback required instead of crash |

The audit itself made no repository changes. These findings are deterministic correctness/reliability issues and should be fixed and regression-tested without additional Astra or other Codex inference.

PR #16 remains a draft release-foundation/documentation lane and is not evidence that these runtime gaps are fixed.
