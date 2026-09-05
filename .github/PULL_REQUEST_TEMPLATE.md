## Problem

What concrete problem does this PR solve?

## Change

What changed, and why is this the smallest correct fix?

## Validation

- [ ] `npm test`
- [ ] `npm run check`
- [ ] `git diff --check`
- [ ] Focused regression/reproduction included when practical

## CAE invariants

- [ ] Native Codex workflow remains intact
- [ ] Native `/model` selection remains intact
- [ ] Non-Astra behavior remains a strict no-op
- [ ] Missing/ambiguous quota data remains unknown rather than guessed
- [ ] No raw prompts/responses/source/cwd/account identity/raw session ids are persisted or uploaded
- [ ] Setup/uninstall preserves unrelated Codex configuration
- [ ] No usage-limit reset/circumvention behavior was introduced

## Security-sensitive surfaces

Check every surface touched by this PR:

- [ ] None
- [ ] Dependencies / lockfile
- [ ] Shell / process execution
- [ ] GitHub Actions / release automation
- [ ] Hook installation / uninstall
- [ ] File deletion / cleanup
- [ ] Local state / receipts
- [ ] Quota / token parsing
- [ ] Network behavior

If any security-sensitive surface is checked, explain the threat/safety review performed.

## Privacy

Confirm the PR, fixtures, and logs contain no real credentials, private prompts/transcripts, proprietary source, or raw account/session identifiers.