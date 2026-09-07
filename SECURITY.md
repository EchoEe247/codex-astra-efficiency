# Security Policy

## Supported versions

CAE `v0.1.0` is the current published release. As the project gains patch releases, the newest published patch in the current supported minor line is the primary supported version unless a release note states otherwise.

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could expose or modify sensitive local data, credentials, Codex authentication state, prompts/source, or unrelated user configuration.

Use GitHub Private Vulnerability Reporting from the repository's **Security** area when that option is available. If private reporting is not available, contact the maintainer privately before publishing the technical details.

Include only what is needed to reproduce the problem safely:

- affected CAE version or commit;
- Codex version and platform;
- affected command or component;
- reproduction steps using synthetic/non-sensitive data;
- expected versus actual result;
- impact;
- suggested fix if you have one.

Never send real API keys, cookies, auth tokens, account credentials, raw private prompts, proprietary source, or complete Codex transcripts.

## High-sensitivity surfaces

The following areas receive heightened review:

- Codex hook installation and uninstall;
- local state and receipt persistence;
- native Codex app-server/process execution;
- command and launcher resolution;
- file deletion or cleanup;
- quota and token parsing;
- GitHub Actions and release automation;
- dependency and package-install changes;
- any new network behavior.

## Security and privacy invariants

CAE is designed to preserve these boundaries:

- local storage by default;
- no raw prompt, response, or source upload by default;
- no browser-cookie harvesting;
- no OpenAI credential collection beyond the user's normal Codex authentication;
- no usage-limit bypass or reset automation;
- unrelated Codex configuration survives setup and uninstall;
- hook observation failures fail open instead of blocking the user's Codex turn;
- unknown quota or measurement state is not converted into a confident number.

A report that breaks one of these boundaries is high priority even if immediate exploitability appears limited, because these are part of the product contract users should be able to rely on.

## Contribution security review

Community fixes are welcome, including complete patches. Before merge, maintainers independently review the change and may run secret scanning, dependency review, shell/process/network inspection, test-integrity checks, cross-platform CI, and clean package/install/uninstall validation.

Security-sensitive changes should include regression coverage for the vulnerable and corrected behavior when practical.

## Disclosure

Allow enough time for reproduction, a fix, regression validation, and a release before public disclosure. Contributor credit is preserved unless anonymity is requested.
