import { useCallback, useEffect, useState } from 'react'

/**
 * Dev-only screen preview: which mocked screen (if any) is currently shown
 * as a full-screen overlay by `DevScreenGallery`. Entirely client-side —
 * doesn't touch routing, auth state, or the server.
 */
export type DevScreenId =
  | 'welcome'
  | 'sign-in'
  | 'sign-up'
  | 'consent'
  | 'redirecting'
  | 'error'
  | 'cookie-error'
  | 'components'

export const DEV_SCREENS: ReadonlyArray<{ id: DevScreenId; label: string }> = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'sign-in', label: 'Sign in' },
  { id: 'sign-up', label: 'Sign up' },
  { id: 'consent', label: 'Consent' },
  { id: 'redirecting', label: 'Redirecting' },
  { id: 'error', label: 'Error' },
  { id: 'cookie-error', label: 'Cookie error' },
  { id: 'components', label: 'Components' },
]

const STORAGE_KEY = 'atproto:oauth-provider-ui:dev-preview-screen'
const listeners = new Set<() => void>()

const VALID_IDS: ReadonlySet<string> = new Set([
  'welcome',
  'sign-in',
  'sign-up',
  'consent',
  'redirecting',
  'error',
  'cookie-error',
  'components',
])

function load(): DevScreenId | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw && VALID_IDS.has(raw) ? (raw as DevScreenId) : null
  } catch {
    return null
  }
}

let current = load()

function set(id: DevScreenId | null) {
  current = id
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // e.g. private-browsing storage quota — override just won't persist
  }
  for (const listener of listeners) listener()
}

export function useDevPreviewScreen(): [
  DevScreenId | null,
  (id: DevScreenId | null) => void,
] {
  const [, forceRender] = useState(0)

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const setScreen = useCallback((id: DevScreenId | null) => set(id), [])

  return [current, setScreen]
}
