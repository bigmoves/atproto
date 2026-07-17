import { Trans, useLingui } from '@lingui/react/macro'
import { CaretRightIcon } from '@phosphor-icons/react'
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
      <div className="border-surface-border divide-surface-border rounded-panel flex flex-col divide-y overflow-hidden border">
        {sessions.map((session) => (
          <AccountRow
            key={session.account.did}
            account={session.account}
            append={
              <CaretRightIcon aria-hidden className="text-ink-light size-4" />
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
            className="hover:bg-surface-2 flex w-full items-center gap-4 px-2.5 py-3 text-left"
          >
            <span
              aria-hidden
              className="border-surface-border text-ink-light rounded-control flex size-9 flex-none items-center justify-center border border-dashed font-mono text-lg"
            >
              +
            </span>
            <span className="text-ink flex-1 font-serif text-base font-semibold">
              <Trans>Use another account</Trans>
            </span>
            <CaretRightIcon aria-hidden className="text-ink-light size-4" />
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
