import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { WarningIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { apiErrorParser } from '#/lib/api-error-parser.ts'
import { type ErrorParser, parseError } from '#/lib/error-parser.ts'
import { Button } from '../atoms/button.tsx'

export type ErrorViewProps = {
  error: unknown
  parser?: ErrorParser
  retry?: () => void
  retryLabel?: ReactNode
  children?: ReactNode
}

/**
 * v2 restyle of `#/components/error-view.tsx`. Standalone light card (not
 * `AuthCard` — no two-column split needed here), matches system light/dark.
 */
export function ErrorView({
  error,
  parser = apiErrorParser,
  retry,
  retryLabel,
  children,
}: ErrorViewProps) {
  const { _ } = useLingui()
  const parsed = parser(error) ?? parseError(error)

  return (
    <div className="bg-contrast-0 flex min-h-dvh w-full items-center justify-center px-5">
      <div className="bg-contrast-100 border-contrast-200 shadow-card rounded-card w-full max-w-md border p-10 text-center">
        <div className="bg-error-100 text-error-500 mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
          <WarningIcon weight="bold" className="size-6" />
        </div>
        <h1 className="text-text-default mb-2 text-lg font-bold">
          <Trans>Something went wrong</Trans>
        </h1>
        <p className="text-text-light mb-6 text-sm leading-relaxed">
          {parsed.description ? _(parsed.description) : _(msg`An unknown error occurred`)}
        </p>
        {children}
        {retry && (
          <Button color="primary" onClick={retry}>
            {retryLabel || <Trans>Try again</Trans>}
          </Button>
        )}
      </div>
    </div>
  )
}
