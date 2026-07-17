import { Trans, useLingui } from '@lingui/react/macro'
import { GlobeIcon } from '@phosphor-icons/react'
import type { ActiveOAuthSession } from '@atproto/oauth-provider-api'
import { DateAgo } from '#/components/utils/date-ago.tsx'
import { useOAuthClientIdentifier } from '#/hooks/use-oauth-client-identifier.ts'
import { useOauthClientName } from '#/hooks/use-oauth-client-name.ts'
import { Button } from '../atoms/button.tsx'
import { PageHeader } from '../molecules/page-header.tsx'

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
  return (
    <div>
      <PageHeader back>
        <Trans>Apps</Trans>
      </PageHeader>

      {sessions.length === 0 ? (
        <p className="text-ink-light text-sm">
          <Trans>
            It appears that you haven't used this account to sign in to any apps
            yet.
          </Trans>
        </p>
      ) : (
        <>
          <p className="text-ink-light mb-4 text-sm leading-relaxed">
            <Trans>
              These apps have access to your account. An app may appear multiple
              times if you use it on different devices. Revoking access will log
              the app out until you sign in again.
            </Trans>
          </p>

          <div className="bg-surface-1 border-surface-border divide-surface-border rounded-panel flex flex-col divide-y overflow-hidden border">
            {sessions.map((session) => (
              <AppRow
                key={session.tokenId}
                session={session}
                revoking={revokingTokenId === session.tokenId}
                onRevoke={() => onRevoke(session.tokenId)}
              />
            ))}
          </div>
        </>
      )}
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
    <div className="flex items-center gap-4 p-4">
      <div className="bg-surface-2 text-ink-light rounded-control flex size-9 flex-none items-center justify-center">
        <GlobeIcon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-ink truncate text-sm font-semibold">{clientName}</p>
        <p className="text-ink-light font-mono text-xs">{friendlyClientId}</p>
        <p className="text-ink-light truncate text-xs">
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
