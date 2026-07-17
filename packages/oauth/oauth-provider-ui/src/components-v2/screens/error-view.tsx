import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import type { ReactNode } from 'react'
import { apiErrorParser } from '#/lib/api-error-parser.ts'
import { type ErrorParser, parseError } from '#/lib/error-parser.ts'
import { Button } from '../atoms/button.tsx'
import { AuthShell } from '../templates/auth-shell.tsx'

export type ErrorViewProps = {
  error: unknown
  parser?: ErrorParser
  retry?: () => void
  retryLabel?: ReactNode
  children?: ReactNode
}

/**
 * v2 restyle of `#/components/error-view.tsx`. Renders inside the shared
 * `AuthShell` (same page chrome — globe, footer — as the sign-in flow) with a
 * card that mirrors `AuthCard`'s structure: a meta bar (brand wordmark + an
 * error-colored tag) and a serif title. The HTTP status code is intentionally
 * not surfaced — `ParsedError` doesn't carry one, and it's not useful to most
 * users anyway.
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
  const description = parsed.description
    ? _(parsed.description)
    : _(msg`An unknown error occurred`)

  return (
    <AuthShell>
      <div className="sm:bg-surface-1 sm:border-surface-border sm:shadow-card sm:rounded-card relative z-10 m-auto w-full max-w-[540px] sm:overflow-hidden sm:border">
        <div className="border-surface-border text-ink-light hidden items-center justify-between gap-4 border-b px-5 py-3 font-mono text-xs sm:flex">
          <span className="text-ink truncate font-bold">
            <Trans>Atmosphere Account</Trans>
          </span>
          <span className="text-error uppercase tracking-wide">
            <Trans context="error meta tag">Error</Trans>
          </span>
        </div>

        <div className="flex flex-col px-5 pb-10 pt-10 sm:px-10 sm:pt-8">
          <h1 className="text-ink mb-3 font-serif text-3xl font-semibold leading-tight">
            <Trans>Something went wrong</Trans>
          </h1>
          <p className="text-ink-light mb-8 font-mono text-sm leading-relaxed">
            {description}
          </p>

          {retry && (
            <Button className="self-start" color="primary" onClick={retry}>
              {retryLabel || <Trans>Try again</Trans>}
            </Button>
          )}

          {children}
        </div>
      </div>
    </AuthShell>
  )
}
