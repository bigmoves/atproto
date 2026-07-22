# OAuth authorization page: restore flow step on refresh

Date: 2026-07-22
Status: approved
Package: `@atproto/oauth-provider-ui` (only)

## Problem

The authorization flow (`/oauth/authorize`) renders every step — welcome,
sign-in, sign-up, reset-password, consent — from ephemeral React state. The
URL only identifies the authorization request (`client_id` + `request_uri`),
never the step. Refreshing the page resets the user to the initial view:
someone on the reset-password "enter code" screen (code already emailed) is
dumped back to sign-in with no obvious way forward.

The page deliberately avoids a router (`authorization-page.tsx`): view
changes must not create browser-history entries. That constraint is kept.

## Goal

Refresh restores the current step. Browser back/forward behavior is
unchanged (back still exits the flow). No backend changes.

### Steps restored

- Top-level views: `welcome`, `sign-in`, `sign-up`, `reset-password`.
- Reset-password sub-step: `reset-password-confirm` (the "enter code" form).
- Consent: written to the URL as `consent` for honesty, but restoration is
  derived state — a session surviving in cookies already brings the consent
  view back. Reading `consent` from the URL requires no handling.

### Steps not restored

- Sign-up wizard sub-steps: later steps are useless without earlier steps'
  form values (final submit needs handle + credentials together), so
  restoring `sign-up` lands on wizard step 1.
- Reset-password `PasswordUpdated` success screen: transient; maps back to
  the request step.
- Form input values: never persisted (out of scope).

## Design

Encode the step in the URL **hash fragment**, updated via
`history.replaceState`:

```
/oauth/authorize?client_id=…&request_uri=…#step=reset-password-confirm
```

Why the hash (vs. a query param or sessionStorage):

- Never sent to the server: no schema changes, no server-log leakage, no
  interaction with the iOS cookie redirect-test (which round-trips
  `searchParams` through a form GET submit).
- `replaceState` creates no history entries, honoring the no-router rule.
- The user asked for the step to be reflected in a real URL, which rules
  out sessionStorage.

### Components

1. **`src/lib/location-step.ts` (new)** — `readStep(): string | undefined`
   and `syncStep(step: string): void`. `syncStep` rewrites only the
   fragment, preserving pathname, search, and `history.state`. No router
   dependency.

2. **`contexts/authentication.tsx`** — the impure layer, so hash access is
   architecturally allowed here:
   - Seed the `view` `useState` initializer from a valid hash step.
     Precedence: valid hash > `promptMode === 'create'` default (a hash
     means the user was already navigating).
   - Sync the hash on every `view` change. `View.Authenticated` maps to
     slug `consent`.
   - Invalid/unknown hash values are ignored (fall back to today's
     behavior). The existing fool-proofing effect already corrects
     impossible states (e.g. hash says `sign-up` but sign-up is disabled),
     so bad hashes self-heal.

3. **`components/reset-password-view.tsx`** — stays a pure component per
   the package layering rules. Add optional `initialView?: 'request' |
   'confirm'` and `onViewChange?: (view: 'request' | 'confirm') => void`
   props; `AuthenticationProvider` wires them to the hash. The email hint
   is deliberately **not** encoded in the URL (privacy); the confirm form
   already renders without it (the existing "Already have a code?" path).

4. **`authorization-page.tsx` shim fix** — the existing `replaceState`
   shim rebuilds the URL as `pathname + search`, which would drop a hash;
   append `url.hash`.

### Step slugs

| Slug | View |
| --- | --- |
| `welcome` | `View.Welcome` |
| `sign-in` | `View.SignIn` |
| `sign-up` | `View.SignUp` (wizard step 1) |
| `reset-password` | `View.ResetPassword`, request sub-step |
| `reset-password-confirm` | `View.ResetPassword`, confirm sub-step |
| `consent` | `View.Authenticated` (write-only; restore is derived) |

## Error handling

Unknown or garbled hash → ignored; initial view computed exactly as today.
No new error states, no new user-facing messages.

## Testing

- Unit coverage for the hash helper (parse/format/validate; pure functions,
  no DOM needed). The seed/precedence logic lives in a React state
  initializer — unit-testing it would require adding jsdom, so it is
  covered by the e2e test instead.
- E2E: extend the existing puppeteer OAuth flow test
  (`packages/pds/tests/oauth.test.ts`) — refresh mid reset-password and
  assert the confirm form comes back.
