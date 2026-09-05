# Astra Plus Availability Observation — 2026-09-04

## Status

**OPERATOR OBSERVATION / REQUIRES NATIVE CAE REVALIDATION**

At approximately 18:44 Central Time, the test ChatGPT Plus account operator observed Astra available in the native Codex `/model` picker while running Codex through the Ubuntu-under-Termux `codexu` environment.

A later `/status` screenshot at approximately 19:41 Central Time showed:

- account plan: ChatGPT Plus;
- Codex version: `0.153.2`;
- active model at screenshot time: `gpt-5.6-sol` with high reasoning;
- 5-hour allowance: 99% remaining;
- weekly allowance: 18% remaining;
- two usage-limit resets available.

The screenshot does **not** establish the exact native Astra model id or Astra quota-authority shape because Astra was not active in that screenshot. Those must be captured through the native Codex model/app-server surfaces before the first Astra task.

No account email, raw screenshot, prompt, code, transcript, or other personal identifier is stored in this receipt.

## Important version drift

The authoritative earlier A-F runtime validation used Codex `0.149.0`. The current operator screenshot shows Codex `0.153.2`.

Therefore Window 0 must re-run the zero-inference CAE compatibility checks on `0.153.2` before spending Astra allowance:

```text
npm test
npm run check
CAE_CODEX_COMMAND=/usr/bin/codex cae doctor
CAE_CODEX_COMMAND=/usr/bin/codex cae probe
CAE_CODEX_COMMAND=/usr/bin/codex cae quota
```

Issue #6 must remain open until its Termux launcher acceptance is proven on the current runtime.

## Campaign consequence

Astra availability means the project is no longer waiting for the Plus rollout gate. The next stage is:

1. current-version zero-inference revalidation;
2. live Astra model/quota identity capture;
3. Window 0 shakedown using only the currently remaining weekly allowance;
4. fix/harden without Astra;
5. one banked reset for the clean Window 1 early-release campaign;
6. wait for the next normal 5-hour window for Window 2 release-candidate validation.

The second banked reset is intentionally outside the planned release-test sequence.

## Evidence classification

- Astra visible in `/model`: operator-observed fact awaiting CAE-native capture.
- Codex `0.153.2`: operator-observed from `/status` screenshot.
- 99% 5-hour / 18% weekly / two resets: dynamic operator-observed allowance state, not a durable entitlement claim.
- exact Astra model slug: **unknown until native capture**.
- Astra-specific quota authority: **unknown until native capture**.
