import type { Session } from '@atproto/oauth-provider-api'

export enum InitialSelectedSession {
  First,
  Only,
}

export type InitialSelected = string | InitialSelectedSession | undefined

/**
 * Decide which account DID should be selected when the session provider first
 * mounts.
 *
 * A previously-remembered selection (`storedDid`, e.g. persisted across page
 * reloads) takes precedence, as long as it still refers to an available
 * session. Otherwise the caller's `initialSelected` preference is applied:
 *
 * - {@link InitialSelectedSession.First}: the first available session.
 * - {@link InitialSelectedSession.Only}: the single session, but ONLY when
 *   exactly one exists (with several accounts this yields `null`, i.e. the
 *   account picker — which is why a multi-account account manager needs
 *   `storedDid` to avoid dropping back to the picker on every reload).
 * - a DID string: that session, when available.
 */
export function resolveInitialSelection(
  initialSessions: readonly Pick<Session, 'account'>[],
  initialSelected: InitialSelected,
  storedDid?: string | null,
): string | null {
  if (
    storedDid != null &&
    initialSessions.some((s) => s.account.did === storedDid)
  ) {
    return storedDid
  }

  if (initialSelected === InitialSelectedSession.First) {
    return initialSessions[0]?.account.did ?? null
  }

  if (initialSelected === InitialSelectedSession.Only) {
    return initialSessions.length === 1 ? initialSessions[0].account.did : null
  }

  if (
    typeof initialSelected === 'string' &&
    initialSessions.some((s) => s.account.did === initialSelected)
  ) {
    return initialSelected
  }

  return null
}
