# Prior Art and Product Boundary

Status: living reconnaissance authority

CAE is intentionally narrow: **ChatGPT Plus + Codex + Astra-specific efficiency while preserving the native Codex experience.** This document records adjacent public projects so CAE can reuse proven ideas without drifting into a generic usage dashboard, proxy, router, or agent framework.

## Closest adjacent projects

### getagentseal/codeburn

Broad local-first AI coding spend and workflow analysis across many tools. It detects patterns such as repeated reads, context-heavy sessions, retries, unused tool/schema overhead, and low-value expensive sessions. It also supports reversible configuration fixes and later checks whether the claimed savings actually appeared.

**Useful lesson for CAE:** an efficiency intervention is not trustworthy until later real usage validates it.

**Boundary:** CAE does not become a multi-provider optimizer and must not import Claude-specific assumptions into Codex/Astra.

### douglasmonsky/codex-usage-tracker

Codex-first local evidence kernel for exact session, turn, call, tool, resource, allowance, token, credit, and cost facts. Its architecture explicitly separates observed facts from model-authored judgments such as waste or productivity.

**Useful lesson for CAE:** keep facts, deterministic derivations, hypotheses, and validated recommendations separate.

**Boundary:** CAE's purpose is not to recreate a general Codex evidence/query kernel.

### XZero92/QuotaPacer

Cross-platform Codex quota pacing utility using the installed Codex CLI app-server instead of reading credentials directly. It tracks returned windows, pace, exhaustion risk, and warnings.

**Useful lesson for CAE:** app-server quota access and duration-based window handling are viable patterns; incomplete data must remain incomplete.

**Boundary:** CAE measures useful Astra work and tests efficiency interventions rather than optimizing only for quota runway.

### thrr87/codex-limits

macOS quota/history/task analysis with Usage Receipts, reset information, models, reasoning levels, task trees, coverage, and confidence.

**Useful lesson for CAE:** attach confidence/coverage to derived guidance and keep account facts separate from locally observed task facts.

**Boundary:** CAE should remain lightweight and cross-platform rather than becoming a native analytics dashboard.

### shanggqm/codexU

Desktop usage analysis including quota windows plus model × reasoning-effort runtime statistics, percentiles, effective throughput, and reasoning-token share.

**Useful lesson for CAE:** Astra reasoning-effort experiments should measure both allowance burn and real completion behavior rather than assuming higher effort is always worthwhile.

**Boundary:** CAE is not a general desktop productivity/leadership dashboard.

### HaKuLaMeTAT/codex-quota-overlay and related quota overlays

Small companion utilities that show Codex 5-hour/weekly quota using the local app-server while leaving Codex itself alone.

**Useful lesson for CAE:** minimal integration can be a product advantage. Codex should still feel like Codex.

### janekbaraniewski/openusage

Terminal-first cross-provider quota, usage, burn-rate, session, and model tracking across many coding tools.

**Useful lesson for CAE:** zero-config detection and compact status output are valuable.

**Boundary:** CAE does not compete for the all-provider/all-agent dashboard category.

### cortexkit/openai-auth

OpenCode plugin for ChatGPT Plus/Pro Codex access with quota visibility, prompt-cache stabilization, optional cache keep-warm, and multi-account routing.

**Useful research lead for CAE:** measure whether prompt/cache continuity materially changes Astra Plus allowance burn.

**Boundary:** CAE must not replace native Codex transport, silently route accounts/models, or require users to move to OpenCode.

### Soju06/codex-lb

Multi-account ChatGPT load balancer/proxy with Codex-compatible endpoints and usage tracking.

**Boundary:** deliberately out of CAE scope. Repointing Codex through a custom proxy violates the native-experience product contract.

## Gap CAE targets

The adjacent ecosystem already covers quota visibility, general usage analytics, multi-provider cost tracking, and broad optimization. CAE targets the intersection that remains underserved:

- ChatGPT Plus economics;
- GPT-6 Astra specifically;
- native Codex model-picker workflow;
- separate 5-hour and weekly allowance evidence;
- real-work outcome receipts;
- Astra-specific reasoning/context/execution experiments;
- validated efficiency interventions;
- strict no-op behavior for all non-Astra models;
- no proxy, alternate harness, account pool, or model router.

## Design rules derived from prior art

1. **Facts before advice.** Never label usage as waste from one ambiguous signal.
2. **Validate interventions.** Measure a change against later real work before advertising savings.
3. **Preserve unknowns.** Missing quota windows are `not_reported`, not zero or unlimited.
4. **Do not optimize for short runs.** A long Astra run that completes valuable work can be efficient.
5. **Keep integration lightweight.** Native Codex remains the primary interface.
6. **No hidden substitution.** Selecting Astra means Astra in core CAE.
7. **Local-first by default.** No prompt/code/transcript upload is required for CAE measurement.
8. **Treat cache continuity as a hypothesis.** Measure it before promoting any cache-related intervention.

## Repositories

- https://github.com/getagentseal/codeburn
- https://github.com/douglasmonsky/codex-usage-tracker
- https://github.com/XZero92/QuotaPacer
- https://github.com/thrr87/codex-limits
- https://github.com/shanggqm/codexU
- https://github.com/HaKuLaMeTAT/codex-quota-overlay
- https://github.com/janekbaraniewski/openusage
- https://github.com/cortexkit/openai-auth
- https://github.com/Soju06/codex-lb
