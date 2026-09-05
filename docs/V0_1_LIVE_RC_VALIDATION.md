# Final v0.1 Live Release-Candidate Validation Contract

Date: 2026-09-05
Status: PASS — COMPLETED 2026-09-05
Scope: Final pre-release live verification of the installed v0.1.0 package artifact.

---

## Operating constraints

- **DO NOT SPEND A RESET** without explicit owner authorization. (SATISFIED: Exactly ONE reset authorized and spent; second reset remains untouched with 1 credit preserved.)
- Must run against the globally installed package (`npm install -g codex-astra-efficiency@0.1.0`), not the git source checkout. (SATISFIED: Verified globally installed package at `/data/data/com.termux/files/usr/lib/node_modules/codex-astra-efficiency`.)
- Authoritative runtime: `codexu` (Ubuntu under Termux) with Codex CLI `0.153.2`.
- Exact target model: `gpt-6-astra`.
- Reasoning effort: `low`.
- Fast mode: OFF if exposed, otherwise UNKNOWN.
- Normal Codex launch and user workflow (normal permissions, no bypassFlags).

---

## Check A: Non-Astra Model No-Op — PASS

1. Launch native Codex normally.
2. Select a non-Astra model (`gpt-5.6-sol`).
3. Execute one normal prompt turn (`Reply with exactly CAE_NON_ASTRA_NOOP_OK. Make no repository changes.`).
4. Verification evidence:
   - Turn completed normally with non-Astra response `CAE_NON_ASTRA_NOOP_OK`.
   - `cae events` targeted Astra observation count remained unchanged (`18 -> 18`).
   - CAE hook handler exited immediately as a strict no-op with zero observations recorded.
   - Repository worktree remained completely clean.

---

## Check B: Final Astra RC Turn — PASS

1. Launch native Codex normally.
2. Use `/model` to select **GPT-6-Astra**.
3. Confirm reasoning effort is set to `low`.
4. Run one bounded installed-artifact validation prompt in normal Workspace permissions.
5. Verification evidence:
   - `UserPromptSubmit` hook fired and logged opaque correlation record.
   - `Stop` hook fired upon turn completion (`23:13:05Z` to `23:14:02Z`, 57.8s duration).
   - Exact model `gpt-6-astra` recorded.
   - Privacy invariants held: zero raw prompts, code, responses, or credentials persisted.
   - Turn completed successfully in normal workflow mode (Astra reported `PASS` across `help`, `doctor`, `readiness`, and `quota`).
   - Quota authority remained stable (`limitId=codex`; 5h burn: 4%, weekly burn: 1%).
   - Zero CAE-caused crash, stall, or unhandled rejection.
   - User configuration in `hooks.json` remained uncorrupted.
   - Repository worktree remained completely clean.

---

## Validation Summary & Sign-off

- **Candidate Commit:** `44358f5155d031a6d40287cf3f08b90bf6809bd3`
- **Artifact SHA1:** `dab3bbb5fd0bccc649f424a7386ef19800d78eea`
- **Check A (Non-Astra No-Op):** PASS
- **Check B (Astra Installed Artifact RC):** PASS
- **Reset Credits Remaining:** 1 (second banked reset untouched)
- **Detailed Receipt:** [`receipts/v0.1-live-rc-validation-2026-09-05.md`](../receipts/v0.1-live-rc-validation-2026-09-05.md)
- **Final Release Gate:** COMPLETE — READY FOR PUBLICATION
