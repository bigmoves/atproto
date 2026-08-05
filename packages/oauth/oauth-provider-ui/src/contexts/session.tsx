import { msg } from '@lingui/core/macro'
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import type { Account, Session } from '@atproto/oauth-provider-api'
import { Api, UnauthorizedError, UnknownRequestUriError } from '#/lib/api.ts'
import { upsert } from '#/lib/util.ts'
import { useCurrentLocale } from '#/locales/locale-provider.jsx'
import { useNotificationsContext } from './notifications.js'
import {
  type InitialSelected,
  InitialSelectedSession,
  resolveInitialSelection,
} from './session-selection.ts'

export type { Session }
export { InitialSelectedSession }

const SELECTED_ACCOUNT_STORAGE_KEY =
  '@@atproto-oauth-provider/account-manager/selected-did'

function readStoredDid(): string | null {
  try {
    return (
      globalThis.localStorage?.getItem(SELECTED_ACCOUNT_STORAGE_KEY) ?? null
    )
  } catch {
    // Storage may be unavailable (private mode, disabled cookies, etc.)
    return null
  }
}

function writeStoredDid(did: string | null): void {
  try {
    if (did == null) {
      globalThis.localStorage?.removeItem(SELECTED_ACCOUNT_STORAGE_KEY)
    } else {
      globalThis.localStorage?.setItem(SELECTED_ACCOUNT_STORAGE_KEY, did)
    }
  } catch {
    // Ignore: persisting the selection is a convenience, not a requirement.
  }
}

export type SessionWithToken = Session & {
  ephemeralToken?: string
}

export type SessionContextType = {
  sessions: readonly Session[]
  session: Session | null
  setSession: (session: Pick<Session, 'account'> | null) => void

  api: Api
}

const SessionContext = createContext<null | SessionContextType>(null)
SessionContext.displayName = 'SessionContext'

export type SessionProviderProps = {
  children: ReactNode
  initialSessions: readonly Session[]
  initialSelected?: InitialSelected
  /**
   * Persist the selected account across page reloads (in `localStorage`) and
   * restore it on mount. Without this, a device with several remembered
   * accounts falls back to `initialSelected` on every reload — which, for
   * {@link InitialSelectedSession.Only}, means the account picker instead of
   * the account the user was last using.
   */
  rememberSelection?: boolean
}

export function SessionProvider({
  children,
  initialSessions,
  initialSelected,
  rememberSelection = false,
}: SessionProviderProps) {
  const locale = useCurrentLocale()
  const { showBoundary } = useErrorBoundary<UnknownRequestUriError>()
  const { notifyError } = useNotificationsContext()
  const [current, setCurrent] = useState(() =>
    resolveInitialSelection(
      initialSessions,
      initialSelected,
      rememberSelection ? readStoredDid() : null,
    ),
  )
  const [sessions, setSessions] =
    useState<readonly SessionWithToken[]>(initialSessions)

  useEffect(() => {
    if (rememberSelection) writeStoredDid(current)
  }, [rememberSelection, current])

  const session = useMemo(() => {
    return current
      ? (sessions.find((s) => s.account.did === current) ?? null)
      : null
  }, [sessions, current])

  const setSession = useCallback(
    (session: { account: Account } | null) => {
      setCurrent(
        session && sessions.some((s) => s.account.did === session.account.did)
          ? session.account.did
          : null,
      )
    },
    [sessions, setCurrent],
  )

  const upsertSession = useCallback(
    ({
      account,
      ephemeralToken,
      // When a new session is inserted, it is assumed that the user just
      // created the session, and therefore, login is not required.
      loginRequired = false,
    }: { account: Account } & Partial<SessionWithToken>) => {
      setSessions((sessions) => {
        return upsert(
          sessions,
          {
            account,
            ephemeralToken,
            loginRequired,
          },
          (s) => s.account.did === account.did,
        )
      })
      setCurrent(account.did)
    },
    [setCurrent, setSessions],
  )

  const upsertAccount = useCallback(
    (account: Account) => {
      setSessions((sessions) =>
        sessions.map((s) =>
          s.account.did === account.did ? { ...s, account } : s,
        ),
      )
    },
    [setSessions],
  )

  const removeSession = useCallback(
    (did: string | string[]) => {
      if (Array.isArray(did)) {
        setSessions((sessions) =>
          sessions.filter((s) => !did.includes(s.account.did)),
        )
        setCurrent((current) =>
          current != null && did.includes(current) ? null : current,
        )
      } else {
        setSessions((sessions) => sessions.filter((s) => s.account.did !== did))
        setCurrent((current) => (current === did ? null : current))
      }
    },
    [setSessions, setCurrent],
  )

  const api = useMemo(() => {
    return new Api({
      locale,
      onFetchError(err) {
        if (err instanceof UnknownRequestUriError) showBoundary(err)
        if (err instanceof UnauthorizedError) {
          if (session) removeSession(session.account.did)

          notifyError(err, {
            title: msg`Unauthorized`,
            description: msg`Your session has expired. Please sign in again.`,
          })
        }
        throw err
      },
      onFetchSuccess: {
        // Session updates
        '/sign-in': ({ output }) => upsertSession(output),
        '/sign-up': ({ output }) => upsertSession(output),
        '/sign-out': ({ input }) => removeSession(input.did),
        '/delete-account-confirm': ({ input }) => removeSession(input.did),

        // Account updates
        '/update-handle': ({ output }) => upsertAccount(output.account),
        '/update-email-confirm': ({ output }) => upsertAccount(output.account),
        '/verify-email-confirm': ({ output }) => upsertAccount(output.account),
        '/deactivate-account': ({ output }) => upsertAccount(output.account),
        '/reactivate-account': ({ output }) => upsertAccount(output.account),
      },
      headers: session?.ephemeralToken
        ? () => ({ Authorization: `Bearer ${session.ephemeralToken}` })
        : undefined,
    })
  }, [
    locale,
    session,
    showBoundary,
    upsertAccount,
    upsertSession,
    removeSession,
    notifyError,
  ])

  const value = useMemo(
    (): SessionContextType => ({ api, sessions, session, setSession }),
    [api, sessions, session, setSession],
  )

  return <SessionContext value={value}>{children}</SessionContext>
}

export function useSessionContext() {
  const value = useContext(SessionContext)
  if (value) return value
  throw new Error('useSessionContext must be used within a SessionProvider')
}

export function useApi() {
  const { api } = useSessionContext()
  return api
}
