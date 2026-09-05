# Contributing to Codex Astra Efficiency

Contributions are welcome. CAE is small by design, so focused changes with clear evidence are preferred over broad rewrites.

## Before opening a change

For bugs, open an issue first when practical and include:

- CAE version or commit;
- Codex version;
- operating system/runtime;
- ChatGPT plan if relevant to the behavior;
- model and reasoning level if the report concerns Astra usage;
- the CAE command or workflow that failed;
- sanitized output and exact reproduction steps.

Do **not** include raw prompts, source code you cannot share, Codex transcripts, credentials, cookies, API keys, account identifiers, or raw native session/turn ids.

A report is treated as evidence to investigate, not automatically as a confirmed product bug. Maintainers may reproduce and reclassify it before changing CAE.

## Pull requests

Keep pull requests narrow. A good PR:

1. explains the problem;
2. includes a reproduction or failing test when possible;
3. makes the smallest correct change;
4. adds focused regression coverage;
5. preserves CAE's privacy and native-Codex constraints;
6. passes the full test/check suite.

Run before submitting:

```bash
npm test
npm run check
git diff --check
```

Do not weaken tests or validation gates merely to make a PR pass.

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
- Setup/uninstall must preserve unrelated Codex configuration.
- Hook failures must fail open rather than block a user's productive Codex turn.

## Dependencies

New runtime dependencies require a concrete justification. Prefer the Node.js standard library when it keeps the implementation clear and maintainable.

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

Changes to quota parsing, token accounting, receipts, or efficiency calculations should include recorded/synthetic fixtures covering ambiguous and failure states.

Never infer a numerical result when the native evidence cannot support it. In particular, do not calculate across an unknown or changed quota reset boundary.

Any claimed efficiency intervention must be optional or otherwise explicitly justified by real Astra evidence before becoming a default.

## How maintainer review works

A community PR can be merged directly when it is correct; maintainers do not need to recreate the patch merely because it came from an external contributor. However, every contribution is independently reviewed.

Before merge, maintainers may perform:

- complete diff review;
- regression reproduction;
- test-integrity review;
- dependency/lockfile review;
- secret and credential scanning;
- suspicious shell/process/network behavior review;
- workflow-permission review;
- privacy-model review;
- cross-platform CI;
- clean package/install/uninstall smoke tests for affected surfaces.

A technically plausible patch is not merged until the project can explain why it is correct and safe.

## Scope and style

Use clear names and straightforward code. Avoid speculative abstractions unrelated to the issue being solved. Historical receipts should remain historical; update current-state authorities instead of rewriting old evidence.

## Security issues

Do not open a public issue for a vulnerability that could expose credentials, private prompts/source, local files, or create destructive behavior. Follow `SECURITY.md` instead.