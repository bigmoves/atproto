---
'@atproto/oauth-provider': patch
---

Stop forcing re-authentication (password re-entry) on routine OAuth
authorizations. The authentication-freshness window (`authenticationMaxAge`,
7 days by default) previously required the user to re-enter their password once
it lapsed, even when re-authorizing a client they had already granted — logging
active users out of apps roughly weekly.

Fresh authentication is now required only for genuinely new authorizations
(first-time consent or newly requested scopes), an explicit `prompt=login`, and
account-management step-up — not for re-authorizing an already-granted client on
an active, remembered device. Such a client can already obtain fresh tokens via
the refresh grant, so this narrows the prompt to where it adds security value
without weakening the freshness guarantee for new grants. The window itself is
unchanged.
