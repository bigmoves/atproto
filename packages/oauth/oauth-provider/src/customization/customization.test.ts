import { describe, expect, it } from 'vitest'
import { customizationSchema } from './customization.js'

describe('customizationSchema', () => {
  describe('availableUserDomains', () => {
    // The front end treats each available user domain as a suffix that is
    // concatenated onto the username segment (`${segment}${domain}`) and matched
    // with `handle.endsWith(domain)`. For this to produce a valid handle, every
    // domain MUST include a leading period (e.g. `.social.example`, not
    // `social.example`). See:
    //   packages/oauth/oauth-provider-ui/src/components/forms/input-handle-default.tsx
    //   packages/oauth/oauth-provider-ui/src/lib/handle.ts (isValidDomain)
    //
    // https://github.com/bluesky-social/atproto/issues/4205

    it('accepts domains with a leading period', () => {
      const result = customizationSchema.safeParse({
        availableUserDomains: ['.social.example'],
      })
      expect(result.success).toBe(true)
    })

    it('rejects domains without a leading period', () => {
      const result = customizationSchema.safeParse({
        availableUserDomains: ['social.example'],
      })
      expect(result.success).toBe(false)
    })
  })
})
