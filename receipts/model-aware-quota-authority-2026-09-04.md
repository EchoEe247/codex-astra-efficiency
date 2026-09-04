# Model-Aware Quota Authority Receipt — 2026-09-04

Status: **PASS — conservative multi-bucket allowance selection implemented**

## Why this was needed

Current Codex app-server rate-limit responses can expose both:

- a default `rateLimits` snapshot; and
- `rateLimitsByLimitId`, a multi-bucket view keyed by metered limit id.

A bucket can also expose `normalModelSlug`, described by upstream Codex as the normal model whose display name and reasoning options describe that quota alias.

CAE is Astra-specific, so blindly calculating every receipt from the default bucket could become incorrect if Astra receives a dedicated meter or quota alias.

## Implemented selection rules

`src/rate-limits.js` now selects usage authority for an exact native model id as follows:

1. Prefer exactly one bucket whose `normalModelSlug` exactly matches the active model id.
2. If multiple exact buckets match, return `ambiguous`; do not choose by name or position.
3. If no exact model bucket exists and the default snapshot has no model slug, use it only as a labeled `shared_default` authority.
4. If the default snapshot explicitly names another model, do not use it for Astra.
5. Do not infer Astra ownership from `limitName`, bucket-key text, percentage values, or transport slot.
6. Start/end receipt snapshots must use the same authority kind and key. A backend shape change becomes `authority_changed` instead of a fabricated delta.

## Receipt behavior

`src/receipts.js` now uses model-aware allowance deltas rather than unconditional default-bucket deltas.

A completed receipt includes an authority block such as:

```json
{
  "authority": {
    "status": "stable",
    "kind": "shared_default",
    "key": "default",
    "limitId": "codex",
    "normalModelSlug": null
  }
}
```

or, when a dedicated model bucket is exposed:

```json
{
  "authority": {
    "status": "stable",
    "kind": "model_bucket",
    "key": "astra_meter",
    "limitId": "astra_meter",
    "normalModelSlug": "gpt-6-astra"
  }
}
```

The exact public production slug remains subject to native Astra launch validation. The example above is fixture data, not a claim about the final backend bucket id.

## Shared-default caveat

A shared-default allowance delta can include activity from other simultaneous Codex work on the same account.

Therefore the controlled Plus baseline should avoid concurrent Codex work while establishing Astra cost curves when CAE reports `shared_default` authority. CAE records the authority type rather than pretending the shared meter is Astra-exclusive.

## Tests

Coverage now proves:

- shared default is selected when no exact model bucket exists;
- an exact `normalModelSlug` bucket is preferred over shared default;
- measured deltas come from the exact model bucket rather than a more expensive-looking shared bucket;
- multiple exact model buckets are reported as ambiguous;
- a default snapshot explicitly assigned to another model is rejected;
- receipts preserve the selected authority alongside 5-hour and weekly deltas.

## Validation

GitHub Actions run #73 completed successfully after the model-aware rate-limit and receipt tests were committed.

Validated matrix:

- Ubuntu / Node 20;
- Ubuntu / Node 22;
- Windows / Node 22.

## Remaining runtime gate

This proves source/unit behavior only.

The actual Plus runtime must still establish which authority shape OpenAI exposes for Astra:

- shared default only;
- dedicated `rateLimitsByLimitId` bucket with a matching native model slug;
- another shape not yet represented in fixtures.

Any new shape must be added as a fixture before CAE relies on it.
