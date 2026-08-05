/**
 * Decide whether an authorization request must re-authenticate the user (i.e.
 * re-enter their password) before it can proceed.
 *
 * Fresh authentication is required when:
 * - the client explicitly asked for it (`promptLogin`, i.e. `prompt=login`); or
 * - the request is a *new* authorization — a first-time consent or newly
 *   requested scopes (`consentRequired`) — and the existing authentication is
 *   stale (`authenticationStale`, i.e. older than `authenticationMaxAge`).
 *
 * Routine re-authorization of a client the user has *already* granted does NOT
 * re-prompt on staleness alone: an active, remembered device session is
 * sufficient. Such a client can already obtain fresh access tokens through the
 * refresh-token grant without re-authenticating, so forcing a password on the
 * authorization endpoint adds friction without a meaningful security gain.
 *
 * This keeps the authentication-freshness window meaningful where it matters —
 * new grants, scope escalation, explicit `prompt=login`, and account-management
 * step-up — without logging active users out of apps every
 * `authenticationMaxAge` (7 days by default).
 */
export function resolveLoginRequired(input: {
  promptLogin: boolean
  consentRequired: boolean
  authenticationStale: boolean
}): boolean {
  const { promptLogin, consentRequired, authenticationStale } = input
  if (promptLogin) return true
  return consentRequired && authenticationStale
}
