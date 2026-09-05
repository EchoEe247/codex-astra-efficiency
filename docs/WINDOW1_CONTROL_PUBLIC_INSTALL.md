# Window 1 Control — Ordinary User Public Install / Setup / Uninstall

Campaign:
WINDOW_1_CONTROL

Mode:
PASS-THROUGH / OBSERVE-ONLY

This is genuine release-critical product work.

It is NOT:
- a benchmark
- an efficiency intervention
- a toy task
- an attempt to minimize Astra usage

OBJECTIVE

Make CAE's public installation/setup/uninstallation workflow ready for an
ordinary ChatGPT Plus Codex user.

Establish a truthful, usable supported flow covering:

- prerequisites
- supported Node/runtime versions
- installation from the intended package/artifact form
- confirming the `cae` CLI is callable
- `cae setup`
- native Codex hook review/trust when Codex requests it
- selecting Astra through native `/model`
- `cae readiness`
- what a ready state means
- `cae uninstall`
- preservation of unrelated Codex hooks/configuration
- what CAE removes and what it intentionally leaves alone
- codexu / Android-under-Ubuntu support boundary
- native Termux not being publicly claimed unless separately validated

PACKAGE VALIDATION

Where practical and useful:

- run `npm pack`
- inspect the package contents
- install the produced tarball into an isolated temporary environment
- invoke the packaged CLI, not just source checkout
- use isolated HOME/CODEX_HOME state
- exercise setup/uninstall safely
- prove unrelated hook/config state survives
- prove CAE-owned hooks are removed
- do not publish to npm

SCOPE

Astra may modify:

README.md
package metadata if truly required
setup/install documentation
tests directly needed for the public install contract
small implementation defects discovered directly while completing this task

Do NOT:

- publish npm package
- make a GitHub release
- redesign CAE
- add an optimization
- alter quota accounting without a concrete correctness bug
- alter model routing
- repair unrelated native Termux Codex
- perform broad speculative architecture work

NORMAL AUTONOMY

Do not artificially minimize:

- tool calls
- file reads
- reasoning
- runtime
- token usage
- normal validation

Do not artificially increase them either.

Use normal professional Codex behavior.

Recoverable tool error:
diagnose/retry safely.

VALIDATION

Run:

npm test
npm run check
git diff --check

COMPLETION REPORT

Return:

outcome:
objective completed:
files changed:
public installation flow:
package/clean-room validation:
setup result:
readiness result:
uninstall result:
unrelated config preservation:
tests:
documentation:
defects discovered:
subagents used:
scope expansion:
rework needed:
remaining release recommendation:

Stop after completion.
