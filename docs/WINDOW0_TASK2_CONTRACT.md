# Window 0 Task 2 — Setup / Uninstall Safety

Purpose:

Test CAE as an ordinary ChatGPT Plus Codex user would encounter it before the
clean Window 1 campaign.

This is product-first CAE testing, not an Astra benchmark.

Primary scope:

- src/setup.js
- src/hooks-config.js
- bin/cae.js
- README.md sections directly describing setup/install/uninstall
- existing tests directly covering setup/hooks ownership

Objective:

Audit ONLY the CAE installation/setup/uninstall path for one concrete,
high-confidence defect that could cause an ordinary Plus user to:

- damage unrelated Codex configuration;
- leave stale CAE-owned configuration after uninstall;
- lose unrelated user hooks;
- get a non-idempotent setup/uninstall cycle;
- receive misleading setup/readiness state;
- encounter an undocumented mandatory step that would break a normal
  installation.

At most ONE independent defect may be fixed.

If one justified defect exists:
- implement only that fix;
- add/update focused regression coverage;
- update directly affected user documentation only if necessary;
- run npm test;
- run npm run check.

If no concrete defect exists:
- make no artificial change;
- report PASS / NO CHANGE.

Constraints:

- no broad repository audit;
- no architecture redesign;
- no native Termux repair;
- no provider/model routing;
- no telemetry/cloud work;
- no subagents/delegated workers;
- no web research;
- no dependency upgrades;
- no release publication;
- no automatic quota reset;
- do not change the native Codex /model experience;
- preserve all unrelated user hooks/config;
- CAE uninstall must remove only CAE-owned configuration;
- do not stop for a recoverable tool error — diagnose and retry safely within
  this narrow task.

Completion report:

- outcome: PASS / PARTIAL / FAIL_USEFUL / FAIL_WASTE
- concrete defect, if any
- change made
- tests/check
- setup idempotence conclusion
- uninstall ownership conclusion
- documentation gap, if any
- scope expanded: yes/no
- rework needed: yes/no
- strongest product strength observed
- remaining recommendation

Stop after the completion report.
