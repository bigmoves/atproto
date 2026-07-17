import { Trans } from '@lingui/react/macro'
import { Link } from '@tanstack/react-router'
import { clsx } from 'clsx'
import type { Account } from '@atproto/oauth-provider-api'
import { CustomizationName } from '#/components/customization-name.tsx'
import { AccountIdentifier } from '#/components/utils/account-identifier.tsx'
import { AvatarBadge } from '../atoms/avatar-badge.tsx'
import { EyebrowLabel } from '../atoms/eyebrow-label.tsx'

export type AccountHomeViewProps = {
  account: Account
}

/** v2 restyle of `pages/account/(authenticated)/page.tsx`. */
export function AccountHomeView({ account }: AccountHomeViewProps) {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="bg-surface-1 border-surface-border rounded-card flex items-center gap-4 border p-6">
        <AvatarBadge account={account} size="lg" />
        <div className="min-w-0 flex-1">
          {account.name && (
            <div className="text-ink truncate font-serif text-xl font-semibold">
              {account.name}
            </div>
          )}
          <AccountIdentifier account={account} className="text-ink-light" />
        </div>
      </div>

      <div className="border-surface-border divide-surface-border rounded-panel grid grid-cols-2 divide-x border">
        <div className="p-4">
          <EyebrowLabel dash={false}>
            <Trans>Host</Trans>
          </EyebrowLabel>
          <div className="text-ink mt-1.5 truncate text-sm font-semibold">
            <CustomizationName />
          </div>
        </div>
        <div className="p-4">
          <EyebrowLabel dash={false}>
            <Trans>Status</Trans>
          </EyebrowLabel>
          <div
            className={clsx(
              'mt-1.5 flex items-center gap-1.5 text-sm font-semibold',
              account.deactivated ? 'text-ink-light' : 'text-success',
            )}
          >
            <span
              className={clsx(
                'size-1.5 flex-none rounded-full',
                account.deactivated ? 'bg-ink-light' : 'bg-success',
              )}
            />
            {account.deactivated ? (
              <Trans>Inactive</Trans>
            ) : (
              <Trans>Active</Trans>
            )}
          </div>
        </div>
      </div>

      <p className="text-ink-light text-sm leading-relaxed">
        <Trans>
          Your Atmosphere account is hosted by <CustomizationName />.
        </Trans>{' '}
        <Link to="/account/about" className="text-primary hover:underline">
          <Trans>What does this mean?</Trans>
        </Link>
      </p>
    </div>
  )
}
