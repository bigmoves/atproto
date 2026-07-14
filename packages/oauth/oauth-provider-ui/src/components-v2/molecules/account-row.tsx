import type { JSX, ReactNode } from 'react'
import type { Account } from '@atproto/oauth-provider-api'
import { AccountIdentifier } from '#/components/utils/account-identifier.tsx'
import { AccountName } from '#/components/utils/account-name.tsx'
import type { Override } from '#/lib/util.ts'
import { AvatarBadge } from '../atoms/avatar-badge.tsx'

export type AccountRowProps = Override<
  JSX.IntrinsicElements['button'],
  {
    account: Account
    append?: ReactNode
  }
>

/** Picker/list row: avatar + name + identifier. Used by the sign-in picker. */
export function AccountRow({
  account,
  append,

  // button
  className,
  ...props
}: AccountRowProps) {
  return (
    <button
      type="button"
      {...props}
      className="border-contrast-50 hover:bg-contrast-25 flex w-full items-center gap-4 rounded-panel border-b px-2.5 py-3 text-left last:border-b-0"
    >
      <AvatarBadge account={account} size="sm" />
      <div className="min-w-0 flex-1">
        {account.name && (
          <AccountName
            account={account}
            className="text-text-default block truncate text-sm font-semibold"
          />
        )}
        <AccountIdentifier
          account={account}
          className="text-text-light block truncate text-xs"
        />
      </div>
      {append}
    </button>
  )
}
