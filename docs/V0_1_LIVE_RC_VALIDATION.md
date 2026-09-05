# Final v0.1 Live Release-Candidate Validation Contract

Date: 2026-09-05
Status: DRAFT — AWAITING OWNER ALLOWANCE AUTHORIZATION
Scope: Final pre-release live verification of the installed v0.1.0 package artifact.

---

## Operating constraints

- **DO NOT SPEND A RESET** without explicit owner authorization.
- If weekly quota is near exhaustion, pause and coordinate before running.
- Must run against the installed package (`npm install -g ./codex-astra-efficiency-0.1.0.tgz`), not the git source checkout.
- Authoritative runtime: `codexu` (Ubuntu under Termux) with Codex CLI `0.153.2`.
- Exact target model: `gpt-6-astra`.
- Reasoning effort: `low`.
- Fast mode: OFF if exposed, otherwise UNKNOWN.
- Normal Codex launch and user workflow (normal permissions, no bypassFlags).

---

## Check A: Non-Astra Model No-Op

1. Launch native Codex normally.
2. Select a non-Astra model (e.g., standard GPT-4o / default model).
3. Execute one normal prompt turn (e.g., "echo hello").
4. Verify:
   - Turn executes normally with no interference.
   - `cae events` shows NO new targeted Astra observation.
   - CAE hook handler exits immediately as a strict no-op.

---

## Check B: Final Astra RC Turn

1. Launch native Codex normally.
2. Use `/model` to select **GPT-6-Astra**.
3. Confirm reasoning effort is set to `low`.
4. Run one bounded, useful release-candidate task (e.g., small file inspection or test run).
5. Verify:
   - `UserPromptSubmit` hook fires and logs opaque correlation record.
   - `Stop` hook fires upon turn completion.
   - Exact model `gpt-6-astra` is recorded.
   - Privacy invariants hold: no raw prompt, code, response, or credentials persisted.
   - Turn completes successfully in normal workflow mode.
   - Quota authority remains interpretable (`cae quota` reflects post-turn state).
   - Zero CAE-caused crash, stall, or unhandled rejection.
   - User configuration in `hooks.json` remains uncorrupted.

---

## Post-Validation Sign-off

Upon successful execution of Check A and Check B:
- Record live execution receipt in `receipts/v0.1-live-rc-validation-2026-09-05.md`.
- Mark release criteria fully satisfied.
- Proceed to release tag and publication sequence.
