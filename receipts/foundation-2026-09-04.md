# Foundation Receipt — 2026-09-04

## Result

**PASS for repository foundation. Runtime Codex integration remains unvalidated.**

## Created

- product charter and narrow Astra-only scope;
- Plus real-work test methodology;
- Codex integration reconnaissance;
- public v0.1 release gate;
- authoritative project state tracker;
- GitHub execution issues #1–#5;
- zero-runtime-dependency Node scaffold;
- Astra exact-target filtering primitives;
- fail-open hook handler;
- privacy-minimal local observation schema;
- initial `cae doctor`, internal `cae hook`, and `cae events` commands;
- Node 20/22 GitHub Actions workflow.

## Upstream Codex evidence inspected

Current `openai/codex` source was inspected before choosing the initial integration direction.

Observed in current upstream source:

- Codex hooks are marked stable and enabled by default in the feature table.
- Hook events include `UserPromptSubmit` and `Stop`.
- Generated `UserPromptSubmit` hook input includes the active `model`.
- Generated `Stop` hook input includes the active `model`.
- `UserPromptSubmit` output supports optional `additionalContext`.
- Codex app-server documents `account/rateLimits/read` and rolling rate-limit updates.
- App-server documents turn completion with token usage.

These are source-level findings, not proof that every installed Codex release exposes identical behavior.

## Local scaffold validation

The initial scaffold was reproduced in a clean local working directory and tested with Node 22.16.0.

Results:

- `npm test`: **6/6 PASS**
- `npm run check`: **PASS**

Covered assertions:

1. Astra target IDs are exact and case-insensitive.
2. An unconfigured Astra target never activates.
3. Non-Astra model input is a strict no-op.
4. Astra observation excludes raw cwd and transcript paths.
5. Non-Astra turns do not create local observation files.
6. Targeted Astra events create one local JSONL observation.

## Safety behavior in scaffold

- CAE hook errors fail open so observation failure does not block a Codex turn.
- Non-Astra models receive no observation write.
- Astra target IDs are configuration-driven; the code does not guess the final production Astra model slug.
- Default observation metadata does not store raw cwd, transcript path, prompt, or code.
- No optimization context is injected in baseline mode.

## Not yet proven

- normal installed Codex actually executes the CAE hook command;
- native model-picker Astra selection reaches the hook with the expected model ID;
- exact Astra production model slug(s);
- authoritative Plus 5-hour/weekly rate-limit acquisition in a normal active Codex session;
- setup/uninstall merge behavior with an existing user `hooks.json`;
- Astra-specific efficiency improvement;
- public-package install experience;
- GitHub Actions result for the newly added workflow.

## Next gate

Issue #2: prove the native Codex hook path against a real Codex installation while preserving normal user workflow. In parallel, issue #3 should prove authoritative Plus rate-limit reads.
