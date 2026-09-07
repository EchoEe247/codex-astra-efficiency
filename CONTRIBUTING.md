# Contributing to Codex Astra Efficiency

Contributions are welcome. CAE is intentionally small, so focused changes with clear evidence are more useful than broad rewrites that make the system harder to reason about.

I also want outside contributions to be treated seriously. A correct community patch does not need to be rewritten by the maintainer just to become acceptable; it does need the same independent review and validation that maintainer-authored work receives.

## Before opening a change

For bugs, open an issue first when practical and include:

- CAE version or commit;
- Codex version;
- operating system/runtime;
- ChatGPT plan if relevant to the behavior;
- model and reasoning level if the report concerns Astra usage;
- CAE command or workflow that failed;
- sanitized output and exact reproduction steps.

Do **not** include raw prompts, private source code, Codex transcripts, credentials, cookies, API keys, account identifiers, or raw native session/turn ids.

A report is evidence to investigate. It is not automatically a confirmed CAE bug until the project can reproduce or otherwise validate the claim.

## Pull requests

Keep pull requests narrow enough that the problem, fix, and validation remain understandable.

A strong PR:

1. explains the problem;
2. includes a reproduction or failing test when practical;
3. makes the smallest coherent correct change;
4. adds focused regression coverage;
5. preserves CAE's privacy and native-Codex constraints;
6. passes the relevant full test/check suite.

Run before submitting:

```bash
npm test
npm run check
git diff --check
```

Do not weaken a test or validation gate merely to turn the PR green.

## Product constraints contributors must preserve

- Codex remains the user's normal interface.
- Model selection remains native `/model`.
- CAE activates only for explicitly configured Astra ids.
- Non-Astra behavior remains a strict no-op.
- Missing or ambiguous quota state remains unknown/unavailable rather than guessed.
- 5-hour and weekly windows are measured independently.
- CAE does not invoke or automate usage resets.
- CAE does not collect OpenAI credentials.
- CAE does not persist raw prompts, responses, source code, cwd paths, or raw native session/turn identifiers.
- Setup/uninstall preserves unrelated Codex configuration.
- Hook failures fail open rather than blocking a productive Codex turn.

These are product boundaries, not style preferences. A change that violates one of them needs an explicit product decision rather than slipping in as an implementation detail.

## Dependencies

New runtime dependencies need a concrete reason. Prefer the Node.js standard library when it keeps the implementation clear and maintainable.

Dependency changes receive extra review for:

- provenance and maintenance status;
- install/postinstall behavior;
- transitive dependency growth;
- network or telemetry behavior;
- known vulnerabilities;
- lockfile changes.

## GitHub Actions, shell, and process execution

Changes to workflows, shell commands, process spawning, file deletion, hook installation, or package installation receive heightened review.

Do not introduce:

- hidden network uploads;
- credential collection;
- destructive cleanup outside CAE-owned paths/configuration;
- unsafe shell interpolation;
- test bypasses;
- broad permissions without a demonstrated need.

## Usage and measurement changes

Changes to quota parsing, token accounting, receipts, or efficiency calculations should include recorded or synthetic fixtures covering ambiguous and failure states.

Never produce a numerical result when the native evidence cannot support it. In particular, do not calculate a usage delta across an unknown or changed quota reset boundary.

An efficiency intervention does not become a default because it sounds token-efficient. It needs real Astra evidence and a quality guardrail.

## Maintainer review

Before merge, maintainers may perform:

- complete diff review;
- regression reproduction;
- test-integrity review;
- dependency and lockfile review;
- secret and credential scanning;
- shell/process/network behavior review;
- workflow-permission review;
- privacy-model review;
- cross-platform CI;
- clean package/install/uninstall smoke tests for affected surfaces.

The practical standard is that the project should be able to explain why a patch is correct and safe, not merely that the code looks plausible.

## Scope and history

Use clear names and straightforward code. Avoid speculative abstractions unrelated to the issue being solved.

Historical receipts stay historical. If current state changes, update the current authority instead of rewriting old evidence to make the past look current.

## Security issues

Do not open a public issue for a vulnerability that could expose credentials, private prompts/source, local files, or unrelated user configuration, or that could create destructive behavior. Follow `SECURITY.md` instead.
