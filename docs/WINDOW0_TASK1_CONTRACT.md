# Window 0 Task 1 Contract

## Status

Authoritative bounded contract for the **first live Astra inference** in Window 0.

This contract refines the broader Window 0 plan after the live Plus model catalog was captured and after early Plus-user field reports showed that repository-wide audits, higher reasoning levels, and delegated/subagent work can make allowance burn difficult to interpret.

Authority chain:

1. `trackers/STATE.md`
2. `docs/ASTRA_WINDOW_0_SHAKEDOWN.md`
3. this Task 1 contract
4. `docs/ASTRA_PLUS_USAGE_FIELD_NOTES_2026-09-04.md` as advisory field evidence

## Runtime

- runtime: `ubuntu_in_termux / codexu`
- Codex launcher for CAE app-server reads: `/root/.local/bin/codex`
- exact Astra id: `gpt-6-astra`
- reasoning: `low` (native production default)
- Fast mode: off
- subagents/delegated workers: prohibited for Task 1

## Objective

Perform a focused pre-release audit of **only CAE's live Astra measurement path** and identify at most **one** concrete, high-confidence defect that could make Window 0 evidence inaccurate, unsafe, misleading, or unnecessarily expensive.

## Allowed code scope

Primary files:

- `src/hook.js`
- `src/observe.js`
- `src/rate-limits.js`
- `src/receipts.js`

Tests directly covering those files may be read and changed as necessary.

Other files may be opened only when required to understand an import/interface used by the primary scope. Do not expand the task into a repository-wide audit.

## Required behavior

If one clear, low-risk defect is found:

1. explain the defect briefly;
2. implement only that fix;
3. update the most appropriate existing test or add the minimum test needed to prove the fix;
4. run `npm test`;
5. run `npm run check`.

If no concrete defect is justified:

- make no code change;
- report a validated no-change conclusion;
- do not manufacture cleanup or speculative optimization work.

## Forbidden in Task 1

- full-repository audit or broad reconnaissance;
- more than one independent fix;
- subagents or delegated workers;
- Fast mode;
- web/browser research;
- dependency upgrades;
- native-Termux remediation;
- unrelated cleanup/refactors;
- new architecture/framework work;
- speculative optimizer behavior;
- automatic escalation from Low to Medium/High during the same task;
- continuing into Task 2 after completion.

If Low demonstrates a genuine reasoning ceiling, stop and record that fact. Do not silently retry the same objective at a higher effort before the post-task allowance snapshot is captured.

## Completion report

Return only:

- outcome: `PASS`, `PARTIAL`, `FAIL_USEFUL`, or `FAIL_WASTE`;
- strongest CAE strengths observed;
- concrete weakness found, if any;
- change made, if any;
- tests/check result;
- remaining recommendation(s);
- whether scope expanded;
- whether rework is likely required.

## Measurement rule

Task 1 is complete at the first natural task boundary. Immediately afterward, no second Codex/Astra prompt should be sent until CAE/Hermes captures the post-task quota and hook evidence and the coordination session decides whether Window 0 continues.
