import { describe, expect, test } from 'vitest'
import type { Session } from '@atproto/oauth-provider-api'
import {
  InitialSelectedSession,
  resolveInitialSelection,
} from './session-selection.ts'

const session = (did: string): Pick<Session, 'account'> =>
  ({ account: { did } }) as Pick<Session, 'account'>

const grain = session('did:plc:grain')
const bigmoves = session('did:plc:bigmoves')

describe(resolveInitialSelection, () => {
  test('Only: selects the single remembered account', () => {
    expect(resolveInitialSelection([grain], InitialSelectedSession.Only)).toBe(
      'did:plc:grain',
    )
  })

  // The bug: multiple accounts + Only + nothing remembered => account picker.
  test('Only: with multiple accounts and no stored selection, drops to the picker', () => {
    expect(
      resolveInitialSelection([grain, bigmoves], InitialSelectedSession.Only),
    ).toBeNull()
  })

  // The fix: a remembered selection avoids the picker on reload.
  test('Only: with multiple accounts, restores the stored selection', () => {
    expect(
      resolveInitialSelection(
        [grain, bigmoves],
        InitialSelectedSession.Only,
        'did:plc:grain',
      ),
    ).toBe('did:plc:grain')
  })

  test('a stored selection wins over the fallback preference', () => {
    expect(
      resolveInitialSelection(
        [grain, bigmoves],
        InitialSelectedSession.First,
        'did:plc:bigmoves',
      ),
    ).toBe('did:plc:bigmoves')
  })

  test('a stale stored selection (no longer remembered) is ignored', () => {
    expect(
      resolveInitialSelection(
        [grain, bigmoves],
        InitialSelectedSession.Only,
        'did:plc:removed',
      ),
    ).toBeNull()
  })

  test('First: selects the first account', () => {
    expect(
      resolveInitialSelection([grain, bigmoves], InitialSelectedSession.First),
    ).toBe('did:plc:grain')
  })

  test('First: with no accounts, selects nothing', () => {
    expect(resolveInitialSelection([], InitialSelectedSession.First)).toBeNull()
  })

  test('explicit DID: selects it when available, else nothing', () => {
    expect(resolveInitialSelection([grain, bigmoves], 'did:plc:bigmoves')).toBe(
      'did:plc:bigmoves',
    )
    expect(
      resolveInitialSelection([grain, bigmoves], 'did:plc:absent'),
    ).toBeNull()
  })
})
