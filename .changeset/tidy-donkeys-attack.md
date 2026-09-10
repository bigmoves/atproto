---
'@atproto/oauth-provider-ui': patch
---

Fix the account manager dropping to the "Sign in as…" account picker on every
reload when several accounts are remembered on the device. The last-used account
is now persisted and restored, so multi-account users land back on their
dashboard instead of appearing signed out.
