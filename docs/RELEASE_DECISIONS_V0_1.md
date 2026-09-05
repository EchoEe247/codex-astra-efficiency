# v0.1.0 release decisions

Owner-approved release settings for the first public CAE release:

- Version: `0.1.0`
- License: MIT
- Distribution: GitHub Release plus npm registry publication using the same validated package contents/provenance
- Repository visibility: remain private through final release gates; make public immediately before/with `v0.1.0`
- Release claim boundary: observability-first; no unsupported fixed Astra savings/efficiency claim
- Native per-turn token accounting: deferred unless it can be added without expanding or destabilizing the v0.1 runtime surface
- Native Termux Codex: not part of the declared v0.1 support surface; codexu/Ubuntu-under-Termux is the validated Android path

These decisions authorize metadata preparation but do not authorize publication before the final candidate, live release-candidate validation, security/package gates, tag, and release receipt are complete.
