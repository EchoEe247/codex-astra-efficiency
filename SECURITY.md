# Security Policy

## Supported versions

Until the first public release, only the latest release candidate is supported. After v0.1.0, the newest published patch release in the current minor line is the primary supported version unless a release note states otherwise.

## Reporting a vulnerability

Please do not open a public issue for a vulnerability that could expose or modify sensitive local data, credentials, Codex authentication state, prompts/source, or unrelated user configuration.

Use GitHub Private Vulnerability Reporting (`Security` -> `Report a vulnerability`) on this repository once public. If private reporting is not available, contact the maintainer privately before publishing details.

> **Release Boundary Action:** When repository visibility becomes PUBLIC, maintainers will enable GitHub Private Vulnerability Reporting (`OWNER_UI_ACTION_AT_RELEASE`).

Include only the minimum information needed to reproduce the problem:

- affected CAE version/commit;
- Codex version and platform;
- affected command or component;
- reproduction steps using synthetic/non-sensitive data;
- expected vs actual result;
- impact;
- suggested fix if you have one.

Never send real API keys, cookies, auth tokens, account credentials, raw private prompts, proprietary source, or complete Codex transcripts.

## High-sensitivity surfaces

The following areas receive heightened review:

- Codex hook installation/uninstallation;
- local state and receipt persistence;
- native Codex app-server/process execution;
- command/launcher resolution;
- file deletion or cleanup;
- quota/token parsing;
- GitHub Actions and release automation;
- dependency and package-install changes;
- any new network behavior.

## Project security/privacy invariants

CAE is intended to preserve these invariants:

- local storage by default;
- no raw prompt/response/source upload by default;
- no browser-cookie harvesting;
- no OpenAI credential collection beyond the user's normal Codex authentication;
- no usage-limit bypass/reset automation;
- unrelated Codex configuration survives setup/uninstall;
- hook observation failures fail open and do not block the user's Codex turn;
- unknown quota/measurement state is not converted into a confident numerical claim.

A report that breaks one of these invariants is treated as high priority even if the immediate exploitability is limited.

## Contribution security review

Community fixes are welcome, including complete patches. Before merge, maintainers independently review the diff and may run secret scanning, dependency review, shell/process/network inspection, test-integrity checks, cross-platform CI, and clean package/install/uninstall validation.

Security-sensitive changes should include regression coverage demonstrating both the vulnerable behavior and the corrected behavior when practical.

## Disclosure

Please allow time for reproduction, a fix, regression validation, and a release before public disclosure. The project will preserve contributor credit unless anonymity is requested.