# Public Survey Tokens

SentiQ public survey links use long random tokens for QR and device capture flows.

## Storage rule

Never store the plaintext token in the database.

`survey_links` stores only:

- `token_hash` — SHA-256 hash of the token.
- `token_last4` — last four characters for safe identification in the UI.

The plaintext token may only be shown once, immediately after creating or regenerating it.

## Token format

Tokens are generated from 32 random bytes and encoded as base64url without padding. This produces an opaque token of about 43 characters.

## Hashing

Edge Functions must normalize the received token, hash it with SHA-256, and look up `survey_links.token_hash`.

The shared helper lives at:

```text
supabase/functions/_shared/public-token.ts
```

It provides:

- `generatePublicToken()`
- `hashPublicToken(token)`
- `getPublicTokenLast4(token)`
- `createPublicTokenSecret()`
- `normalizePublicToken(token)`

## Validation flow

1. Receive token from `/s/:token` or `/d/:token`.
2. Normalize token.
3. Hash token.
4. Find `survey_links.token_hash`.
5. Verify the link status is `active`.
6. Verify restaurant and branch are active.
7. If `type = device`, verify the related device is active.
8. Return a controlled error when invalid.

## Regeneration flow

1. Generate a new plaintext token.
2. Hash the new token.
3. Store the new `token_hash`.
4. Store the new `token_last4`.
5. Update `regenerated_at`.
6. Show the plaintext token once to the authorized user.

The previous token becomes invalid because its hash no longer exists.

## Scope boundaries

This document and helper do not implement Edge Functions directly.

The actual create/regenerate/validate flows are implemented in later tickets:

- `regenerate_qr_token`
- `regenerate_device_token`
- `get_public_survey_config`
- `submit_feedback`

## Database protections already expected

- `survey_links.token_hash` is unique.
- `survey_links.type` is constrained to `qr` or `device`.
- `survey_links.status` is constrained to `active`, `inactive`, or `revoked`.
- QR and device links share `survey_links`.
- A QR link must not have `device_id`.
- A device link must have `device_id`.
