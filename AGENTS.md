# AGENTS.md

This file is the operating handoff for fresh ChatGPT or agent sessions working in Codex Astra Efficiency (CAE).

## Project authority

Use the current repository, release state, open PR/issue state, current tracker, and exact validation receipts as technical authority. Do not treat old Window 0, pre-v0.1, or release-candidate documents as current simply because they contain more detail.

Current product truth outranks old chat/session context.

## Angel wording integration

For Angel-owned project communication, use `EchoEe247/Chatgpt-Angel-wording-refinement` as the wording/refinement authority.

Keep the boundary clear:

- CAE defines **what the product is, what it supports, what has been validated, and what remains unknown or unsupported**;
- `Chatgpt-Angel-wording-refinement` defines **how Angel-owned communication about CAE should be refined and expressed**.

For routine wording work, use that repository's `prompts/SESSION_BOOTSTRAP.md`. For important or ambiguous technical, release, measurement, security, or public wording, also load the full system spec, relevant profile, and meaning-preservation rules.

Default to Angel-refined. Use Angel-professional for serious technical, release, compatibility, security, and measurement documentation.

Project truth always outranks style.

## Locked CAE direction

Preserve these unless a later reviewed project decision changes them:

- ChatGPT Plus first;
- Codex first;
- Astra only;
- native Codex workflow and `/model` selection remain the user control plane;
- strict non-Astra no-op behavior;
- no silent substitution of another model for Astra;
- 5-hour and weekly allowance windows remain separate measurements;
- unknown or ambiguous quota/token state stays unknown rather than guessed;
- local-first privacy;
- no quota bypass/reset/circumvention claims;
- useful completed work matters more than simply minimizing runtime or token count;
- efficiency interventions require real evidence before becoming defaults.

## Compatibility boundary

The validated Android path is `codexu` / Ubuntu-under-Termux. Native Termux Codex is currently unsupported under the validated upstream Android distribution and must not be described as supported unless new evidence changes that boundary.

## Evidence behavior

Historical receipts and dated audits remain historical. Update living docs and `trackers/STATE.md` when current state changes. A PASS proves only the scope actually tested.

Do not spend Astra allowance merely to manufacture samples when genuine project work can provide the same evidence.