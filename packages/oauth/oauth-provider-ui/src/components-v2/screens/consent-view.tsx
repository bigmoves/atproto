import { msg } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import type { Account } from '@atproto/oauth-provider-api'
import type { OAuthClientMetadata } from '@atproto/oauth-types'
import type { PermissionSets } from '#/hydration-data.d.ts'
import { ConsentCard } from '../organisms/consent-card.tsx'
import { AuthCard } from '../templates/auth-card.tsx'

export type ConsentViewProps = {
  clientId: string
  clientMetadata: OAuthClientMetadata
  clientTrusted: boolean
  clientFirstParty: boolean
  permissionSets: PermissionSets

  account: Account
  scope?: string

  onConsent: (data: { scope?: string }) => void
  onReject: () => void
  onBack?: () => void
}

export function ConsentView(props: ConsentViewProps) {
  return (
    <AuthCard
      eyebrow={<Trans context="OAuthConsent">Authorize app</Trans>}
      tag={<Trans>OAuth / grant</Trans>}
      title={msg({ message: 'Authorize', context: 'OAuthConsent' })}
    >
      <ConsentCard {...props} />
    </AuthCard>
  )
}
