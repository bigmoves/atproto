import { Trans, useLingui } from '@lingui/react/macro'
import { AtIcon, CaretRightIcon } from '@phosphor-icons/react'
import type { JSX, ReactNode } from 'react'
import type { Session } from '@atproto/oauth-provider-api'
import { stringifyHandle } from '#/components/utils/handle.tsx'
import type { Override } from '#/lib/util.ts'
import { Button } from '../atoms/button.tsx'
import { AccountRow } from '../molecules/account-row.tsx'

export type SignInPickerProps = Override<
  JSX.IntrinsicElements['div'],
  {
    sessions: readonly Session[]
    onSession: (session: Session) => void
    onOther?: () => void
    onBack?: () => void
    onSignUp?: () => void
    backLabel?: ReactNode
  }
>

export function SignInPicker({
  sessions,
  onSession,
  onOther,
  onBack,
  onSignUp,
  backLabel,

  // div
  ...props
}: SignInPickerProps) {
  const { t } = useLingui()

  return (
    <div {...props} className="flex flex-col">
      <div className="flex flex-col">
        {sessions.map((session) => (
          <AccountRow
            key={session.account.did}
            account={session.account}
            append={
              <CaretRightIcon aria-hidden className="text-text-light size-4" />
            }
            onClick={() => onSession(session)}
            aria-label={t`Sign in as ${session.account.name ?? stringifyHandle(session.account.handle) ?? session.account.did}`}
          />
        ))}

        {onOther && (
          <button
            type="button"
            onClick={onOther}
            aria-label={t`Login to account that is not listed`}
            className="border-contrast-50 hover:bg-contrast-25 flex w-full items-center gap-4 rounded-panel border-b px-2.5 py-3 text-left last:border-b-0"
          >
            <span className="border-contrast-300 text-text-light flex size-9 flex-none items-center justify-center rounded-full border">
              <AtIcon aria-hidden weight="bold" className="size-4" />
            </span>
            <span className="text-text-default flex-1 text-sm font-semibold">
              <Trans>Use another account</Trans>
            </span>
            <CaretRightIcon aria-hidden className="text-text-light size-4" />
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-row-reverse flex-wrap items-center justify-start gap-6">
        {onSignUp && (
          <Button transparent color="primary" onClick={onSignUp}>
            <Trans>Create an account</Trans>
          </Button>
        )}
        <div className="flex-auto" />
        {onBack && (
          <Button transparent onClick={onBack}>
            {backLabel || <Trans>Back</Trans>}
          </Button>
        )}
      </div>
    </div>
  )
}
