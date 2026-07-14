import { Trans, useLingui } from '@lingui/react/macro'
import { GlobeIcon } from '@phosphor-icons/react'
import type { ActiveOAuthSession } from '@atproto/oauth-provider-api'
import { DateAgo } from '#/components/utils/date-ago.tsx'
import { useOAuthClientIdentifier } from '#/hooks/use-oauth-client-identifier.ts'
import { useOauthClientName } from '#/hooks/use-oauth-client-name.ts'
import { Button } from '../atoms/button.tsx'

export type AccountAppsViewProps = {
  sessions: readonly ActiveOAuthSession[]
  revokingTokenId?: string
  onRevoke: (tokenId: string) => void
}

/** v2 restyle of `pages/account/(authenticated)/apps/page.tsx`. */
export function AccountAppsView({
  sessions,
  revokingTokenId,
  onRevoke,
}: AccountAppsViewProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-text-light text-sm">
        <Trans>
          It appears that you haven't used this account to sign in to any
          apps yet.
        </Trans>
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-light mb-2 text-sm leading-relaxed">
        <Trans>
          These apps have access to your account. An app may appear multiple
          times if you use it on different devices. Revoking access will log
          the app out until you sign in again.
        </Trans>
      </p>

      {sessions.map((session) => (
        <AppRow
          key={session.tokenId}
          session={session}
          revoking={revokingTokenId === session.tokenId}
          onRevoke={() => onRevoke(session.tokenId)}
        />
      ))}
    </div>
  )
}

function AppRow({
  session,
  revoking,
  onRevoke,
}: {
  session: ActiveOAuthSession
  revoking: boolean
  onRevoke: () => void
}) {
  const { i18n } = useLingui()
  const { clientId, clientMetadata, createdAt, updatedAt } = session

  const friendlyClientId = useOAuthClientIdentifier({ clientId })
  const clientName = useOauthClientName({ clientId, clientMetadata })

  return (
    <div className="bg-contrast-0 border-contrast-100 flex items-center gap-4 rounded-panel border p-4">
      <div className="bg-contrast-50 text-text-light flex size-9 flex-none items-center justify-center rounded-full">
        <GlobeIcon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-text-default truncate text-sm font-semibold">
          {clientName}
        </p>
        <p className="text-text-light font-mono text-xs">{friendlyClientId}</p>
        <p className="text-text-light truncate text-xs">
          <Trans context="OAuthApp">
            Authorized{' '}
            {i18n.date(createdAt, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Trans>
          {' · '}
          <Trans context="OAuthApp">
            Last accessed <DateAgo date={updatedAt} />
          </Trans>
        </p>
      </div>
      <Button
        size="sm"
        color="error"
        transparent
        loading={revoking}
        onClick={onRevoke}
      >
        <Trans context="OAuthApp">Revoke</Trans>
      </Button>
    </div>
  )
}
