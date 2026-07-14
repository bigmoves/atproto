import { Trans } from '@lingui/react/macro'
import { Link } from '@tanstack/react-router'
import type { Account } from '@atproto/oauth-provider-api'
import { CustomizationName } from '#/components/customization-name.tsx'
import { AccountIdentifier } from '#/components/utils/account-identifier.tsx'
import { AvatarBadge } from '../atoms/avatar-badge.tsx'

export type AccountHomeViewProps = {
  account: Account
}

/** v2 restyle of `pages/account/(authenticated)/page.tsx`. */
export function AccountHomeView({ account }: AccountHomeViewProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <AvatarBadge account={account} size="lg" />
      {account.name && (
        <div className="text-text-default text-xl font-bold">{account.name}</div>
      )}
      <AccountIdentifier account={account} className="text-text-light" />

      <p className="text-text-light mt-2 max-w-sm text-sm leading-relaxed">
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
