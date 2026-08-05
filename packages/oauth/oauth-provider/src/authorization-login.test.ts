import { describe, expect, test } from 'vitest'
import { resolveLoginRequired } from './authorization-login.js'

describe(resolveLoginRequired, () => {
  test('explicit prompt=login always requires fresh authentication', () => {
    for (const consentRequired of [true, false]) {
      for (const authenticationStale of [true, false]) {
        expect(
          resolveLoginRequired({
            promptLogin: true,
            consentRequired,
            authenticationStale,
          }),
        ).toBe(true)
      }
    }
  })

  test('new grant (consent required) + stale auth requires re-authentication', () => {
    expect(
      resolveLoginRequired({
        promptLogin: false,
        consentRequired: true,
        authenticationStale: true,
      }),
    ).toBe(true)
  })

  test('new grant (consent required) + fresh auth does not re-prompt', () => {
    expect(
      resolveLoginRequired({
        promptLogin: false,
        consentRequired: true,
        authenticationStale: false,
      }),
    ).toBe(false)
  })

  // The fix: an already-authorized client is not re-prompted just because the
  // authentication-freshness window lapsed.
  test('already-authorized client + stale auth does NOT re-prompt', () => {
    expect(
      resolveLoginRequired({
        promptLogin: false,
        consentRequired: false,
        authenticationStale: true,
      }),
    ).toBe(false)
  })

  test('already-authorized client + fresh auth does not re-prompt', () => {
    expect(
      resolveLoginRequired({
        promptLogin: false,
        consentRequired: false,
        authenticationStale: false,
      }),
    ).toBe(false)
  })
})
